'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { db, UserProfile } from '@/lib/db';
import { Shield, BookOpen, Receipt, Home, ShieldAlert, ChevronRight, User } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
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
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 403 Forbidden Access check
  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-3xl text-center border border-rose-500/20 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-8 w-8 text-rose-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">403 - 权限受限</h1>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            该页面为管理后台（B 端），仅限管理员（Admin）角色访问。您的当前账户身份为普通学生。
          </p>
          <div className="flex flex-col gap-3">
            <button
              id="switch-admin-btn"
              onClick={handleRoleToggleToAdmin}
              className="w-full py-3 rounded-2xl text-xs font-bold bg-brand-500 hover:bg-brand-600 active:scale-95 transition-all text-white"
            >
              切换为管理员身份
            </button>
            <Link
              href="/"
              className="w-full py-3 rounded-2xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-all block"
            >
              返回学生端首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#09090b]">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-900 bg-zinc-950/70 p-4">
        <div className="flex items-center gap-2 px-3 py-4 border-b border-zinc-900 mb-6">
          <Shield className="h-5 w-5 text-brand-400" />
          <span className="font-extrabold text-sm tracking-widest text-zinc-200">
            控制台管理系统
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5">
          <Link
            id="admin-courses-nav"
            href="/admin/courses"
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              pathname.includes('/admin/courses')
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
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
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Receipt className="h-4 w-4" />
              交易订单管理
            </div>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </Link>
        </nav>

        <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-905 border border-zinc-800 flex items-center justify-center">
              <User className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-zinc-300 truncate">管理员</p>
              <p className="text-[9px] text-zinc-500 truncate">{currentUser.email}</p>
            </div>
          </div>
          <Link href="/" className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all">
            <Home className="h-4 w-4" />
          </Link>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 w-full bg-zinc-950 border-b border-zinc-900 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-400" />
            <span className="font-extrabold text-xs tracking-wider">控制台管理</span>
          </div>
          
          <div className="flex gap-2">
            <Link
              href="/admin/courses"
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                pathname.includes('/admin/courses') ? 'bg-brand-500 text-white' : 'text-zinc-400 bg-zinc-900'
              }`}
            >
              课程管理
            </Link>
            <Link
              href="/admin/orders"
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                pathname.includes('/admin/orders') ? 'bg-brand-500 text-white' : 'text-zinc-400 bg-zinc-900'
              }`}
            >
              订单管理
            </Link>
            <Link href="/" className="px-2 py-1.5 rounded-lg bg-zinc-900 text-zinc-400">
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
