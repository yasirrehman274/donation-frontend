import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { donationApi } from '../api/donationApi';
import { expenseApi } from '../api/expenseApi';
import { loanApi } from '../api/loanApi';
import { repaymentApi } from '../api/repaymentApi';
import { useNotification } from '../hooks/useNotification';
import { generateId } from '../utils/helpers';

const DataContext = createContext();
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loans, setLoans] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification } = useNotification();

  // ===== FETCH ALL DATA FROM JSON FILE (via Axios) =====
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [don, exp, loan, rep] = await Promise.all([
        donationApi.getAll(),
        expenseApi.getAll(),
        loanApi.getAll(),
        repaymentApi.getAll(),
      ]);
      setDonations(don || []);
      setExpenses(exp || []);
      setLoans(loan || []);
      setRepayments(rep || []);
    } catch (err) {
      showNotification('Failed to load data. Is JSON server running?', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ===== DONATIONS =====
  const addDonation = async (donation) => {
    try {
      const newDonation = { ...donation, id: generateId(), createdAt: new Date().toISOString() };
      const saved = await donationApi.create(newDonation);
      setDonations((prev) => [...prev, saved]);
      showNotification('Donation saved successfully!', 'success');
    } catch {
      showNotification('Failed to save donation!', 'error');
    }
  };

  const updateDonation = async (id, updated) => {
    try {
      const saved = await donationApi.update(id, { ...updated, id });
      setDonations((prev) => prev.map((d) => (d.id === id ? saved : d)));
      showNotification('Donation updated successfully!', 'success');
    } catch {
      showNotification('Failed to update donation!', 'error');
    }
  };

  const deleteDonation = async (id) => {
    try {
      await donationApi.delete(id);
      setDonations((prev) => prev.filter((d) => d.id !== id));
      showNotification('Donation deleted!', 'info');
    } catch {
      showNotification('Failed to delete donation!', 'error');
    }
  };

  // ===== EXPENSES =====
  const addExpense = async (expense) => {
    try {
      const newExpense = { ...expense, id: generateId(), createdAt: new Date().toISOString() };
      const saved = await expenseApi.create(newExpense);
      setExpenses((prev) => [...prev, saved]);
      showNotification('Expense saved successfully!', 'success');
    } catch {
      showNotification('Failed to save expense!', 'error');
    }
  };

  const updateExpense = async (id, updated) => {
    try {
      const saved = await expenseApi.update(id, { ...updated, id });
      setExpenses((prev) => prev.map((e) => (e.id === id ? saved : e)));
      showNotification('Expense updated successfully!', 'success');
    } catch {
      showNotification('Failed to update expense!', 'error');
    }
  };

  const deleteExpense = async (id) => {
    try {
      await expenseApi.delete(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      showNotification('Expense deleted!', 'info');
    } catch {
      showNotification('Failed to delete expense!', 'error');
    }
  };

  // ===== LOANS =====
  const addLoan = async (loan) => {
    try {
      const newLoan = { ...loan, id: generateId(), status: 'active', createdAt: new Date().toISOString() };
      const saved = await loanApi.create(newLoan);
      setLoans((prev) => [...prev, saved]);
      showNotification('Loan saved successfully!', 'success');
    } catch {
      showNotification('Failed to save loan!', 'error');
    }
  };

  const updateLoan = async (id, updated) => {
    try {
      const saved = await loanApi.update(id, updated);
      setLoans((prev) => prev.map((l) => (l.id === id ? saved : l)));
      if (updated.borrowerName) showNotification('Loan updated successfully!', 'success');
    } catch {
      showNotification('Failed to update loan!', 'error');
    }
  };

  const deleteLoan = async (id) => {
    try {
      // Delete related repayments first
      const relatedRepayments = repayments.filter((r) => r.loanId === id);
      await Promise.all(relatedRepayments.map((r) => repaymentApi.delete(r.id)));
      await loanApi.delete(id);
      setLoans((prev) => prev.filter((l) => l.id !== id));
      setRepayments((prev) => prev.filter((r) => r.loanId !== id));
      showNotification('Loan and related repayments deleted!', 'info');
    } catch {
      showNotification('Failed to delete loan!', 'error');
    }
  };

  // ===== REPAYMENTS =====
  const addRepayment = async (repayment) => {
    try {
      const newRepayment = { ...repayment, id: generateId(), createdAt: new Date().toISOString() };
      const saved = await repaymentApi.create(newRepayment);
      setRepayments((prev) => [...prev, saved]);
      showNotification('Repayment recorded successfully!', 'success');
    } catch {
      showNotification('Failed to save repayment!', 'error');
    }
  };

  const deleteRepayment = async (id) => {
    try {
      await repaymentApi.delete(id);
      setRepayments((prev) => prev.filter((r) => r.id !== id));
      showNotification('Repayment deleted!', 'info');
    } catch {
      showNotification('Failed to delete repayment!', 'error');
    }
  };

  // ===== CALCULATIONS =====
  const getLoanTotalRepaid = (loanId) =>
    repayments.filter((r) => r.loanId === loanId).reduce((s, r) => s + Number(r.amount), 0);

  const getTotalDonations = () => donations.reduce((s, d) => s + Number(d.amount), 0);
  const getTotalExpenses = () => expenses.reduce((s, e) => s + Number(e.amount), 0);
  const getTotalLoansGiven = () => loans.reduce((s, l) => s + Number(l.amount), 0);
  const getTotalRepayments = () => repayments.reduce((s, r) => s + Number(r.amount), 0);

  const getActiveLoansTotal = () =>
    loans.reduce((total, loan) => {
      const remaining = Number(loan.amount) - getLoanTotalRepaid(loan.id);
      return total + (remaining > 0 ? remaining : 0);
    }, 0);

  const getCurrentBalance = () =>
    getTotalDonations() - getTotalExpenses() - getTotalLoansGiven() + getTotalRepayments();

  const value = {
    donations, expenses, loans, repayments, loading,
    addDonation, updateDonation, deleteDonation,
    addExpense, updateExpense, deleteExpense,
    addLoan, updateLoan, deleteLoan,
    addRepayment, deleteRepayment,
    getLoanTotalRepaid, getTotalDonations, getTotalExpenses,
    getTotalLoansGiven, getTotalRepayments, getActiveLoansTotal, getCurrentBalance,
    notification, showNotification, fetchAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
