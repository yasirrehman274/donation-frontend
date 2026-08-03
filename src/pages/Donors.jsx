import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatPKR, formatDate } from '../utils/helpers';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, Thead, Td, Tr, EmptyRow } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Donors() {
  const { donations } = useData();
  const [search, setSearch] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);

  const donorMap = {};
  donations.forEach((d) => {
    const key = d.donorName.toLowerCase();
    if (!donorMap[key]) donorMap[key] = { name: d.donorName, phone: d.phone || '', totalAmount: 0, count: 0 };
    donorMap[key].totalAmount += Number(d.amount);
    donorMap[key].count++;
    if (d.phone && !donorMap[key].phone) donorMap[key].phone = d.phone;
  });

  let donors = Object.values(donorMap);
  if (search) donors = donors.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
  donors.sort((a, b) => b.totalAmount - a.totalAmount);

  const donorDonations = selectedDonor
    ? donations.filter((d) => d.donorName.toLowerCase() === selectedDonor.toLowerCase()).sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];
  const donorTotal = donorDonations.reduce((s, d) => s + Number(d.amount), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon="fa-users" title="All Donors & Their Contributions" />
        <CardBody>
          <div className="max-w-xs mb-4">
            <Input placeholder="Search donor by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Table>
            <Thead columns={['#', 'Donor Name', 'Phone', 'Total Donated', 'Count', 'Action']} />
            <tbody>
              {donors.length === 0 ? (
                <EmptyRow colSpan={6} message="No donors found" />
              ) : donors.map((d, i) => (
                <Tr key={i}>
                  <Td>{i + 1}</Td>
                  <Td className="font-semibold">{d.name}</Td>
                  <Td>{d.phone || '-'}</Td>
                  <Td className="amount-positive">{formatPKR(d.totalAmount)}</Td>
                  <Td>{d.count}</Td>
                  <Td><Button size="xs" onClick={() => setSelectedDonor(d.name)}><i className="fas fa-eye"></i> View</Button></Td>
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
    </div>
  );
}
