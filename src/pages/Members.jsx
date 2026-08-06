import React, { useState, useEffect, useCallback } from 'react';
import { userApi } from '../api/userApi';
import { useData } from '../context/DataContext';
import { getApiError, sanitizePhone, isValidPhone, PHONE_ERROR, PHONE_MAX_LENGTH } from '../utils/helpers';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Table, Thead, Td, Tr, EmptyRow } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { confirmDelete } from '../utils/alert';

const emptyMember = { fullName: '', phone: '', password: '', role: 'member' };

export default function Members() {
  const { showNotification } = useData();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyMember);
  const [addErrors, setAddErrors] = useState({});

  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', role: 'member', status: 'active' });

  const [resetUser, setResetUser] = useState(null);
  const [resetPassword, setResetPassword] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const list = await userApi.list();
      setUsers(list || []);
    } catch (err) {
      showNotification(getApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const validateAdd = () => {
    const next = {};
    if (addForm.fullName.trim().length < 2) next.fullName = 'Name is required (min 2 characters)';
    if (!addForm.phone.trim()) next.phone = 'Phone number is required';
    else if (!isValidPhone(addForm.phone)) next.phone = PHONE_ERROR;
    if (addForm.password.length < 6) next.password = 'Password must be at least 6 characters';
    setAddErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validateAdd()) return;
    try {
      await userApi.create({
        fullName: addForm.fullName.trim(),
        phone: addForm.phone.trim(),
        password: addForm.password,
        role: addForm.role,
      });
      showNotification('Member added successfully!', 'success');
      setAddForm(emptyMember);
      setAddOpen(false);
      loadUsers();
    } catch (err) {
      showNotification(getApiError(err), 'error');
    }
  };

  const openEdit = (user) => {
    setEditForm({ fullName: user.fullName, phone: user.phone, role: user.role, status: user.status });
    setEditUser(user);
  };

  const handleUpdate = async () => {
    if (!editForm.fullName.trim() || !editForm.phone.trim()) {
      return showNotification('Full name and phone number are required!', 'error');
    }
    if (!isValidPhone(editForm.phone)) return showNotification(PHONE_ERROR, 'error');
    try {
      await userApi.update(editUser.id, {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        role: editForm.role,
        status: editForm.status,
      });
      showNotification('Member updated successfully!', 'success');
      setEditUser(null);
      loadUsers();
    } catch (err) {
      showNotification(getApiError(err), 'error');
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await userApi.update(user.id, { status: nextStatus });
      showNotification(nextStatus === 'active' ? 'Member activated!' : 'Member deactivated!', 'info');
      loadUsers();
    } catch (err) {
      showNotification(getApiError(err), 'error');
    }
  };

  const handleResetPassword = async () => {
    if (resetPassword.length < 6) return showNotification('Password must be at least 6 characters!', 'error');
    try {
      await userApi.update(resetUser.id, { password: resetPassword });
      showNotification('Password reset successfully!', 'success');
      setResetUser(null);
      setResetPassword('');
    } catch (err) {
      showNotification(getApiError(err), 'error');
    }
  };

  const handleDelete = async (user) => {
    const { isConfirmed } = await confirmDelete();
    if (!isConfirmed) return;
    try {
      await userApi.delete(user.id);
      showNotification('Member deleted!', 'info');
      loadUsers();
    } catch (err) {
      showNotification(getApiError(err), 'error');
    }
  };

  let filtered = users;
  if (search) filtered = filtered.filter((u) => (u.fullName + ' ' + u.phone).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon="fa-user-plus" title="Add New Member" action={<Button onClick={() => setAddOpen(true)}><i className="fas fa-plus"></i> Add Member</Button>} />
      </Card>

      <Card>
        <CardHeader icon="fa-users" title="All Members" action={<Badge>{filtered.length}</Badge>} />
        <CardBody>
          <div className="max-w-xs mb-4">
            <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-3 text-gray-500">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading members...</span>
            </div>
          ) : (
            <Table>
              <Thead columns={['#', 'Name', 'Phone', 'Role', 'Status', 'Actions']} />
              <tbody>
                {filtered.length === 0 ? (
                  <EmptyRow colSpan={6} message="No members found" />
                ) : filtered.map((u, i) => (
                  <Tr key={u.id}>
                    <Td>{i + 1}</Td>
                    <Td className="font-semibold">{u.fullName}</Td>
                    <Td>{u.phone}</Td>
                    <Td><Badge status={u.role === 'admin' ? 'default' : 'active'}>{u.role === 'admin' ? 'Admin' : 'Member'}</Badge></Td>
                    <Td><Badge status={u.status}>{u.status === 'active' ? 'Active' : 'Inactive'}</Badge></Td>
                    <Td>
                      <div className="flex gap-1 flex-wrap">
                        <Button variant="warning" size="xs" onClick={() => openEdit(u)} title="Edit"><i className="fas fa-edit"></i></Button>
                        <Button variant={u.status === 'active' ? 'secondary' : 'success'} size="xs" onClick={() => handleToggleStatus(u)} title={u.status === 'active' ? 'Deactivate' : 'Activate'}>
                          <i className={`fas ${u.status === 'active' ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                        </Button>
                        <Button variant="secondary" size="xs" onClick={() => setResetUser(u)} title="Reset Password"><i className="fas fa-key"></i></Button>
                        <Button variant="danger" size="xs" onClick={() => handleDelete(u)} title="Delete"><i className="fas fa-trash"></i></Button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal title="Add Member" isOpen={addOpen} onClose={() => setAddOpen(false)}>
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Input label="Full Name *" value={addForm.fullName} onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })} placeholder="Enter full name" />
            {addErrors.fullName && <p className="text-xs text-danger font-medium">{addErrors.fullName}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Input label="Phone Number *" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: sanitizePhone(e.target.value) })} placeholder="03XX XXXXXXX" maxLength={PHONE_MAX_LENGTH} inputMode="numeric" />
            {addErrors.phone && <p className="text-xs text-danger font-medium">{addErrors.phone}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Input label="Password *" type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} placeholder="Min 6 characters" />
            {addErrors.password && <p className="text-xs text-danger font-medium">{addErrors.password}</p>}
          </div>
          <Select label="Role" value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </Select>
          <Button type="submit"><i className="fas fa-save"></i> Add Member</Button>
        </form>
      </Modal>

      <Modal title={`Edit Member: ${editUser ? editUser.fullName : ''}`} isOpen={!!editUser} onClose={() => setEditUser(null)}>
        {editUser && (
          <div className="flex flex-col gap-4">
            <Input label="Full Name *" value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
            <Input label="Phone Number *" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: sanitizePhone(e.target.value) })} maxLength={PHONE_MAX_LENGTH} inputMode="numeric" />
            <Select label="Role" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Select>
            <Select label="Status" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <Button onClick={handleUpdate}><i className="fas fa-save"></i> Update Member</Button>
          </div>
        )}
      </Modal>

      <Modal title={`Reset Password: ${resetUser ? resetUser.fullName : ''}`} isOpen={!!resetUser} onClose={() => { setResetUser(null); setResetPassword(''); }}>
        {resetUser && (
          <div className="flex flex-col gap-4">
            <Input label="New Password *" type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="Min 6 characters" />
            <Button onClick={handleResetPassword}><i className="fas fa-key"></i> Reset Password</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
