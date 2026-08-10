import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatPKR, formatDate, getTodayDate, sanitizePhone, isValidPhone, PHONE_ERROR, PHONE_MAX_LENGTH } from '../utils/helpers';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, Thead, Td, Tr, EmptyRow } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input, { Textarea } from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { confirmApprove, confirmReject, confirmDelete } from '../utils/alert';

const emptyForm = { donorName: '', phone: '', amount: '', date: getTodayDate(), notes: '' };

const statusLabel = (status) => {
  const labels = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
  return labels[status] || status;
};

export default function Donations() {
  const {
    donations, donors, addDonation, updateDonation, deleteDonation,
    approveDonation, rejectDonation, showNotification,
  } = useData();
  const [form, setForm] = useState(emptyForm);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [filter, setFilter] = useState({ from: '', to: '', donor: '' });
  const [saving, setSaving] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [busyId, setBusyId] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!form.donorName || !form.amount || !form.date) return showNotification('Please fill all required fields!', 'error');
    setSaving(true);
    try {
      await addDonation({ ...form, amount: Number(form.amount) });
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (savingEdit) return;
    if (!editData.donorName || !editData.amount || !editData.date) return showNotification('Please fill all required fields!', 'error');
    if (editData.phone && !isValidPhone(editData.phone)) return showNotification(PHONE_ERROR, 'error');
    setSavingEdit(true);
    try {
      await updateDonation(editData.id, { ...editData, amount: Number(editData.amount) });
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
      await deleteDonation(id);
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = async (id) => {
    const { isConfirmed } = await confirmApprove();
    if (!isConfirmed) return;
    setBusyId(id);
    try {
      await approveDonation(id);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    const { isConfirmed } = await confirmReject();
    if (!isConfirmed) return;
    setBusyId(id);
    try {
      await rejectDonation(id);
    } finally {
      setBusyId(null);
    }
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
              <Button type="submit" loading={saving}><i className="fas fa-save"></i> Save Donation</Button>
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
            <Thead columns={['#', 'Donor Name', 'Phone', 'Amount (PKR)', 'Date', 'Payment Method', 'Status', 'Screenshot', 'Actions']} />
            <tbody>
              {filtered.length === 0 ? (
                <EmptyRow colSpan={9} message="No donations found" />
              ) : filtered.map((d, i) => (
                <Tr key={d.id}>
                  <Td>{i + 1}</Td>
                  <Td className="font-semibold">{d.donorName}</Td>
                  <Td>{d.phone || '-'}</Td>
                  <Td className="amount-positive">{formatPKR(d.amount)}</Td>
                  <Td>{formatDate(d.date)}</Td>
                  <Td>{d.paymentMethod || '-'}</Td>
                  <Td><Badge status={d.status}>{statusLabel(d.status)}</Badge></Td>
                  <Td>
                    {d.screenshot ? (
                      <a href={d.screenshot} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        <i className="fas fa-image"></i> View
                      </a>
                    ) : (
                      '-'
                    )}
                  </Td>
                  <Td>
                    <div className="flex gap-1 flex-wrap">
                      <Button size="xs" onClick={() => setViewData({ ...d })} title="View"><i className="fas fa-eye"></i></Button>
                      {d.status === 'pending' && (
                        <>
                          <Button variant="success" size="xs" onClick={() => handleApprove(d.id)} loading={busyId === d.id} disabled={busyId !== null && busyId !== d.id} title="Approve"><i className="fas fa-check"></i> Approve</Button>
                          <Button variant="danger" size="xs" onClick={() => handleReject(d.id)} loading={busyId === d.id} disabled={busyId !== null && busyId !== d.id} title="Reject"><i className="fas fa-times"></i> Reject</Button>
                        </>
                      )}
                      <Button variant="warning" size="xs" onClick={() => setEditData({ ...d })} title="Edit"><i className="fas fa-edit"></i></Button>
                      <Button variant="danger" size="xs" onClick={() => handleDelete(d.id)} loading={busyId === d.id} disabled={busyId !== null && busyId !== d.id} title="Delete"><i className="fas fa-trash"></i></Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold border-t-2 border-dark">
                <Td colSpan={3}>Total</Td>
                <Td>{formatPKR(total)}</Td>
                <Td colSpan={5}></Td>
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
            <Input label="Phone" value={editData.phone || ''} onChange={(e) => setEditData({ ...editData, phone: sanitizePhone(e.target.value) })} maxLength={PHONE_MAX_LENGTH} inputMode="numeric" />
            <Input label="Amount (PKR) *" type="number" value={editData.amount} onChange={(e) => setEditData({ ...editData, amount: e.target.value })} min="1" />
            <Input label="Date *" type="date" value={editData.date} onChange={(e) => setEditData({ ...editData, date: e.target.value })} />
            <Textarea label="Notes" value={editData.notes || ''} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows="2" />
            <Button onClick={handleUpdate} loading={savingEdit}><i className="fas fa-save"></i> Update Donation</Button>
          </>
        )}
      </Modal>

      <Modal title="Donation Details" isOpen={!!viewData} onClose={() => setViewData(null)}>
        {viewData && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500 font-medium">Donor</span><span className="font-semibold text-dark">{viewData.donorName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 font-medium">Phone</span><span>{viewData.phone || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 font-medium">Amount</span><span className="amount-positive">{formatPKR(viewData.amount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 font-medium">Date</span><span>{formatDate(viewData.date)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 font-medium">Payment Method</span><span>{viewData.paymentMethod || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 font-medium">Status</span><Badge status={viewData.status}>{statusLabel(viewData.status)}</Badge></div>
            <div className="flex justify-between"><span className="text-gray-500 font-medium">Notes</span><span>{viewData.notes || '-'}</span></div>
            {viewData.screenshot && (
              <div>
                <p className="text-gray-500 font-medium mb-2">Screenshot</p>
                <a href={viewData.screenshot} target="_blank" rel="noreferrer">
                  <img src={viewData.screenshot} alt="Donation screenshot" className="rounded-lg border-2 border-gray-100 max-h-72 mx-auto" />
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
