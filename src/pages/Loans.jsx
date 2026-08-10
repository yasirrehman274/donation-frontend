import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatPKR, formatDate, getTodayDate, sanitizePhone, isValidPhone, PHONE_ERROR, PHONE_MAX_LENGTH } from '../utils/helpers';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, Thead, Td, Tr, EmptyRow } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input, { Textarea } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { confirmDelete } from '../utils/alert';

const emptyForm = { borrowerName: '', phone: '', cnic: '', amount: '', date: getTodayDate(), returnDate: '', notes: '' };

export default function Loans() {
  const { loans, addLoan, updateLoan, deleteLoan, getLoanTotalRepaid, getCurrentBalance, showNotification } = useData();
  const [form, setForm] = useState(emptyForm);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.name === 'phone' ? sanitizePhone(e.target.value) : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!form.borrowerName || !form.amount || !form.date) return showNotification('Please fill all required fields!', 'error');
    if (form.phone && !isValidPhone(form.phone)) return showNotification(PHONE_ERROR, 'error');
    if (Number(form.amount) > getCurrentBalance()) return showNotification(`Insufficient balance! Available: ${formatPKR(getCurrentBalance())}`, 'error');
    setSaving(true);
    try {
      await addLoan({ ...form, amount: Number(form.amount) });
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (savingEdit) return;
    if (!editData.borrowerName || !editData.amount || !editData.date) return showNotification('Please fill all required fields!', 'error');
    if (editData.phone && !isValidPhone(editData.phone)) return showNotification(PHONE_ERROR, 'error');
    setSavingEdit(true);
    try {
      await updateLoan(editData.id, { ...editData, amount: Number(editData.amount) });
      setEditData(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id) => {
    const { isConfirmed } = await confirmDelete();
    if (!isConfirmed) return;
    setBusyId(id);
    try {
      await deleteLoan(id);
    } finally {
      setBusyId(null);
    }
  };

  const sorted = [...loans].sort((a, b) => new Date(b.date) - new Date(a.date));
  let totalLoan = 0, totalRepaid = 0, totalRemaining = 0;
  sorted.forEach((l) => {
    const repaid = getLoanTotalRepaid(l.id);
    totalLoan += Number(l.amount); totalRepaid += repaid; totalRemaining += Math.max(0, Number(l.amount) - repaid);
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon="fa-plus-circle" title="Give New Loan (From Donation Fund)" />
        <CardBody>
          <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Input label="Borrower Name *" name="borrowerName" value={form.borrowerName} onChange={handleChange} placeholder="Who is taking?" />
            <Input label="Phone Number" name="phone" value={form.phone} onChange={handleChange} placeholder="03XX XXXXXXX" maxLength={PHONE_MAX_LENGTH} inputMode="numeric" />
            <Input label="CNIC / ID" name="cnic" value={form.cnic} onChange={handleChange} placeholder="CNIC" />
            <Input label="Loan Amount (PKR) *" type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" min="1" />
            <Input label="Date Given *" type="date" name="date" value={form.date} onChange={handleChange} />
            <Input label="Expected Return Date" type="date" name="returnDate" value={form.returnDate} onChange={handleChange} />
            <div className="md:col-span-2">
              <Textarea label="Purpose / Notes" name="notes" value={form.notes} onChange={handleChange} rows="2" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" loading={saving}><i className="fas fa-save"></i> Save Loan</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="fa-list" title="All Loans" action={<Badge>{sorted.length}</Badge>} />
        <CardBody>
          <Table>
            <Thead columns={['#', 'Borrower', 'Phone', 'CNIC', 'Loan', 'Repaid', 'Remaining', 'Date Given', 'Return Date', 'Status', 'Actions']} />
            <tbody>
              {sorted.length === 0 ? (
                <EmptyRow colSpan={11} message="No loans found" />
              ) : sorted.map((l, i) => {
                const repaid = getLoanTotalRepaid(l.id);
                const remaining = Number(l.amount) - repaid;
                let status = 'active', text = 'Active';
                if (remaining <= 0) { status = 'paid'; text = 'Fully Paid'; }
                else if (l.returnDate && new Date(l.returnDate) < new Date()) { status = 'overdue'; text = 'Overdue'; }
                return (
                  <Tr key={l.id}>
                    <Td>{i + 1}</Td>
                    <Td className="font-semibold">{l.borrowerName}</Td>
                    <Td>{l.phone || '-'}</Td>
                    <Td>{l.cnic || '-'}</Td>
                    <Td>{formatPKR(l.amount)}</Td>
                    <Td className="text-green-600">{formatPKR(repaid)}</Td>
                    <Td className={remaining > 0 ? 'amount-negative' : 'amount-positive'}>{formatPKR(Math.max(0, remaining))}</Td>
                    <Td>{formatDate(l.date)}</Td>
                    <Td>{l.returnDate ? formatDate(l.returnDate) : '-'}</Td>
                    <Td><Badge status={status}>{text}</Badge></Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button variant="warning" size="xs" onClick={() => setEditData({ ...l })}><i className="fas fa-edit"></i></Button>
                        <Button variant="danger" size="xs" onClick={() => handleDelete(l.id)} loading={busyId === l.id} disabled={busyId !== null && busyId !== l.id}><i className="fas fa-trash"></i></Button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold border-t-2 border-dark">
                <Td colSpan={4}>Totals</Td>
                <Td>{formatPKR(totalLoan)}</Td>
                <Td>{formatPKR(totalRepaid)}</Td>
                <Td>{formatPKR(totalRemaining)}</Td>
                <Td colSpan={4}></Td>
              </tr>
            </tfoot>
          </Table>
        </CardBody>
      </Card>

      <Modal title="Edit Loan" isOpen={!!editData} onClose={() => setEditData(null)}>
        {editData && (
          <>
            <Input label="Borrower Name *" value={editData.borrowerName} onChange={(e) => setEditData({ ...editData, borrowerName: e.target.value })} />
            <Input label="Phone" value={editData.phone || ''} onChange={(e) => setEditData({ ...editData, phone: sanitizePhone(e.target.value) })} maxLength={PHONE_MAX_LENGTH} inputMode="numeric" />
            <Input label="CNIC" value={editData.cnic || ''} onChange={(e) => setEditData({ ...editData, cnic: e.target.value })} />
            <Input label="Loan Amount (PKR) *" type="number" value={editData.amount} onChange={(e) => setEditData({ ...editData, amount: e.target.value })} min="1" />
            <Input label="Date Given *" type="date" value={editData.date} onChange={(e) => setEditData({ ...editData, date: e.target.value })} />
            <Input label="Return Date" type="date" value={editData.returnDate || ''} onChange={(e) => setEditData({ ...editData, returnDate: e.target.value })} />
            <Textarea label="Notes" value={editData.notes || ''} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows="2" />
            <Button onClick={handleUpdate} loading={savingEdit}><i className="fas fa-save"></i> Update Loan</Button>
          </>
        )}
      </Modal>
    </div>
  );
}
