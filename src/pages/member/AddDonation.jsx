import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationApi } from '../../api/donationApi';
import { useData } from '../../context/DataContext';
import { getApiError, getTodayDate, PAYMENT_METHODS } from '../../utils/helpers';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const emptyForm = { amount: '', date: getTodayDate(), paymentMethod: 'Bank Transfer', notes: '' };

export default function AddDonation() {
  const navigate = useNavigate();
  const { showNotification, refreshDonations } = useData();

  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const validate = () => {
    const next = {};
    if (!form.amount || Number(form.amount) <= 0) next.amount = 'Please enter a valid amount';
    if (!form.date) next.date = 'Please select a date';
    if (!form.paymentMethod) next.paymentMethod = 'Please select a payment method';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setUploading(true);
    try {
      let screenshot = '';
      if (file) {
        const uploaded = await donationApi.upload(file);
        screenshot = uploaded.url;
      }

      const payload = {
        amount: Number(form.amount),
        date: form.date,
        paymentMethod: form.paymentMethod,
        notes: form.notes,
        ...(screenshot ? { screenshot } : {}),
      };
      const created = await donationApi.create(payload);

      await refreshDonations();
      showNotification('Donation submitted! Your donation is pending approval.', 'success');
      navigate(`/member/donations?submitted=${created.id}`);
    } catch (err) {
      showNotification(getApiError(err), 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon="fa-hand-holding-heart" title="Submit a Donation" />
        <CardBody>
          <p className="text-sm text-gray-500 mb-5">
            Submit your donation below. Your donation will be <BadgeSpan>Pending</BadgeSpan> until an administrator approves it.
          </p>
          <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-2" noValidate>
            <div className="flex flex-col gap-1.5">
              <Input
                label="Amount (PKR) *"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                min="1"
                step="0.01"
              />
              {errors.amount && <p className="text-xs text-danger font-medium">{errors.amount}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Input label="Donation Date *" type="date" name="date" value={form.date} onChange={handleChange} />
              {errors.date && <p className="text-xs text-danger font-medium">{errors.date}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Select label="Payment Method *" name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </Select>
              {errors.paymentMethod && <p className="text-xs text-danger font-medium">{errors.paymentMethod}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-dark">Screenshot (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-3 file:px-4 file:py-2.5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white file:cursor-pointer hover:file:bg-primary-dark"
              />
              {preview && (
                <img src={preview} alt="Preview" className="mt-2 rounded-lg border-2 border-gray-100 max-h-40 object-contain" />
              )}
            </div>

            <div className="md:col-span-2">
              <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} rows="2" placeholder="Optional details..." />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <Button type="submit" disabled={uploading}>
                {uploading ? <><i className="fas fa-circle-notch fa-spin"></i> Submitting...</> : <><i className="fas fa-paper-plane"></i> Submit Donation</>}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/member/dashboard')}>Cancel</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

function BadgeSpan({ children }) {
  return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">{children}</span>;
}
