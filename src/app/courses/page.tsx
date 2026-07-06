'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, Course, Lesson, UserProfile } from '@/lib/db';
import { Mail, Key, Sparkles, X, Play, BookOpen, Star } from 'lucide-react';

interface ExtendedCourse extends Course {
  lessons: Lesson[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<ExtendedCourse[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const allCourses = await db.getCourses();
      const published = allCourses.filter(c => c.status === 'published');
      
      const coursesWithLessons: ExtendedCourse[] = [];
      for (const course of published) {
        const lessons = await db.getLessons(course.id);
        coursesWithLessons.push({
          ...course,
          lessons: lessons.sort((a, b) => a.order_index - b.order_index)
        });
      }
      setCourses(coursesWithLessons);
      
      const activeUser = await db.syncSessionUserProfile();
      setCurrentUser(activeUser);
      setLoading(false);
    }
    loadData();
  }, []);

  const translateAuthError = (err: string): string => {
    if (!err) return '';
    const errMsg = err.toLowerCase();
    if (errMsg.includes('email not confirmed')) {
      return '邮箱尚未激活，请先前往您的邮箱点击确认链接完成验证。';
    }
    if (errMsg.includes('invalid login credentials') || errMsg.includes('invalid credentials')) {
      return '邮箱或密码不正确，请确认后重新输入。';
    }
    if (errMsg.includes('user already exists')) {
      return '该邮箱地址已被注册，请切换至登录面板进行登录。';
    }
    if (errMsg.includes('password should be at least')) {
      return '密码安全度不足，长度至少需要 6 位字符。';
    }
    return err;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const { user, error } = await db.signInWithEmail(authEmail, authPassword);
        if (error) {
          setAuthError(translateAuthError(error));
        } else {
          setCurrentUser(user);
          setShowAuthModal(false);
          window.location.reload();
        }
      } else {
        const { user, requiresVerification, error } = await db.signUpWithEmail(authEmail, authPassword, 'user');
        if (error) {
          setAuthError(translateAuthError(error));
        } else if (requiresVerification) {
          setAuthSuccess('注册成功！验证邮件已发送。请前往您的电子邮箱点击激活链接，完成验证后即可在此处登录。');
          setAuthEmail('');
          setAuthPassword('');
        } else {
          setCurrentUser(user);
          setShowAuthModal(false);
          window.location.reload();
        }
      }
    } catch (err: any) {
      setAuthError(translateAuthError(err.message || '操作失败，请重试'));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await db.signOut();
    setCurrentUser(null);
    window.location.reload();
  };

  const getCourseLevel = (price: number, title: string) => {
    const t = title.toLowerCase();
    if (t.includes('实战') || t.includes('企业级') || price > 200) {
      return { label: '进阶', className: 'level-intermediate' };
    }
    if (t.includes('高级') || t.includes('架构') || price > 400) {
      return { label: '高级', className: 'level-advanced' };
    }
    return { label: '入门', className: 'level-beginner' };
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#fafbfe]">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-slate-500 text-xs font-semibold">正在载入课程列表...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      
      {/* ===== NAVIGATION ===== */}
      <nav className="sticky top-0 z-45 backdrop-blur-md border-b border-[var(--border)] bg-white/80">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-[20px] text-[var(--fg)] tracking-tight">
            <span className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white text-[16px] font-bold shadow-sm">
              宁
            </span>
            小宁学习
          </Link>
          
          <div className="hidden md:flex items-center gap-1 font-medium text-sm text-[var(--muted)]">
            <Link href="/" className="px-4 py-2 rounded-md hover:text-[var(--fg)] hover:bg-[var(--border)]">
              首页
            </Link>
            <Link href="/courses" className="px-4 py-2 rounded-md hover:text-[var(--fg)] hover:bg-[var(--border)] text-[var(--accent)] font-semibold">
              课程
            </Link>
            {currentUser && (
              <Link href="/profile" className="px-4 py-2 rounded-md hover:text-[var(--fg)] hover:bg-[var(--border)]">
                我的学习
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                {currentUser.role === 'admin' && (
                  <Link 
                    href="/admin/courses" 
                    className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-[12px] font-bold bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 transition-all"
                  >
                    管理后台
                  </Link>
                )}
                
                <div className="flex items-center gap-2 text-[13px] bg-slate-100/80 border border-[var(--border)] rounded-lg px-3.5 py-2">
                  <span className="font-semibold text-[var(--fg)] truncate max-w-[80px]">
                    {currentUser.nickname}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="ml-1 text-slate-400 hover:text-rose-500 font-semibold transition-all cursor-pointer"
                  >
                    退出
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                    setAuthSuccess('');
                    setShowAuthModal(true);
                  }}
                  className="btn btn-ghost px-5 py-2 text-sm font-semibold"
                >
                  登录
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                    setAuthSuccess('');
                    setShowAuthModal(true);
                  }}
                  className="btn btn-primary px-5 py-2 text-sm font-semibold"
                >
                  免费注册
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ===== PAGE HEADER ===== */}
      <div className="max-w-[1200px] mx-auto w-full px-6 py-12">
        <h1 className="text-[28px] sm:text-[38px] font-bold tracking-tight text-[var(--fg)]">全部课程</h1>
        <p className="text-base text-[var(--muted)] mt-1.5">找到适合你当前水平的课程，从入门到精通，系统化学习编程。</p>
      </div>

      {/* ===== COURSES GRID ===== */}
      <main className="max-w-[1200px] mx-auto w-full px-6 flex-1 mb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const priceVal = Number(course.price);
            const levelInfo = getCourseLevel(priceVal, course.title);
            
            return (
              <div 
                key={course.id}
                onClick={() => window.location.href = `/courses/${course.id}`}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden transition-all duration-200 hover:translate-y-[-3px] hover:shadow-lg hover:shadow-slate-900/5 hover:border-slate-350 cursor-pointer flex flex-col justify-between"
              >
                
                {/* Course Card Thumb */}
                <div 
                  className="h-40 relative flex items-center justify-center overflow-hidden bg-slate-100"
                >
                  {course.cover_image ? (
                    <img 
                      src={course.cover_image} 
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-[oklch(from_var(--accent)_0.94_0.03_255)] flex items-center justify-center text-4xl">
                      宁
                    </div>
                  )}
                  
                  {/* Level Tag */}
                  <span className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${
                    levelInfo.label === '入门' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 
                    levelInfo.label === '进阶' ? 'bg-amber-50 text-amber-600 border border-amber-100/50' : 
                    'bg-rose-50 text-rose-600 border border-rose-100/50'
                  }`}>
                    {levelInfo.label}
                  </span>

                  <span className="absolute z-10 w-11 h-11 rounded-full bg-white/95 flex items-center justify-center text-[var(--accent)] text-xs shadow-md shadow-black/5 opacity-0 hover:opacity-100 hover:scale-105 transition-all">
                    ▶
                  </span>
                </div>

                {/* Course Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-[17px] text-[var(--fg)] leading-snug line-clamp-1 mb-1.5">
                      {course.title}
                    </h3>
                    <div 
                      className="text-[13px] text-[var(--muted)] leading-relaxed line-clamp-2 mb-3.5"
                      dangerouslySetInnerHTML={{ __html: course.description }}
                    />
                    
                    {/* Meta Row */}
                    <div className="flex items-center gap-4 text-[12px] text-[var(--muted)] font-medium">
                      <span>📹 {course.lessons.length} 课时</span>
                      <span>⏱ {Math.ceil(course.lessons.reduce((acc, curr) => acc + curr.duration, 0) / 3600)} 小时</span>
                      <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-400 stroke-amber-400" /> 4.9</span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-[var(--border)] mt-4.5 pt-4 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[13px] text-[var(--muted)] font-medium">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-500">
                        小
                      </span>
                      小宁老师
                    </span>
                    <span className={`font-semibold text-[15px] ${priceVal === 0 ? 'text-emerald-600' : 'text-[var(--accent)]'}`}>
                      {priceVal === 0 ? '免费' : `¥${priceVal.toFixed(2)}`}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}

          {courses.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-[var(--border)]">
              <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-semibold">暂无上架课程，敬请期待。</p>
            </div>
          )}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[var(--border)] bg-white py-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid gap-10 md:grid-cols-4 mb-12">
            <div className="md:col-span-1">
              <span className="flex items-center gap-2 font-bold text-base text-[var(--fg)] tracking-tight mb-4">
                <span className="w-7 h-7 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white text-sm font-extrabold shadow-sm">
                  宁
                </span>
                小宁学习
              </span>
              <p className="text-xs text-[var(--muted)] leading-relaxed max-w-xs">
                让每个人都能学会编程。小宁学习 — 用心做教育，用技术改变未来。
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-4">精选课程</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-[var(--muted)]">
                <li><Link href="/courses" className="hover:text-[var(--fg)]">Python 入门</Link></li>
                <li><Link href="/courses" className="hover:text-[var(--fg)]">前端 React 实战</Link></li>
                <li><Link href="/courses" className="hover:text-[var(--fg)]">AI 应用开发</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-4">关于学堂</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-[var(--muted)]">
                <li><a href="#" className="hover:text-[var(--fg)]">讲师简介</a></li>
                <li><a href="#" className="hover:text-[var(--fg)]">帮助中心</a></li>
                <li><a href="#" className="hover:text-[var(--fg)]">联系我们</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-4">法律条款</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-[var(--muted)]">
                <li><a href="#" className="hover:text-[var(--fg)]">用户协议</a></li>
                <li><a href="#" className="hover:text-[var(--fg)]">隐私政策</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[var(--muted)] gap-3">
            <span>© 2026 小宁学习. All rights reserved.</span>
            <span>用 ❤️ 做教育</span>
          </div>
        </div>
      </footer>

      {/* AUTHENTICATION DIALOG MODAL OVERLAY */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[var(--border)] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-50 p-5 border-b border-[var(--border)] flex items-center justify-between">
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

              {authSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold leading-relaxed animate-pulse">
                  ✓ {authSuccess}
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase">
                  邮箱地址
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="bg-white border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase">
                  登录密码
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-2 py-3 bg-[var(--accent)] hover:bg-[var(--accent-glow)] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm cursor-pointer border-none"
              >
                {authLoading ? '请稍候...' : authMode === 'login' ? '确认登录' : '立即注册'}
              </button>

              {/* Switch Mode Link */}
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError('');
                    setAuthSuccess('');
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                  }}
                  className="text-xs text-blue-600 hover:underline transition-all cursor-pointer font-medium bg-transparent border-none"
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
