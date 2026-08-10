import React from 'react';
import { useData } from '../context/DataContext';
import { formatPKR, formatDate, MONTH_NAMES } from '../utils/helpers';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, Thead, Td, Tr, EmptyRow } from '../components/ui/Table';
import StatCard from '../components/ui/StatCard';

export default function Dashboard() {
  const {
    donations, expenses, loans, repayments, surplus,
    getTotalDonations, getTotalExpenses, getActiveLoansTotal, getCurrentBalance, getTotalSurplus,
  } = useData();

  const organization = {
    founderName: 'Syed Zahid Ali',
    // founderImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    motive: 'To support our family members in times of financial difficulty by building a collective welfare fund through regular contributions, ensuring that no family member faces a difficult situation alone.',
  };

  const recentDonations = [...donations].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const year = new Date().getFullYear();

  const getMonthlyData = (m) => {
    const inMonth = (d) => { const dt = new Date(d); return dt.getFullYear() === year && dt.getMonth() === m; };
    const don = donations.filter((d) => inMonth(d.date)).reduce((s, d) => s + Number(d.amount), 0);
    const exp = expenses.filter((e) => inMonth(e.date)).reduce((s, e) => s + Number(e.amount), 0);
    const loan = loans.filter((l) => inMonth(l.date)).reduce((s, l) => s + Number(l.amount), 0);
    const repaid = repayments.filter((r) => inMonth(r.date)).reduce((s, r) => s + Number(r.amount), 0);
    const sur = surplus.filter((s) => inMonth(s.date)).reduce((s2, s) => s2 + Number(s.amount), 0);
    return { don, exp, loan, repaid, sur, balance: don - exp - loan + repaid + sur };
  };

  const stats = [
    { title: 'Total Donations', value: getTotalDonations(), color: 'blue', icon: 'fa-donate' },
    { title: 'Total Expenses', value: getTotalExpenses(), color: 'red', icon: 'fa-money-bill-wave' },
    { title: 'Active Loans', value: getActiveLoansTotal(), color: 'orange', icon: 'fa-handshake' },
    { title: 'Total Surplus', value: getTotalSurplus(), color: 'green', icon: 'fa-piggy-bank' },
    { title: 'Current Balance', value: getCurrentBalance(), color: 'green', icon: 'fa-wallet' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon="fa-user-tie" title="About Our Organization" />
        <CardBody>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
            <img
              src={organization.founderImage}
              alt={organization.founderName}
              className="w-28 h-28 rounded-full object-cover border-4 border-primary/10 shadow-sm"
            />
            <div className="space-y-2 text-sm text-gray-700">
              <div>
                <span className="font-semibold text-dark">Founder Name:</span> {organization.founderName}
              </div>
              <div>
                <span className="font-semibold text-dark">Organization Motive:</span> {organization.motive}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard key={i} title={s.title} value={formatPKR(s.value)} icon={s.icon} color={s.color} />
        ))}
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader icon="fa-clock" title="Recent Donations" />
          <CardBody>
            <Table>
              <Thead columns={['Donor', 'Amount', 'Date']} />
              <tbody>
                {recentDonations.length === 0 ? (
                  <EmptyRow colSpan={3} message="No donations yet" />
                ) : recentDonations.map((d) => (
                  <Tr key={d.id}>
                    <Td>{d.donorName}</Td>
                    <Td className="amount-positive">{formatPKR(d.amount)}</Td>
                    <Td>{formatDate(d.date)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader icon="fa-clock" title="Recent Expenses" />
          <CardBody>
            <Table>
              <Thead columns={['Purpose', 'Amount', 'Date']} />
              <tbody>
                {recentExpenses.length === 0 ? (
                  <EmptyRow colSpan={3} message="No expenses yet" />
                ) : recentExpenses.map((e) => (
                  <Tr key={e.id}>
                    <Td>{e.purpose}</Td>
                    <Td className="amount-negative">{formatPKR(e.amount)}</Td>
                    <Td>{formatDate(e.date)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader icon="fa-calendar-alt" title={`Monthly Summary (${year})`} />
        <CardBody>
          <Table>
            <Thead columns={['Month', 'Donations', 'Expenses', 'Loans Given', 'Loan Repaid', 'Surplus', 'Balance']} />
            <tbody>
              {MONTH_NAMES.map((month, m) => {
                const d = getMonthlyData(m);
                if (!d.don && !d.exp && !d.loan && !d.repaid && !d.sur) return null;
                return (
                  <Tr key={m}>
                    <Td className="font-semibold">{month}</Td>
                    <Td className="amount-positive">{formatPKR(d.don)}</Td>
                    <Td className="amount-negative">{formatPKR(d.exp)}</Td>
                    <Td>{formatPKR(d.loan)}</Td>
                    <Td className="amount-positive">{formatPKR(d.repaid)}</Td>
                    <Td className="amount-positive">{formatPKR(d.sur)}</Td>
                    <Td className={d.balance >= 0 ? 'amount-positive' : 'amount-negative'}>{formatPKR(d.balance)}</Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
