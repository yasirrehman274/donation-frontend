import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatPKR, formatDate, getTodayDate } from '../utils/helpers';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, Thead, Td, Tr, EmptyRow } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input, { Textarea } from '../components/ui/Input';
import Select from '../components/ui/Select';
import { confirmDelete } from '../utils/alert';

export default function Repayments() {
  const { loans, repayments, addRepayment, deleteRepayment, updateLoan, getLoanTotalRepaid, showNotification } = useData();
  const [form, setForm] = useState({ loanId: '', amount: '', date: getTodayDate(), notes: '' });
  const [viewLoanId, setViewLoanId] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.loanId || !form.amount || !form.date) return showNotification('Please fill all required fields!', 'error');
    const loan = loans.find((l) => l.id === form.loanId);
    const alreadyRepaid = getLoanTotalRepaid(form.loanId);
    const remaining = Number(loan.amount) - alreadyRepaid;
    if (Number(form.amount) > remaining) return showNotification(`Exceeds remaining! Remaining: ${formatPKR(remaining)}`, 'error');

    await addRepayment({ loanId: form.loanId, borrowerName: loan.borrowerName, amount: Number(form.amount), date: form.date, notes: form.notes });
    if (alreadyRepaid + Number(form.amount) >= Number(loan.amount)) updateLoan(form.loanId, { status: 'paid' });
    setForm({ loanId: '', amount: '', date: getTodayDate(), notes: '' });
  };

  const handleDelete = async (id) => {
    const { isConfirmed } = await confirmDelete();
    if (!isConfirmed) return;
    const rep = repayments.find((r) => r.id === id);
    await deleteRepayment(id);
    if (rep) {
      const loan = loans.find((l) => l.id === rep.loanId);
      if (loan) {
        const newRepaid = getLoanTotalRepaid(rep.loanId) - Number(rep.amount);
        if (newRepaid < Number(loan.amount)) updateLoan(rep.loanId, { status: 'active' });
      }
    }
  };

  const activeLoans = loans.filter((l) => Number(l.amount) - getLoanTotalRepaid(l.id) > 0);
  const sortedRepayments = [...repayments].sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalRepaid = sortedRepayments.reduce((s, r) => s + Number(r.amount), 0);

  const viewLoan = viewLoanId ? loans.find((l) => l.id === viewLoanId) : null;
  const viewLoanRepayments = viewLoanId ? repayments.filter((r) => r.loanId === viewLoanId).sort((a, b) => new Date(a.date) - new Date(b.date)) : [];
  const viewRepaid = viewLoanRepayments.reduce((s, r) => s + Number(r.amount), 0);
  const viewRemaining = viewLoan ? Number(viewLoan.amount) - viewRepaid : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon="fa-plus-circle" title="Record Loan Repayment" />
        <CardBody>
          <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Select label="Select Loan *" name="loanId" value={form.loanId} onChange={handleChange}>
              <option value="">-- Select Active Loan --</option>
              {activeLoans.map((l) => {
                const remaining = Number(l.amount) - getLoanTotalRepaid(l.id);
                return <option key={l.id} value={l.id}>{l.borrowerName} - {formatPKR(l.amount)} (Remaining: {formatPKR(remaining)})</option>;
              })}
            </Select>
            <Input label="Repayment Amount (PKR) *" type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="Amount returned" min="1" />
            <Input label="Date *" type="date" name="date" value={form.date} onChange={handleChange} />
            <div className="md:col-span-2">
              <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} rows="2" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit"><i className="fas fa-save"></i> Save Repayment</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="fa-list" title="All Repayments" />
        <CardBody>
          <Table>
            <Thead columns={['#', 'Borrower', 'Amount Repaid', 'Date', 'Notes', 'Actions']} />
            <tbody>
              {sortedRepayments.length === 0 ? (
                <EmptyRow colSpan={6} message="No repayments found" />
              ) : sortedRepayments.map((r, i) => (
                <Tr key={r.id}>
                  <Td>{i + 1}</Td>
                  <Td className="font-semibold">{r.borrowerName}</Td>
                  <Td className="amount-positive">{formatPKR(r.amount)}</Td>
                  <Td>{formatDate(r.date)}</Td>
                  <Td>{r.notes || '-'}</Td>
                  <Td><Button variant="danger" size="xs" onClick={() => handleDelete(r.id)}><i className="fas fa-trash"></i></Button></Td>
                </Tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold border-t-2 border-dark">
                <Td colSpan={2}>Total Repaid</Td>
                <Td>{formatPKR(totalRepaid)}</Td>
                <Td colSpan={3}></Td>
              </tr>
            </tfoot>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="fa-search" title="View Repayment History of a Loan" />
        <CardBody>
          <div className="max-w-md">
            <Select label="Select Loan" value={viewLoanId} onChange={(e) => setViewLoanId(e.target.value)}>
              <option value="">-- Select Loan --</option>
              {loans.map((l) => <option key={l.id} value={l.id}>{l.borrowerName} - {formatPKR(l.amount)}</option>)}
            </Select>
          </div>

          {viewLoan && (
            <div className="mt-5">
              <div className="bg-blue-50 border-2 border-primary rounded-lg p-4 grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {[
                  { label: 'Borrower', value: viewLoan.borrowerName },
                  { label: 'Loan Amount', value: formatPKR(viewLoan.amount) },
                  { label: 'Total Repaid', value: formatPKR(viewRepaid), cls: 'text-green-600' },
                  { label: 'Remaining', value: formatPKR(Math.max(0, viewRemaining)), cls: viewRemaining > 0 ? 'text-red-600' : 'text-green-600' },
                  { label: 'Loan Date', value: formatDate(viewLoan.date) },
                  { label: 'Status', value: viewRemaining <= 0 ? '✅ Paid' : '⏳ Active' },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <h4 className="text-[11px] uppercase text-gray-500 mb-1">{item.label}</h4>
                    <p className={`text-base font-bold text-dark ${item.cls || ''}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <Table>
                  <Thead columns={['#', 'Amount Repaid', 'Date', 'Notes']} />
                  <tbody>
                    {viewLoanRepayments.length === 0 ? (
                      <EmptyRow colSpan={4} message="No repayments yet" />
                    ) : viewLoanRepayments.map((r, i) => (
                      <Tr key={r.id}>
                        <Td>{i + 1}</Td>
                        <Td className="amount-positive">{formatPKR(r.amount)}</Td>
                        <Td>{formatDate(r.date)}</Td>
                        <Td>{r.notes || '-'}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
