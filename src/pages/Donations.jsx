import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatPKR, formatDate, getTodayDate } from '../utils/helpers';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, Thead, Td, Tr, EmptyRow } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input, { Textarea } from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

const emptyForm = { donorName: '', phone: '', amount: '', date: getTodayDate(), notes: '' };

export default function Donations() {
  const { donations, donors, addDonation, updateDonation, deleteDonation, showNotification } = useData();
  const [form, setForm] = useState(emptyForm);
  const [editData, setEditData] = useState(null);
  const [filter, setFilter] = useState({ from: '', to: '', donor: '' });

  const donorOptions = [...new Set([
    ...donors.map((d) => (d.name || d.donorName || '').trim()).filter(Boolean),
    ...donations.map((d) => (d.donorName || '').trim()).filter(Boolean),
  ])].sort((a, b) => a.localeCompare(b));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDonorChange = (e) => {
    const donorName = e.target.value;
    const selectedDonor = donors.find((d) => (d.name || d.donorName || '').toLowerCase() === donorName.toLowerCase());
    setForm({ ...form, donorName, phone: selectedDonor?.phone || '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.donorName || !form.amount || !form.date) return showNotification('Please fill all required fields!', 'error');
    addDonation({ ...form, amount: Number(form.amount) });
    setForm(emptyForm);
  };

  const handleUpdate = () => {
    if (!editData.donorName || !editData.amount || !editData.date) return showNotification('Please fill all required fields!', 'error');
    updateDonation(editData.id, { ...editData, amount: Number(editData.amount) });
    setEditData(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this donation?')) deleteDonation(id);
  };

  let filtered = [...donations];
  if (filter.from) filtered = filtered.filter((d) => d.date >= filter.from);
  if (filter.to) filtered = filtered.filter((d) => d.date <= filter.to);
  if (filter.donor) filtered = filtered.filter((d) => d.donorName.toLowerCase().includes(filter.donor.toLowerCase()));
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  const total = filtered.reduce((s, d) => s + Number(d.amount), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon="fa-plus-circle" title="Add New Donation" />
        <CardBody>
          <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Select label="Donor Name *" name="donorName" value={form.donorName} onChange={handleDonorChange}>
              <option value="">-- Select donor --</option>
              {donorOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Select>
            <Input label="Amount (PKR) *" type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="Enter amount" min="1" />
            <Input label="Date *" type="date" name="date" value={form.date} onChange={handleChange} />
            <div>
              <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} rows="2" placeholder="Notes..." />
            </div>
            <div className="md:col-span-2">
              <Button type="submit"><i className="fas fa-save"></i> Save Donation</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="fa-filter" title="Filter Donations" />
        <CardBody>
          <div className="flex flex-wrap gap-4 items-end">
            <Input label="From Date" type="date" value={filter.from} onChange={(e) => setFilter({ ...filter, from: e.target.value })} />
            <Input label="To Date" type="date" value={filter.to} onChange={(e) => setFilter({ ...filter, to: e.target.value })} />
            <Input label="Donor Name" value={filter.donor} onChange={(e) => setFilter({ ...filter, donor: e.target.value })} placeholder="Search..." />
            <Button variant="secondary" onClick={() => setFilter({ from: '', to: '', donor: '' })}><i className="fas fa-redo"></i> Reset</Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="fa-list" title="All Donations" action={<Badge>{filtered.length}</Badge>} />
        <CardBody>
          <Table>
            <Thead columns={['#', 'Donor Name', 'Phone', 'Amount (PKR)', 'Date', 'Notes', 'Actions']} />
            <tbody>
              {filtered.length === 0 ? (
                <EmptyRow colSpan={7} message="No donations found" />
              ) : filtered.map((d, i) => (
                <Tr key={d.id}>
                  <Td>{i + 1}</Td>
                  <Td className="font-semibold">{d.donorName}</Td>
                  <Td>{d.phone || '-'}</Td>
                  <Td className="amount-positive">{formatPKR(d.amount)}</Td>
                  <Td>{formatDate(d.date)}</Td>
                  <Td>{d.notes || '-'}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button variant="warning" size="xs" onClick={() => setEditData({ ...d })}><i className="fas fa-edit"></i></Button>
                      <Button variant="danger" size="xs" onClick={() => handleDelete(d.id)}><i className="fas fa-trash"></i></Button>
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

      <Modal title="Edit Donation" isOpen={!!editData} onClose={() => setEditData(null)}>
        {editData && (
          <>
            <Select label="Donor Name *" value={editData.donorName} onChange={(e) => setEditData({ ...editData, donorName: e.target.value })}>
              <option value="">-- Select donor --</option>
              {donorOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Select>
            <Input label="Phone" value={editData.phone || ''} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
            <Input label="Amount (PKR) *" type="number" value={editData.amount} onChange={(e) => setEditData({ ...editData, amount: e.target.value })} min="1" />
            <Input label="Date *" type="date" value={editData.date} onChange={(e) => setEditData({ ...editData, date: e.target.value })} />
            <Textarea label="Notes" value={editData.notes || ''} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows="2" />
            <Button onClick={handleUpdate}><i className="fas fa-save"></i> Update Donation</Button>
          </>
        )}
      </Modal>
    </div>
  );
}
