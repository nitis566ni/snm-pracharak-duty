import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Building,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';

export const UsersView: React.FC = () => {
  const {
    users,
    branches,
    saveUser,
    toggleUserActive,
    deleteUser,
    isZoneAdmin,
    currentUser,
    t,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({
    email: '',
    name: '',
    role: 'BRANCH_MUKHI',
    branchId: branches[0]?.id || '',
    active: true,
  });

  const handleSave = () => {
    if (!editingUser.email) return;
    saveUser(editingUser);
    setIsAddModalOpen(false);
    setEditingUser({
      email: '',
      name: '',
      role: 'BRANCH_MUKHI',
      branchId: branches[0]?.id || '',
      active: true,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0A3A33] tracking-tight">
            Users
          </h2>
          <p className="text-xs text-[#4A726B] mt-0.5">
            Zone Admins and Branch Mukhis who can sign in.
          </p>
        </div>

        {isZoneAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#0F4C42] hover:bg-[#155A4F] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#D4F58C]" />
            <span>Add User</span>
          </button>
        )}
      </div>

      {/* Users Table matching screenshot 16 */}
      <div className="bg-white rounded-3xl border border-[#E2EFEB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5FAF8] border-b border-[#E2EFEB] text-[#4A726B] font-bold">
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-6 w-36">Role</th>
                <th className="py-3.5 px-6">Branch</th>
                <th className="py-3.5 px-6 w-28 text-center">Status</th>
                {isZoneAdmin && <th className="py-3.5 px-6 w-20 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBF4F2]">
              {users.map((u) => {
                const branch = branches.find((b) => b.id === u.branchId);

                return (
                  <tr key={u.id} className="hover:bg-[#F9FCFB] transition-colors">
                    {/* Email */}
                    <td className="py-3.5 px-6 font-mono font-medium text-[#0A3A33]">
                      <div className="font-bold">{u.email}</div>
                      {u.name && u.name !== u.email && (
                        <div className="text-[11px] text-[#719B93]">{u.name}</div>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-6">
                      <span className="font-semibold text-[#0A3A33]">
                        {u.role === 'ZONE_ADMIN' ? 'Zone Admin' : 'Branch Mukhi'}
                      </span>
                    </td>

                    {/* Branch */}
                    <td className="py-3.5 px-6 text-[#4A726B]">
                      {u.role === 'ZONE_ADMIN' ? '—' : branch?.name || 'Jai Jawan Nagar'}
                    </td>

                    {/* Status pill (matching screenshot: Active in blue/emerald, Inactive in light gray) */}
                    <td className="py-3.5 px-6 text-center">
                      <button
                        disabled={!isZoneAdmin || u.id === currentUser.id}
                        onClick={() => toggleUserActive(u.id)}
                        className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all ${
                          u.active
                            ? 'bg-[#0F4C42] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title={isZoneAdmin ? 'Click to toggle Active / Inactive' : undefined}
                      >
                        {u.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Action */}
                    {isZoneAdmin && (
                      <td className="py-3.5 px-6 text-right">
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2EFEB]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EFEB] mb-4">
              <h3 className="text-base font-bold text-[#0A3A33]">Add User</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F0F7F5] flex items-center justify-center text-[#719B93]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#0A3A33] mb-1 block">Email Address *</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="e.g. mukhi.pune@nirankari.org"
                  className="w-full p-2.5 bg-[#FAFDFB] border border-[#D5E8E3] rounded-xl text-xs text-[#0A3A33] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#0A3A33] mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="e.g. Rev. Ramesh Patil"
                  className="w-full p-2.5 bg-[#FAFDFB] border border-[#D5E8E3] rounded-xl text-xs text-[#0A3A33] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#0A3A33] mb-1 block">Role</label>
                <select
                  value={editingUser.role || 'BRANCH_MUKHI'}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value as UserRole })
                  }
                  className="w-full p-2.5 bg-white border border-[#D5E8E3] rounded-xl text-xs"
                >
                  <option value="BRANCH_MUKHI">Branch Mukhi</option>
                  <option value="ZONE_ADMIN">Zone Admin</option>
                </select>
              </div>

              {editingUser.role === 'BRANCH_MUKHI' && (
                <div>
                  <label className="font-bold text-[#0A3A33] mb-1 block">Assigned Branch</label>
                  <select
                    value={editingUser.branchId || branches[0]?.id}
                    onChange={(e) => setEditingUser({ ...editingUser, branchId: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#D5E8E3] rounded-xl text-xs"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-[#E2EFEB] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4A726B] hover:bg-[#F0F7F5]"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-full bg-[#0F3B38] text-white text-xs font-bold shadow-md hover:bg-[#154E4A]"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
