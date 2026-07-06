'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, Course, UserProfile } from '@/lib/db';
import { BookOpen, Shield, Play, GraduationCap, User, LogOut, Key, Mail, Sparkles, X } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRole, setAuthRole] = useState<'user' | 'admin'>('user');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const allCourses = await db.getCourses();
      setCourses(allCourses.filter(c => c.status === 'published'));
      
      // Sync real Supabase session
      const activeUser = await db.syncSessionUserProfile();
      setCurrentUser(activeUser);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const { user, error } = await db.signInWithEmail(authEmail, authPassword);
        if (error) {
          setAuthError(error);
        } else {
          setCurrentUser(user);
          setShowAuthModal(false);
          window.location.reload();
        }
      } else {
        const { user, requiresVerification, error } = await db.signUpWithEmail(authEmail, authPassword, 'user');
        if (error) {
          setAuthError(error);
        } else if (requiresVerification) {
          alert('注册成功！确认邮件已发送至您的邮箱，请点击邮件中的链接激活账号后再进行登录。');
          setShowAuthModal(false);
          setAuthEmail('');
          setAuthPassword('');
        } else {
          alert('注册成功并登录！');
          setCurrentUser(user);
          setShowAuthModal(false);
          window.location.reload();
        }
      }
    } catch (err: any) {
      setAuthError(err.message || '操作失败，请重试');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('确定要退出登录吗？')) {
      await db.signOut();
      setCurrentUser(null);
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa]">
        <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 text-xs">正在加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] text-[#1e293b] min-h-screen pb-24 relative">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/50 backdrop-blur-md px-4 py-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-slate-800" />
          <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            小宁学堂
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {currentUser.role === 'admin' && (
                <Link 
                  id="admin-dashboard-link"
                  href="/admin/courses" 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-600 hover:bg-blue-500/20 transition-all"
                >
                  <Shield className="h-3 w-3" />
                  管理后台
                </Link>
              )}
              
              <div className="flex items-center gap-2 text-xs bg-slate-100 border border-slate-200/80 rounded-full px-3 py-1.5">
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span className="font-bold text-slate-700 truncate max-w-[80px]">
                  {currentUser.nickname}
                </span>
                <span className="text-[9px] px-1 bg-slate-200 rounded font-bold text-slate-500">
                  {currentUser.role === 'admin' ? '管理员' : '学员'}
                </span>
                <button
                  id="sign-out-btn"
                  onClick={handleSignOut}
                  className="ml-1 hover:text-rose-500 text-slate-400 transition-all cursor-pointer"
                  title="退出登录"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <button
              id="open-auth-modal-btn"
              onClick={() => {
                setAuthError('');
                setShowAuthModal(true);
              }}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              登录 / 注册
            </button>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative px-4 py-12 sm:px-8 text-center max-w-4xl mx-auto mt-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/5 blur-3xl rounded-full -z-10 pointer-events-none animate-pulse-slow"></div>
        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-200/50 border border-slate-300/30 text-slate-600">
          🚀 Next.js 15 & Supabase 真实邮箱鉴权集成
        </span>
        <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight leading-tight bg-gradient-to-b from-slate-900 to-slate-700 bg-clip-text text-transparent">
          怎么方便，怎么学
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          小宁学堂为您精心打造精品移动端课程，支持 HLS 视频防盗鉴权、7pay 支付极速闭环，以及全套管理后台。
        </p>
      </section>

      {/* Course List Catalog */}
      <main className="px-4 max-w-xl sm:max-w-4xl mx-auto w-full mt-6 flex-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          精品推荐
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {courses.map((course) => (
            <div key={course.id} className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
              <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                <img 
                  src={course.cover_image} 
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <span className="absolute top-3 right-3 px-2 py-1 text-[9px] font-bold tracking-wider rounded-md uppercase bg-white/90 text-slate-700 border border-slate-200 backdrop-blur-xs">
                  已上架
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 line-clamp-1 leading-snug">
                    {course.title}
                  </h3>
                  <div 
                    className="text-xs text-slate-500 mt-2 line-clamp-2 prose"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                </div>

                <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">应付学费</span>
                    <span className="text-base font-black text-slate-800">
                      ¥ {Number(course.price).toFixed(2)}
                    </span>
                  </div>

                  <Link
                    id={`view-course-${course.id}`}
                    href={`/courses/${course.id}`}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-900/10"
                  >
                    开始学习
                    <Play className="h-3 w-3 fill-current" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {courses.length === 0 && (
            <div className="col-span-full py-16 text-center glass-card rounded-2xl">
              <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-xs">暂无上架课程，请以管理员身份登录并在后台创建。</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer / Mobile Safety Bottom */}
      <footer className="mt-16 border-t border-slate-200/50 py-6 px-4 text-center text-[10px] text-slate-400 safe-pb">
        <p>© 2026 小宁学堂. All Rights Reserved.</p>
        <p className="mt-0.5 text-[9px] text-slate-350">基于 Next.js & Supabase & 7pay 构建</p>
      </footer>

      {/* AUTHENTICATION DIALOG MODAL OVERLAY */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-50 p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-slate-800" />
                <h3 className="font-extrabold text-sm text-slate-800">
                  {authMode === 'login' ? '学员登录' : '快速注册'}
                </h3>
              </div>
              <button
                id="close-auth-modal-btn"
                onClick={() => setShowAuthModal(false)}
                className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAuthSubmit} className="p-5 flex flex-col gap-4">
              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold leading-relaxed">
                  ⚠️ {authError}
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  邮箱地址
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Key className="h-3 w-3" />
                  登录密码
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-slate-900/10 cursor-pointer"
              >
                {authLoading ? '请稍候...' : authMode === 'login' ? '确认登录' : '立即注册'}
              </button>

              {/* Switch Mode Link */}
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError('');
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                  }}
                  className="text-xs text-blue-600 hover:underline transition-all cursor-pointer font-medium"
                >
                  {authMode === 'login' ? '没有账号？去注册新账号' : '已有账号？去登录'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
