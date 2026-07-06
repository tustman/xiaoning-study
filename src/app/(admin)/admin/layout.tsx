'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { db, UserProfile } from '@/lib/db';
import { Shield, BookOpen, Receipt, Home, ShieldAlert, ChevronRight, User } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
    setLoading(false);
  }, [pathname]);

  const handleRoleToggleToAdmin = () => {
    db.signIn('admin@example.com', 'admin');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 403 Forbidden Access check
  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-3xl text-center border border-rose-200 shadow-lg bg-white">
          <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-8 w-8 text-rose-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">403 - 拒绝访问</h1>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            该页面为管理后台（B 端），仅限管理员（Admin）角色访问。您的当前账户身份为普通学生。
          </p>
          <div className="flex flex-col gap-3">
            <button
              id="switch-admin-btn"
              onClick={handleRoleToggleToAdmin}
              className="w-full py-3 rounded-2xl text-xs font-bold bg-slate-900 hover:bg-slate-850 active:scale-95 transition-all text-white"
            >
              切换为管理员身份
            </button>
            <Link
              href="/"
              className="w-full py-3 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all block"
            >
              返回学生端首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f8f9fa]">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 bg-white p-4">
        <div className="flex items-center gap-2 px-3 py-4 border-b border-slate-100 mb-6">
          <Shield className="h-5 w-5 text-slate-800" />
          <span className="font-extrabold text-sm tracking-widest text-slate-800">
            控制台管理系统
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5">
          <Link
            id="admin-courses-nav"
            href="/admin/courses"
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              pathname.includes('/admin/courses')
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-4 w-4" />
              课程与课时管理
            </div>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </Link>

          <Link
            id="admin-orders-nav"
            href="/admin/orders"
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              pathname.includes('/admin/orders')
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Receipt className="h-4 w-4" />
              交易订单管理
            </div>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </Link>
        </nav>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
              <User className="h-4 w-4 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-700 truncate">管理员</p>
              <p className="text-[9px] text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>
          <Link href="/" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all">
            <Home className="h-4 w-4" />
          </Link>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 w-full bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-slate-800" />
            <span className="font-extrabold text-xs tracking-wider">控制台管理</span>
          </div>
          
          <div className="flex gap-2">
            <Link
              href="/admin/courses"
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                pathname.includes('/admin/courses') ? 'bg-slate-900 text-white' : 'text-slate-500 bg-slate-50'
              }`}
            >
              课程
            </Link>
            <Link
              href="/admin/orders"
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                pathname.includes('/admin/orders') ? 'bg-slate-900 text-white' : 'text-slate-500 bg-slate-50'
              }`}
            >
              订单
            </Link>
            <Link href="/" className="px-2 py-1.5 rounded-lg bg-slate-50 text-slate-500">
              <Home className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
