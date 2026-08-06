import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { getApiError, sanitizePhone, isValidPhone, PHONE_ERROR, PHONE_MAX_LENGTH } from '../utils/helpers';
import { errorPopup } from '../utils/alert';

const roleHome = (role) => (role === 'admin' ? '/admin/dashboard' : '/member/dashboard');

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!phone.trim()) next.phone = 'Phone number is required';
    else if (!isValidPhone(phone)) next.phone = PHONE_ERROR;
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const data = await authApi.login({ phone: phone.trim(), password });
      login(data.token, data.user, remember);
      navigate(roleHome(data.user.role), { replace: true });
    } catch (err) {
      const message = getApiError(err);
      setApiError(message);
      errorPopup(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full px-4 py-2.5 border-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/15 ${
      hasError
        ? 'border-danger focus:border-danger'
        : 'border-gray-200 focus:border-primary'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark via-[#1a2d5e] to-[#162447]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-3xl shadow-lg mb-4">
            <i className="fas fa-hand-holding-heart"></i>
          </div>
          <h1 className="text-2xl font-bold text-white">Donation Management System</h1>
          <p className="text-sm text-white/60 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-cardLg p-8">
          {apiError && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border-2 border-danger/30 text-danger text-sm font-semibold flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-dark">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                placeholder="03XX XXXXXXX"
                maxLength={PHONE_MAX_LENGTH}
                inputMode="numeric"
                className={inputClass(!!errors.phone)}
              />
              {errors.phone && <p className="text-xs text-danger font-medium">{errors.phone}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-dark">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`${inputClass(!!errors.password)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger font-medium">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                disabled
                title="Forgot password is not available yet"
                className="text-gray-300 cursor-not-allowed"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold px-5 py-3 transition-all hover:-translate-y-px"
            >
              {submitting ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i> Signing in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Login
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/50 mt-6">
          {new Date().getFullYear()} Donation Management System
        </p>
      </div>
    </div>
  );
}
