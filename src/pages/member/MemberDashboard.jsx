import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { useData } from '../../context/DataContext';
import { getApiError, formatPKR, formatDate } from '../../utils/helpers';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Table, Thead, Td, Tr, EmptyRow } from '../../components/ui/Table';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';

const statusLabel = (status) => {
  const labels = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
  return labels[status] || status;
};

export default function MemberDashboard() {
  const navigate = useNavigate();
  const { donations } = useData();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    try {
      const data = await dashboardApi.mine();
      setStats(data);
    } catch (err) {
      setError(getApiError(err));
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthDonation = donations
    .filter((d) => (d.month || (d.date || '').slice(0, 7)) === currentMonth)
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const lastDonationDate = donations.length
    ? donations.reduce((latest, d) => (d.date > latest ? d.date : latest), donations[0].date)
    : null;

  if (!stats) {
    return error ? (
      <Card>
        <CardBody>
          <p className="text-danger font-semibold flex items-center gap-2"><i className="fas fa-exclamation-circle"></i>{error}</p>
        </CardBody>
      </Card>
    ) : (
      <Loader />
    );
  }

  const { totals } = stats;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          icon="fa-heart"
          title="My Donation Summary"
          action={
            <Button onClick={() => navigate('/member/add-donation')}>
              <i className="fas fa-plus-circle"></i> Add Donation
            </Button>
          }
        />
      </Card>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Current Month" value={formatPKR(currentMonthDonation)} icon="fa-calendar-day" color="blue" />
        <StatCard title="Total Donation" value={formatPKR(totals.approved + totals.pending + totals.rejected)} icon="fa-donate" color="green" />
        <StatCard title="Approved" value={formatPKR(totals.approved)} icon="fa-check-circle" color="green" />
        <StatCard title="Pending" value={formatPKR(totals.pending)} icon="fa-clock" color="orange" />
        <StatCard title="Last Donation" value={lastDonationDate ? formatDate(lastDonationDate) : '-'} icon="fa-history" color="blue" />
      </div>

      <Card>
        <CardHeader icon="fa-clock" title="Recent Donation History" />
        <CardBody>
          <Table>
            <Thead columns={['#', 'Date', 'Amount', 'Payment Method', 'Status']} />
            <tbody>
              {stats.recentDonations.length === 0 ? (
                <EmptyRow colSpan={5} message="No donations yet" />
              ) : stats.recentDonations.map((d, i) => (
                <Tr key={d.id}>
                  <Td>{i + 1}</Td>
                  <Td>{formatDate(d.date)}</Td>
                  <Td className="amount-positive">{formatPKR(d.amount)}</Td>
                  <Td>{d.paymentMethod || '-'}</Td>
                  <Td><Badge status={d.status}>{statusLabel(d.status)}</Badge></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {donations.length === 0 && (
        <p className="text-sm text-gray-500 text-center">
          No donations submitted yet. <button onClick={() => navigate('/member/add-donation')} className="text-primary font-semibold underline">Submit your first donation</button>.
        </p>
      )}
    </div>
  );
}
