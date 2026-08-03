import React from 'react';
import { useData } from '../context/DataContext';
import { formatPKR, formatDate, MONTH_NAMES } from '../utils/helpers';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, Thead, Td, Tr, EmptyRow } from '../components/ui/Table';
import StatCard from '../components/ui/StatCard';

export default function Dashboard() {
  const {
    donations, expenses, loans, repayments,
    getTotalDonations, getTotalExpenses, getActiveLoansTotal, getCurrentBalance,
  } = useData();

  const recentDonations = [...donations].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const year = new Date().getFullYear();

  const getMonthlyData = (m) => {
    const inMonth = (d) => { const dt = new Date(d); return dt.getFullYear() === year && dt.getMonth() === m; };
    const don = donations.filter((d) => inMonth(d.date)).reduce((s, d) => s + Number(d.amount), 0);
    const exp = expenses.filter((e) => inMonth(e.date)).reduce((s, e) => s + Number(e.amount), 0);
    const loan = loans.filter((l) => inMonth(l.date)).reduce((s, l) => s + Number(l.amount), 0);
    const repaid = repayments.filter((r) => inMonth(r.date)).reduce((s, r) => s + Number(r.amount), 0);
    return { don, exp, loan, repaid, balance: don - exp - loan + repaid };
  };

  const stats = [
    { title: 'Total Donations', value: getTotalDonations(), color: 'blue', icon: 'fa-donate' },
    { title: 'Total Expenses', value: getTotalExpenses(), color: 'red', icon: 'fa-money-bill-wave' },
    { title: 'Active Loans', value: getActiveLoansTotal(), color: 'orange', icon: 'fa-handshake' },
    { title: 'Current Balance', value: getCurrentBalance(), color: 'green', icon: 'fa-wallet' },
  ];

  return (
    <div className="space-y-6">
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
            <Thead columns={['Month', 'Donations', 'Expenses', 'Loans Given', 'Loan Repaid', 'Balance']} />
            <tbody>
              {MONTH_NAMES.map((month, m) => {
                const d = getMonthlyData(m);
                if (!d.don && !d.exp && !d.loan && !d.repaid) return null;
                return (
                  <Tr key={m}>
                    <Td className="font-semibold">{month}</Td>
                    <Td className="amount-positive">{formatPKR(d.don)}</Td>
                    <Td className="amount-negative">{formatPKR(d.exp)}</Td>
                    <Td>{formatPKR(d.loan)}</Td>
                    <Td className="amount-positive">{formatPKR(d.repaid)}</Td>
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
