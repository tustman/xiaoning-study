'use client';

import React, { useEffect, useState } from 'react';
import { db, UserProfile } from '@/lib/db';
import { Users, Search, ShieldCheck, ShieldAlert, UserX, RefreshCw } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const list = await db.getUsers();
    setUsers(list);
    setFilteredUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const q = searchQuery.toLowerCase().trim();
      const filtered = users.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.nickname.toLowerCase().includes(q)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleToggleRole = async (userId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const actionText = newRole === 'admin' ? '设为管理员' : '撤销管理员';
    
    if (window.showConfirm) {
      window.showConfirm(`您确定要将该用户 ${actionText} 吗？`, async () => {
        const result = await db.updateUserRole(userId, newRole);
        if (result) {
          window.showToast?.('角色更新成功！');
          loadUsers();
        } else {
          window.showToast?.('角色更新失败，请重试', 'error');
        }
      });
    } else {
      const result = await db.updateUserRole(userId, newRole);
      if (result) loadUsers();
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-850">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-850" />
            用户与注册管理
          </h1>
          <p className="text-xs text-slate-455 mt-1">查看和管理已注册学员账号信息、调整并管理管理员角色权限</p>
        </div>

        <button
          onClick={loadUsers}
          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-all active:scale-95 shadow-xs"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative w-full max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="h-4 w-4" />
        </span>
        <input
          id="user-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="按邮箱地址 / 昵称搜索用户..."
          className="w-full bg-white border border-slate-200/80 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:border-slate-800 placeholder-slate-350"
        />
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-450 uppercase tracking-widest border-b border-slate-150">
                <th className="p-4">注册时间</th>
                <th className="p-4">用户 ID</th>
                <th className="p-4">邮箱</th>
                <th className="p-4">用户昵称</th>
                <th className="p-4 text-center">角色身份</th>
                <th className="p-4 text-right">角色管理</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  <td className="p-4 whitespace-nowrap text-[10px] text-slate-400 font-medium">
                    {new Date(user.created_at).toLocaleString('zh-CN')}
                  </td>
                  <td className="p-4 font-mono text-[10px] text-slate-500 max-w-[120px] truncate">{user.id}</td>
                  <td className="p-4 font-bold text-slate-800">{user.email}</td>
                  <td className="p-4 font-medium text-slate-700">{user.nickname}</td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      user.role === 'admin'
                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {user.role === 'admin' ? (
                        <>
                          <ShieldCheck className="h-3 w-3" />
                          管理员
                        </>
                      ) : (
                        <>
                          <UserX className="h-3 w-3" />
                          学生
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleToggleRole(user.id, user.role)}
                      className={`px-2.5 py-1 border rounded-lg text-[10px] font-extrabold transition-all active:scale-95 shadow-xs ${
                        user.role === 'admin'
                          ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600'
                          : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600'
                      }`}
                    >
                      {user.role === 'admin' ? (
                        <span className="flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" />
                          撤销管理员
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          设为管理员
                        </span>
                      )}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 text-xs">
                    {loading ? '正在查询用户数据...' : '没有找到匹配的用户记录'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
