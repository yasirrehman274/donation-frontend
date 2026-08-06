import React, { useState } from "react";
import { useData } from "../context/DataContext";
import {
  formatPKR,
  formatDate,
  getTodayDate,
  MONTH_NAMES,
} from "../utils/helpers";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Table, Thead, Td, Tr, EmptyRow } from "../components/ui/Table";
import Button from "../components/ui/Button";
import Input, { Textarea } from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import { confirmDelete } from "../utils/alert";

// Derive "YYYY-MM" from a "YYYY-MM-DD" date string
const monthFromDate = (dateStr) => (dateStr ? dateStr.slice(0, 7) : "");

const emptyForm = {
  amount: "",
  date: getTodayDate(),
  notes: "",
};

const formatMonth = (monthStr) => {
  if (!monthStr) return "-";
  const [y, m] = monthStr.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
};

export default function Surplus() {
  const {
    surplus,
    addSurplus,
    updateSurplus,
    deleteSurplus,
    getTotalSurplus,
    showNotification,
  } = useData();
  const [form, setForm] = useState(emptyForm);
  const [editData, setEditData] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.date)
      return showNotification("Please fill all required fields!", "error");

    const month = monthFromDate(form.date);
    const alreadyExists = surplus.some((s) => monthFromDate(s.date) === month);
    if (alreadyExists)
      return showNotification(
        "Surplus for this month is already recorded! Edit it instead.",
        "error",
      );

    addSurplus({ ...form, month, amount: Number(form.amount) });
    setForm({ ...emptyForm, date: getTodayDate() });
  };

  const handleUpdate = () => {
    if (!editData.amount || !editData.date)
      return showNotification("Please fill all required fields!", "error");
    updateSurplus(editData.id, {
      ...editData,
      month: monthFromDate(editData.date),
      amount: Number(editData.amount),
    });
    setEditData(null);
  };

  const handleDelete = async (id) => {
    const { isConfirmed } = await confirmDelete();
    if (isConfirmed) deleteSurplus(id);
  };

  const sorted = [...surplus].sort((a, b) =>
    (b.date || "").localeCompare(a.date || ""),
  );
  const total = getTotalSurplus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          icon="fa-piggy-bank"
          title="Add Monthly Bank Profit (Surplus)"
        />
        <CardBody>
          <p className="text-sm text-gray-500 mb-4">
            Record the profit amount the bank gives every month. The month is
            automatically taken from the date you select below, and this
            amount is added to the overall fund balance and shown in Reports.
          </p>
          <form
            onSubmit={handleSubmit}
            className="grid gap-4 grid-cols-1 md:grid-cols-2"
          >
            <Input
              label="Date Received *"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
            <Input
              label="Profit Amount (PKR) *"
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Enter bank profit (e.g. 1500.50)"
              step="0.01"
              min="0.01"
            />

            <div className="md:col-span-2">
              <Textarea
                label="Notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="2"
                placeholder="e.g. Bank statement reference..."
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">
                <i className="fas fa-save"></i> Save Surplus
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          icon="fa-list"
          title="All Monthly Surplus Entries"
          action={<Badge>{sorted.length}</Badge>}
        />
        <CardBody>
          <Table>
            <Thead
              columns={[
                "#",
                "Month",
                "Profit Amount",
                "Date Received",
                "Notes",
                "Actions",
              ]}
            />
            <tbody>
              {sorted.length === 0 ? (
                <EmptyRow colSpan={6} message="No surplus recorded yet" />
              ) : (
                sorted.map((s, i) => (
                  <Tr key={s.id}>
                    <Td>{i + 1}</Td>
                    <Td className="font-semibold">
                      {formatMonth(monthFromDate(s.date))}
                    </Td>
                    <Td className="amount-positive">{formatPKR(s.amount)}</Td>
                    <Td>{formatDate(s.date)}</Td>
                    <Td>{s.notes || "-"}</Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button
                          variant="warning"
                          size="xs"
                          onClick={() => setEditData({ ...s })}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="danger"
                          size="xs"
                          onClick={() => handleDelete(s.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold border-t-2 border-dark">
                <Td colSpan={2}>Total Surplus (Added to Balance)</Td>
                <Td className="amount-positive">{formatPKR(total)}</Td>
                <Td colSpan={3}></Td>
              </tr>
            </tfoot>
          </Table>
        </CardBody>
      </Card>

      <Modal
        title="Edit Surplus"
        isOpen={!!editData}
        onClose={() => setEditData(null)}
      >
        {editData && (
          <>
            <Input
              label="Date Received *"
              type="date"
              value={editData.date}
              onChange={(e) =>
                setEditData({ ...editData, date: e.target.value })
              }
            />
            <Input
              label="Profit Amount (PKR) *"
              type="number"
              value={editData.amount}
              onChange={(e) =>
                setEditData({ ...editData, amount: e.target.value })
              }
              step="0.01"
              min="0.01"
            />
            <Textarea
              label="Notes"
              value={editData.notes || ""}
              onChange={(e) =>
                setEditData({ ...editData, notes: e.target.value })
              }
              rows="2"
            />
            <Button onClick={handleUpdate}>
              <i className="fas fa-save"></i> Update Surplus
            </Button>
          </>
        )}
      </Modal>
    </div>
  );
}
