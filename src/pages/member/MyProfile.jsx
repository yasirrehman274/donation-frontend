import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { authApi } from '../../api/authApi';
import { getApiError, sanitizePhone, isValidPhone, PHONE_ERROR, PHONE_MAX_LENGTH } from '../../utils/helpers';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

export default function MyProfile() {
  const { user, updateUser } = useAuth();
  const { showNotification } = useData();

  const [profile, setProfile] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (profile.fullName.trim().length < 2) return showNotification('Name must be at least 2 characters!', 'error');
    if (!profile.phone.trim()) return showNotification('Phone number is required!', 'error');
    if (!isValidPhone(profile.phone)) return showNotification(PHONE_ERROR, 'error');

    setSavingProfile(true);
    try {
      const data = await authApi.updateProfile({ fullName: profile.fullName.trim(), phone: profile.phone.trim() });
      updateUser(data.user);
      showNotification('Profile updated successfully!', 'success');
    } catch (err) {
      showNotification(getApiError(err), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const validatePassword = () => {
    const next = {};
    if (!pwd.oldPassword) next.oldPassword = 'Current password is required';
    if (pwd.newPassword.length < 6) next.newPassword = 'New password must be at least 6 characters';
    if (pwd.confirm !== pwd.newPassword) next.confirm = 'Passwords do not match';
    setPwdErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setSavingPassword(true);
    try {
      await authApi.changePassword({ oldPassword: pwd.oldPassword, newPassword: pwd.newPassword });
      showNotification('Password changed successfully!', 'success');
      setPwd({ oldPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      showNotification(getApiError(err), 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const infoRows = [
    { label: 'Full Name', value: user?.fullName },
    { label: 'Phone Number', value: user?.phone },
    { label: 'Role', value: <Badge status={user?.role === 'admin' ? 'default' : 'active'}>{user?.role === 'admin' ? 'Admin' : 'Member'}</Badge> },
    { label: 'Status', value: <Badge status={user?.status}>{user?.status === 'active' ? 'Active' : 'Inactive'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon="fa-user-circle" title="Account Information" />
        <CardBody>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border-2 border-gray-100">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <i className="fas fa-circle-user"></i>
                </div>
                <div>
                  <h4 className="text-[11px] uppercase text-gray-500 font-semibold">{row.label}</h4>
                  <p className="text-sm font-bold text-dark">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="fa-user-edit" title="Update Profile" />
        <CardBody>
          <form onSubmit={handleProfileSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Input label="Full Name *" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
            <Input label="Phone Number *" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: sanitizePhone(e.target.value) })} maxLength={PHONE_MAX_LENGTH} inputMode="numeric" />
            <div className="md:col-span-2">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? <><i className="fas fa-circle-notch fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Update Profile</>}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="fa-key" title="Change Password" />
        <CardBody>
          <form onSubmit={handlePasswordSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Input label="Current Password *" type="password" value={pwd.oldPassword} onChange={(e) => setPwd({ ...pwd, oldPassword: e.target.value })} />
              {pwdErrors.oldPassword && <p className="text-xs text-danger font-medium">{pwdErrors.oldPassword}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Input label="New Password *" type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} />
              {pwdErrors.newPassword && <p className="text-xs text-danger font-medium">{pwdErrors.newPassword}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Input label="Confirm New Password *" type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
              {pwdErrors.confirm && <p className="text-xs text-danger font-medium">{pwdErrors.confirm}</p>}
            </div>
            <div className="md:col-span-3">
              <Button type="submit" variant="warning" disabled={savingPassword}>
                {savingPassword ? <><i className="fas fa-circle-notch fa-spin"></i> Updating...</> : <><i className="fas fa-key"></i> Change Password</>}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
