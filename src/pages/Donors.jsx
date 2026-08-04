import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatPKR, formatDate } from '../utils/helpers';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, Thead, Td, Tr, EmptyRow } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

export default function Donors() {
  const { donations, donors, addDonor, updateDonor, deleteDonor, showNotification } = useData();
  const [search, setSearch] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [newDonor, setNewDonor] = useState({ name: '', phone: '' });
  const [editingDonor, setEditingDonor] = useState(null);

  const donorMap = {};
  donors.forEach((d) => {
    const key = (d.name || d.donorName || '').trim().toLowerCase();
    if (!key) return;
    if (!donorMap[key]) donorMap[key] = { id: d.id, name: d.name || d.donorName, phone: d.phone || '', totalAmount: 0, count: 0 };
    if (d.phone && !donorMap[key].phone) donorMap[key].phone = d.phone;
  });

  donations.forEach((d) => {
    const key = (d.donorName || '').trim().toLowerCase();
    if (!key) return;
    if (!donorMap[key]) donorMap[key] = { id: null, name: d.donorName, phone: d.phone || '', totalAmount: 0, count: 0 };
    donorMap[key].totalAmount += Number(d.amount);
    donorMap[key].count++;
    if (d.phone && !donorMap[key].phone) donorMap[key].phone = d.phone;
  });

  let donorsList = Object.values(donorMap);
  if (search) donorsList = donorsList.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
  donorsList.sort((a, b) => b.totalAmount - a.totalAmount);

  const donorDonations = selectedDonor
    ? donations.filter((d) => d.donorName.toLowerCase() === selectedDonor.toLowerCase()).sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];
  const donorTotal = donorDonations.reduce((s, d) => s + Number(d.amount), 0);

  const handleAddDonor = async (e) => {
    e.preventDefault();
    if (!newDonor.name.trim()) return showNotification('Please enter donor name!', 'error');

    const exists = donors.some((d) => (d.name || d.donorName || '').toLowerCase() === newDonor.name.trim().toLowerCase());
    if (exists) {
      showNotification('This donor already exists in the list!', 'error');
      return;
    }

    const created = await addDonor({ name: newDonor.name.trim(), phone: newDonor.phone.trim() });
    if (created) {
      setNewDonor({ name: '', phone: '' });
    }
  };

  const handleUpdateDonor = async () => {
    if (!editingDonor?.name?.trim()) return showNotification('Please enter donor name!', 'error');
    await updateDonor(editingDonor.id, { ...editingDonor, name: editingDonor.name.trim(), phone: (editingDonor.phone || '').trim() });
    setEditingDonor(null);
  };

  const handleDeleteDonor = async (donor) => {
    if (!donor?.id) return showNotification('This donor cannot be deleted from the saved donor list yet.', 'error');
    if (window.confirm(`Delete donor: ${donor.name}?`)) {
      await deleteDonor(donor.id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon="fa-user-plus" title="Add New Donor" />
        <CardBody>
          <form onSubmit={handleAddDonor} className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Input label="Donor Name *" value={newDonor.name} onChange={(e) => setNewDonor({ ...newDonor, name: e.target.value })} placeholder="Enter donor name" />
            <Input label="Phone Number" value={newDonor.phone} onChange={(e) => setNewDonor({ ...newDonor, phone: e.target.value })} placeholder="Enter phone" />
            <div className="flex items-end">
              <Button type="submit"><i className="fas fa-save"></i> Save Donor</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="fa-users" title="All Donors & Their Contributions" />
        <CardBody>
          <div className="max-w-xs mb-4">
            <Input placeholder="Search donor by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Table>
            <Thead columns={['#', 'Donor Name', 'Phone', 'Total Donated', 'Count', 'Action']} />
            <tbody>
              {donorsList.length === 0 ? (
                <EmptyRow colSpan={6} message="No donors found" />
              ) : donorsList.map((d, i) => (
                <Tr key={i}>
                  <Td>{i + 1}</Td>
                  <Td className="font-semibold">{d.name}</Td>
                  <Td>{d.phone || '-'}</Td>
                  <Td className="amount-positive">{formatPKR(d.totalAmount)}</Td>
                  <Td>{d.count}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="xs" onClick={() => setSelectedDonor(d.name)}><i className="fas fa-eye"></i></Button>
                      <Button variant="warning" size="xs" onClick={() => setEditingDonor(d)}><i className="fas fa-edit"></i></Button>
                      <Button variant="danger" size="xs" onClick={() => handleDeleteDonor(d)}><i className="fas fa-trash"></i></Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {selectedDonor && (
        <Card>
          <CardHeader
            icon="fa-user"
            title={`Donor Detail: ${selectedDonor}`}
            action={<Button variant="secondary" size="sm" onClick={() => setSelectedDonor(null)}>Close</Button>}
          />
          <CardBody>
            <Table>
              <Thead columns={['#', 'Amount', 'Date', 'Month', 'Notes']} />
              <tbody>
                {donorDonations.map((d, i) => (
                  <Tr key={d.id}>
                    <Td>{i + 1}</Td>
                    <Td className="amount-positive">{formatPKR(d.amount)}</Td>
                    <Td>{formatDate(d.date)}</Td>
                    <Td>{new Date(d.date).toLocaleString('en', { month: 'long', year: 'numeric' })}</Td>
                    <Td>{d.notes || '-'}</Td>
                  </Tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold border-t-2 border-dark">
                  <Td>Total</Td>
                  <Td>{formatPKR(donorTotal)}</Td>
                  <Td colSpan={3}></Td>
                </tr>
              </tfoot>
            </Table>
          </CardBody>
        </Card>
      )}

      <Modal title="Edit Donor" isOpen={!!editingDonor} onClose={() => setEditingDonor(null)}>
        {editingDonor && (
          <>
            <Input label="Donor Name *" value={editingDonor.name || ''} onChange={(e) => setEditingDonor({ ...editingDonor, name: e.target.value })} />
            <Input label="Phone Number" value={editingDonor.phone || ''} onChange={(e) => setEditingDonor({ ...editingDonor, phone: e.target.value })} />
            <Button onClick={handleUpdateDonor}><i className="fas fa-save"></i> Update Donor</Button>
          </>
        )}
      </Modal>
    </div>
  );
}
