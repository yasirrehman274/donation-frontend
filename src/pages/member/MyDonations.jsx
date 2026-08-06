import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { formatPKR, formatDate } from '../../utils/helpers';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Table, Thead, Td, Tr, EmptyRow } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const statusLabel = (status) => {
  const labels = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
  return labels[status] || status;
};

export default function MyDonations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justSubmitted = searchParams.get('submitted');
  const { donations } = useData();
  const [viewData, setViewData] = useState(null);

  const sorted = [...donations].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      {justSubmitted && (
        <div className="px-4 py-3 rounded-lg bg-green-50 border-2 border-success/30 text-success text-sm font-semibold flex items-center gap-2">
          <i className="fas fa-check-circle"></i>
          Your donation was submitted successfully. It is currently pending approval.
        </div>
      )}

      <Card>
        <CardHeader
          icon="fa-donate"
          title="My Donations"
          action={<Button onClick={() => navigate('/member/add-donation')}><i className="fas fa-plus-circle"></i> Add Donation</Button>}
        />
        <CardBody>
          <Table>
            <Thead columns={['Date', 'Amount', 'Payment Method', 'Status', 'Screenshot', 'Notes', 'Actions']} />
            <tbody>
              {sorted.length === 0 ? (
                <EmptyRow colSpan={7} message="No donations submitted yet" />
              ) : sorted.map((d) => (
                <Tr key={d.id}>
                  <Td>{formatDate(d.date)}</Td>
                  <Td className="amount-positive">{formatPKR(d.amount)}</Td>
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
                  <Td>{d.notes || '-'}</Td>
                  <Td><Button size="xs" onClick={() => setViewData({ ...d })}><i className="fas fa-eye"></i> View</Button></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Modal title="Donation Details" isOpen={!!viewData} onClose={() => setViewData(null)}>
        {viewData && (
          <div className="space-y-3 text-sm">
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
