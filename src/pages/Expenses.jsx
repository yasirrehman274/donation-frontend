import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatPKR, formatDate, getTodayDate, CATEGORIES } from '../utils/helpers';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, Thead, Td, Tr, EmptyRow } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input, { Textarea } from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { confirmDelete } from '../utils/alert';

const emptyForm = { purpose: '', category: 'General', amount: '', date: getTodayDate(), notes: '' };

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense, getCurrentBalance, showNotification } = useData();
  const [form, setForm] = useState(emptyForm);
  const [editData, setEditData] = useState(null);
  const [filter, setFilter] = useState({ from: '', to: '', category: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.purpose || !form.amount || !form.date) return showNotification('Please fill all required fields!', 'error');
    if (Number(form.amount) > getCurrentBalance()) return showNotification(`Insufficient balance! Available: ${formatPKR(getCurrentBalance())}`, 'error');
    addExpense({ ...form, amount: Number(form.amount) });
    setForm(emptyForm);
  };

  const handleUpdate = () => {
    if (!editData.purpose || !editData.amount || !editData.date) return showNotification('Please fill all required fields!', 'error');
    updateExpense(editData.id, { ...editData, amount: Number(editData.amount) });
    setEditData(null);
  };

  const handleDelete = async (id) => {
    const { isConfirmed } = await confirmDelete();
    if (isConfirmed) deleteExpense(id);
  };

  let filtered = [...expenses];
  if (filter.from) filtered = filtered.filter((e) => e.date >= filter.from);
  if (filter.to) filtered = filtered.filter((e) => e.date <= filter.to);
  if (filter.category) filtered = filtered.filter((e) => e.category === filter.category);
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon="fa-plus-circle" title="Add New Expense" />
        <CardBody>
          <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Input label="Purpose / Description *" name="purpose" value={form.purpose} onChange={handleChange} placeholder="Where was donation used?" />
            <Select label="Category" name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Amount (PKR) *" type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="Enter amount" min="1" />
            <Input label="Date *" type="date" name="date" value={form.date} onChange={handleChange} />
            <div className="md:col-span-2">
              <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} rows="2" placeholder="Details..." />
            </div>
            <div className="md:col-span-2">
              <Button type="submit"><i className="fas fa-save"></i> Save Expense</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="fa-filter" title="Filter Expenses" />
        <CardBody>
          <div className="flex flex-wrap gap-4 items-end">
            <Input label="From Date" type="date" value={filter.from} onChange={(e) => setFilter({ ...filter, from: e.target.value })} />
            <Input label="To Date" type="date" value={filter.to} onChange={(e) => setFilter({ ...filter, to: e.target.value })} />
            <Select label="Category" value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
              <option value="">All</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Button variant="secondary" onClick={() => setFilter({ from: '', to: '', category: '' })}><i className="fas fa-redo"></i> Reset</Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="fa-list" title="All Expenses" action={<Badge>{filtered.length}</Badge>} />
        <CardBody>
          <Table>
            <Thead columns={['#', 'Purpose', 'Category', 'Amount', 'Date', 'Notes', 'Actions']} />
            <tbody>
              {filtered.length === 0 ? (
                <EmptyRow colSpan={7} message="No expenses found" />
              ) : filtered.map((e, i) => (
                <Tr key={e.id}>
                  <Td>{i + 1}</Td>
                  <Td className="font-semibold">{e.purpose}</Td>
                  <Td><Badge>{e.category}</Badge></Td>
                  <Td className="amount-negative">{formatPKR(e.amount)}</Td>
                  <Td>{formatDate(e.date)}</Td>
                  <Td>{e.notes || '-'}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button variant="warning" size="xs" onClick={() => setEditData({ ...e })}><i className="fas fa-edit"></i></Button>
                      <Button variant="danger" size="xs" onClick={() => handleDelete(e.id)}><i className="fas fa-trash"></i></Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold border-t-2 border-dark">
                <Td colSpan={3}>Total</Td>
                <Td>{formatPKR(total)}</Td>
                <Td colSpan={3}></Td>
              </tr>
            </tfoot>
          </Table>
        </CardBody>
      </Card>

      <Modal title="Edit Expense" isOpen={!!editData} onClose={() => setEditData(null)}>
        {editData && (
          <>
            <Input label="Purpose *" value={editData.purpose} onChange={(e) => setEditData({ ...editData, purpose: e.target.value })} />
            <Select label="Category" value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Amount (PKR) *" type="number" value={editData.amount} onChange={(e) => setEditData({ ...editData, amount: e.target.value })} min="1" />
            <Input label="Date *" type="date" value={editData.date} onChange={(e) => setEditData({ ...editData, date: e.target.value })} />
            <Textarea label="Notes" value={editData.notes || ''} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows="2" />
            <Button onClick={handleUpdate}><i className="fas fa-save"></i> Update Expense</Button>
          </>
        )}
      </Modal>
    </div>
  );
}
