import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatPKR, MONTH_NAMES } from '../utils/helpers';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, Thead, Td, Tr, EmptyRow } from '../components/ui/Table';
import Select from '../components/ui/Select';

export default function Reports() {
  const { donations, expenses, loans, repayments } = useData();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [donorName, setDonorName] = useState('');
  const [donorYear, setDonorYear] = useState(currentYear);

  const allDates = [...donations, ...expenses, ...loans, ...repayments].map((x) => new Date(x.date).getFullYear());
  const years = [...new Set([...allDates, currentYear])].sort((a, b) => b - a);
  const donorNames = [...new Set(donations.map((d) => d.donorName))].sort();

  const inMY = (d, m, y) => { const dt = new Date(d); return dt.getFullYear() === y && dt.getMonth() === m; };

  let gDon = 0, gExp = 0, gLoan = 0, gRep = 0;
  const monthlyRows = MONTH_NAMES.map((month, m) => {
    const don = donations.filter((d) => inMY(d.date, m, year)).reduce((s, d) => s + Number(d.amount), 0);
    const exp = expenses.filter((e) => inMY(e.date, m, year)).reduce((s, e) => s + Number(e.amount), 0);
    const loan = loans.filter((l) => inMY(l.date, m, year)).reduce((s, l) => s + Number(l.amount), 0);
    const rep = repayments.filter((r) => inMY(r.date, m, year)).reduce((s, r) => s + Number(r.amount), 0);
    gDon += don; gExp += exp; gLoan += loan; gRep += rep;
    return { month, don, exp, loan, rep, net: don - exp - loan + rep };
  });

  let dTotal = 0, dCount = 0;
  const donorRows = donorName ? MONTH_NAMES.map((month, m) => {
    const md = donations.filter((d) => d.donorName.toLowerCase() === donorName.toLowerCase() && inMY(d.date, m, donorYear));
    const total = md.reduce((s, d) => s + Number(d.amount), 0);
    dTotal += total; dCount += md.length;
    return { month, total, count: md.length };
  }).filter((r) => r.count > 0) : [];

  const categoryMap = {};
  expenses.forEach((e) => { const c = e.category || 'General'; categoryMap[c] = (categoryMap[c] || 0) + Number(e.amount); });
  const totalExp = Object.values(categoryMap).reduce((s, v) => s + v, 0);
  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon="fa-chart-bar" title="Monthly Donation Report" />
        <CardBody>
          <div className="max-w-xs mb-4">
            <Select label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>
          <Table>
            <Thead columns={['Month', 'Donations', 'Expenses', 'Loans Given', 'Loan Repaid', 'Net Balance']} />
            <tbody>
              {monthlyRows.map((r, i) => {
                const has = r.don || r.exp || r.loan || r.rep;
                return (
                  <Tr key={i} className={!has ? 'text-gray-400' : ''}>
                    <Td className="font-semibold">{r.month}</Td>
                    <Td className={r.don > 0 ? 'amount-positive' : ''}>{formatPKR(r.don)}</Td>
                    <Td className={r.exp > 0 ? 'amount-negative' : ''}>{formatPKR(r.exp)}</Td>
                    <Td>{formatPKR(r.loan)}</Td>
                    <Td className={r.rep > 0 ? 'amount-positive' : ''}>{formatPKR(r.rep)}</Td>
                    <Td className={r.net >= 0 ? 'amount-positive' : 'amount-negative'}>{formatPKR(r.net)}</Td>
                  </Tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold border-t-2 border-dark">
                <Td>Grand Total</Td>
                <Td>{formatPKR(gDon)}</Td>
                <Td>{formatPKR(gExp)}</Td>
                <Td>{formatPKR(gLoan)}</Td>
                <Td>{formatPKR(gRep)}</Td>
                <Td>{formatPKR(gDon - gExp - gLoan + gRep)}</Td>
              </tr>
            </tfoot>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="fa-user" title="Donor-Wise Monthly Report" />
        <CardBody>
          <div className="flex flex-wrap gap-4 mb-4">
            <Select label="Select Donor" value={donorName} onChange={(e) => setDonorName(e.target.value)}>
              <option value="">-- Select Donor --</option>
              {donorNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
            <Select label="Year" value={donorYear} onChange={(e) => setDonorYear(Number(e.target.value))}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>
          <Table>
            <Thead columns={['Month', 'Amount', 'Donations Count']} />
            <tbody>
              {!donorName ? (
                <EmptyRow colSpan={3} message="Please select a donor" />
              ) : donorRows.length === 0 ? (
                <EmptyRow colSpan={3} message="No donations found" />
              ) : donorRows.map((r, i) => (
                <Tr key={i}>
                  <Td className="font-semibold">{r.month}</Td>
                  <Td className="amount-positive">{formatPKR(r.total)}</Td>
                  <Td>{r.count}</Td>
                </Tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold border-t-2 border-dark">
                <Td>Total</Td>
                <Td>{formatPKR(dTotal)}</Td>
                <Td>{dCount}</Td>
              </tr>
            </tfoot>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="fa-chart-pie" title="Expense by Category" />
        <CardBody>
          <Table>
            <Thead columns={['Category', 'Total Amount', 'Percentage']} />
            <tbody>
              {categories.length === 0 ? (
                <EmptyRow colSpan={3} message="No expenses recorded yet" />
              ) : categories.map(([cat, amount], i) => {
                const pct = totalExp > 0 ? ((amount / totalExp) * 100).toFixed(1) : 0;
                return (
                  <Tr key={i}>
                    <Td className="font-semibold">{cat}</Td>
                    <Td className="amount-negative">{formatPKR(amount)}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded h-5 w-36 overflow-hidden">
                          <div className="bg-primary h-full rounded" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span>{pct}%</span>
                      </div>
                    </Td>
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
