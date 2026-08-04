import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { donationApi } from '../api/donationApi';
import { donorApi } from '../api/donarAPI';
import { expenseApi } from '../api/expenseApi';
import { loanApi } from '../api/loanApi';
import { repaymentApi } from '../api/repaymentApi';
import { surplusApi } from '../api/surplusApi';
import { useNotification } from '../hooks/useNotification';
import { generateId } from '../utils/helpers';

const DataContext = createContext();
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loans, setLoans] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [surplus, setSurplus] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification } = useNotification();

  // ===== FETCH ALL DATA FROM JSON FILE (via Axios) =====
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [don, donorList, exp, loan, rep, sur] = await Promise.all([
        donationApi.getAll(),
        donorApi.getAll(),
        expenseApi.getAll(),
        loanApi.getAll(),
        repaymentApi.getAll(),
        surplusApi.getAll(),
      ]);
      setDonations(don || []);
      setDonors(donorList || []);
      setExpenses(exp || []);
      setLoans(loan || []);
      setRepayments(rep || []);
      setSurplus(sur || []);
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
      const donorName = (donation.donorName || '').trim();
      const donorPhone = (donation.phone || '').trim();
      const donorExists = donors.some((d) => (d.name || d.donorName || '').trim().toLowerCase() === donorName.toLowerCase());

      if (donorName && !donorExists) {
        const donorPayload = { name: donorName, phone: donorPhone, id: generateId(), createdAt: new Date().toISOString() };
        const savedDonor = await donorApi.create(donorPayload);
        setDonors((prev) => [...prev, savedDonor]);
      }

      const newDonation = {
        ...donation,
        donorName,
        phone: donorPhone,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
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

  const addDonor = async (donor) => {
    try {
      const newDonor = { ...donor, id: generateId(), createdAt: new Date().toISOString() };
      const saved = await donorApi.create(newDonor);
      setDonors((prev) => [...prev, saved]);
      showNotification('Donor added successfully!', 'success');
      return saved;
    } catch {
      showNotification('Failed to add donor!', 'error');
      return null;
    }
  };

  const updateDonor = async (id, updated) => {
    try {
      const currentDonor = donors.find((d) => d.id === id);
      if (!currentDonor) throw new Error('Donor not found');

      const previousName = (currentDonor.name || currentDonor.donorName || '').trim();
      const nextName = (updated.name || previousName).trim();
      const nextPhone = (updated.phone || '').trim();

      const saved = await donorApi.update(id, { ...updated, id, name: nextName, phone: nextPhone });
      setDonors((prev) => prev.map((d) => (d.id === id ? saved : d)));

      if (previousName && previousName.toLowerCase() !== nextName.toLowerCase()) {
        const matchingDonations = donations.filter((d) => (d.donorName || '').trim().toLowerCase() === previousName.toLowerCase());
        await Promise.all(
          matchingDonations.map((donation) =>
            donationApi.update(donation.id, { ...donation, donorName: nextName, phone: nextPhone || donation.phone || '' })
          )
        );
        setDonations((prev) =>
          prev.map((d) =>
            (d.donorName || '').trim().toLowerCase() === previousName.toLowerCase()
              ? { ...d, donorName: nextName, phone: nextPhone || d.phone || '' }
              : d
          )
        );
      }

      showNotification('Donor updated successfully!', 'success');
    } catch {
      showNotification('Failed to update donor!', 'error');
    }
  };

  const deleteDonor = async (id) => {
    try {
      await donorApi.delete(id);
      setDonors((prev) => prev.filter((d) => d.id !== id));
      showNotification('Donor deleted!', 'info');
    } catch {
      showNotification('Failed to delete donor!', 'error');
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

  // ===== SURPLUS (Monthly Bank Profit) =====
  const addSurplus = async (entry) => {
    try {
      const newEntry = { ...entry, id: generateId(), createdAt: new Date().toISOString() };
      const saved = await surplusApi.create(newEntry);
      setSurplus((prev) => [...prev, saved]);
      showNotification('Surplus recorded successfully!', 'success');
    } catch {
      showNotification('Failed to save surplus!', 'error');
    }
  };

  const updateSurplus = async (id, updated) => {
    try {
      const saved = await surplusApi.update(id, { ...updated, id });
      setSurplus((prev) => prev.map((s) => (s.id === id ? saved : s)));
      showNotification('Surplus updated successfully!', 'success');
    } catch {
      showNotification('Failed to update surplus!', 'error');
    }
  };

  const deleteSurplus = async (id) => {
    try {
      await surplusApi.delete(id);
      setSurplus((prev) => prev.filter((s) => s.id !== id));
      showNotification('Surplus entry deleted!', 'info');
    } catch {
      showNotification('Failed to delete surplus!', 'error');
    }
  };

  // ===== CALCULATIONS =====
  const getLoanTotalRepaid = (loanId) =>
    repayments.filter((r) => r.loanId === loanId).reduce((s, r) => s + Number(r.amount), 0);

  const getTotalDonations = () => donations.reduce((s, d) => s + Number(d.amount), 0);
  const getTotalExpenses = () => expenses.reduce((s, e) => s + Number(e.amount), 0);
  const getTotalLoansGiven = () => loans.reduce((s, l) => s + Number(l.amount), 0);
  const getTotalRepayments = () => repayments.reduce((s, r) => s + Number(r.amount), 0);
  const getTotalSurplus = () => surplus.reduce((s, x) => s + Number(x.amount), 0);

  const getActiveLoansTotal = () =>
    loans.reduce((total, loan) => {
      const remaining = Number(loan.amount) - getLoanTotalRepaid(loan.id);
      return total + (remaining > 0 ? remaining : 0);
    }, 0);

  const getCurrentBalance = () =>
    getTotalDonations() - getTotalExpenses() - getTotalLoansGiven() + getTotalRepayments() + getTotalSurplus();

  const value = {
    donations, donors, expenses, loans, repayments, surplus, loading,
    addDonation, updateDonation, deleteDonation,
    addDonor, updateDonor, deleteDonor,
    addExpense, updateExpense, deleteExpense,
    addLoan, updateLoan, deleteLoan,
    addRepayment, deleteRepayment,
    addSurplus, updateSurplus, deleteSurplus,
    getLoanTotalRepaid, getTotalDonations, getTotalExpenses,
    getTotalLoansGiven, getTotalRepayments, getTotalSurplus,
    getActiveLoansTotal, getCurrentBalance,
    notification, showNotification, fetchAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
