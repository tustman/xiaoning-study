'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, UserProfile } from '@/lib/db';
import { Mail, Key, Sparkles, X } from 'lucide-react';

export default function Home() {
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
      // Sync real Supabase session
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#fafbfe]">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-slate-500 text-xs font-semibold">正在载入小宁学习...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      
      {/* ===== NAVIGATION ===== */}
      <nav className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--border)] bg-white/80">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-[20px] text-[var(--fg)] tracking-tight">
            <span className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white text-[16px] font-bold shadow-sm">
              宁
            </span>
            小宁学习
          </Link>
          
          <div className="hidden md:flex items-center gap-1 font-medium text-sm text-[var(--muted)]">
            <Link href="/" className="px-4 py-2 rounded-md hover:text-[var(--fg)] hover:bg-[var(--border)] text-[var(--accent)] active font-semibold">
              首页
            </Link>
            <Link href="/courses" className="px-4 py-2 rounded-md hover:text-[var(--fg)] hover:bg-[var(--border)]">
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
                  <span className="font-semibold text-[var(--fg)] truncate max-w-[90px]">
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

      {/* ===== HERO ===== */}
      <section className="relative py-24 sm:py-32 text-center max-w-[1200px] mx-auto w-full px-6 overflow-hidden">
        {/* Subtle glow background */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,oklch(from_var(--accent)_0.92_0.04_255)_0%,transparent_70%)] opacity-50 pointer-events-none -z-10"></div>
        
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-[var(--accent-subtle)] text-[var(--accent)] mb-6 font-mono tracking-wide">
          ✦ 零基础也能学会编程
        </div>
        
        <h1 className="text-4xl sm:text-6.5xl font-bold tracking-tight leading-[1.1] text-[var(--fg)] max-w-4xl mx-auto">
          从零开始，<span className="text-[var(--accent)]">学会编程</span><br />改变未来
        </h1>
        
        <p className="mt-6 text-[16px] sm:text-lg text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
          小宁学习为你提供从入门到实战的系统编程课程。AI 辅助教学、项目驱动、社区陪伴，让学编程不再孤单。
        </p>

        <div className="flex justify-center gap-3 mt-10">
          <Link href="/courses" className="btn btn-primary font-semibold">
            立即开始选课
          </Link>
          <a href="#features" className="btn btn-outline font-semibold">
            了解平台特色
          </a>
        </div>
      </section>

      <section id="features" className="py-20 border-t border-[var(--border)] bg-white/40">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-mono text-[13px] text-[var(--accent)] tracking-widest uppercase font-medium">
              为什么选择小宁学习
            </span>
            <h2 className="text-[28px] md:text-[36px] lg:text-[40px] font-bold text-[var(--fg)] mt-3 leading-tight">不只是看视频，是真正学会</h2>
            <p className="text-[15px] sm:text-[16px] text-[var(--muted)] mt-2">我们构建了一套完整的学习闭环，确保每个人都能跟上。</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-8 border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)] hover:border-slate-350 transition-all">
              <div className="w-11 h-11 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center text-lg mb-5">
                ⌨
              </div>
              <h3 className="font-semibold text-lg text-[var(--fg)] mb-2">项目驱动学习</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">每门课程都包含多个实战项目，边学边做，在真实场景中掌握技能。</p>
            </div>

            <div className="p-8 border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)] hover:border-slate-350 transition-all">
              <div className="w-11 h-11 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center text-lg mb-5">
                🤖
              </div>
              <h3 className="font-semibold text-lg text-[var(--fg)] mb-2">AI 助教陪伴</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">遇到问题随时向 AI 助教提问，不用等老师回复，24 小时全天候答疑。</p>
            </div>

            <div className="p-8 border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)] hover:border-slate-350 transition-all">
              <div className="w-11 h-11 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center text-lg mb-5">
                👥
              </div>
              <h3 className="font-semibold text-lg text-[var(--fg)] mb-2">社区互助成长</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">加入学习社群，和志同道合的伙伴一起打卡、讨论、组队做项目。</p>
            </div>

            <div className="p-8 border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)] hover:border-slate-350 transition-all">
              <div className="w-11 h-11 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center text-lg mb-5">
                📊
              </div>
              <h3 className="font-semibold text-lg text-[var(--fg)] mb-2">学习路径规划</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">根据你的基础 and 目标，智能推荐学习路径，避免走弯路。</p>
            </div>

            <div className="p-8 border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)] hover:border-slate-350 transition-all">
              <div className="w-11 h-11 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center text-lg mb-5">
                🏆
              </div>
              <h3 className="font-semibold text-lg text-[var(--fg)] mb-2">成就激励系统</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">完成任务获得勋章和学分，保持学习动力，让进步可见。</p>
            </div>

            <div className="p-8 border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)] hover:border-slate-350 transition-all">
              <div className="w-11 h-11 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center text-lg mb-5">
                📱
              </div>
              <h3 className="font-semibold text-lg text-[var(--fg)] mb-2">多端同步学习</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">电脑、平板、手机，学习进度实时同步，随时随地都能学。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 border-t border-[var(--border)] bg-slate-50/30">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-mono text-[13px] text-[var(--accent)] tracking-widest uppercase font-medium">
              学员心声
            </span>
            <h2 className="text-[28px] md:text-[36px] font-bold text-[var(--fg)] mt-3 leading-tight">他们在这里改变了职业轨迹</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="p-8 border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)]">
              <p className="text-base italic leading-relaxed text-[var(--fg)] mb-6">
                「零基础转行学 Python，3 个月后做出了自己的第一个 Web 应用。小宁学习的项目驱动方式真的非常适合自学。」
              </p>
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-semibold text-base">
                  李
                </span>
                <div>
                  <div className="font-semibold text-[15px]">李小明</div>
                  <div className="text-[13px] text-[var(--muted)] mt-0.5">Python 全栈 · 在职转行</div>
                </div>
              </div>
            </div>

            <div className="p-8 border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)]">
              <p className="text-base italic leading-relaxed text-[var(--fg)] mb-6">
                「AI 助教功能太强了，遇到 BUG 直接提问就能得到解答。比起自己百度效率提升太多了，强烈推荐！」
              </p>
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-semibold text-base">
                  陈
                </span>
                <div>
                  <div className="font-semibold text-[15px]">陈思远</div>
                  <div className="text-[13px] text-[var(--muted)] mt-0.5">前端开发 · 大三学生</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 border-t border-[var(--border)] px-6">
        <div className="max-w-[1200px] mx-auto bg-[var(--fg)] text-white rounded-[var(--radius-xl)] p-12 sm:p-16 text-center">
          <h2 className="text-[28px] sm:text-[38px] font-bold tracking-tight mb-3">开始你的编程之旅</h2>
          <p className="text-base opacity-80 mb-8 max-w-lg mx-auto">用编程打开新世界的大门。</p>
          <button 
            onClick={() => {
              if (currentUser) {
                window.location.href = '/courses';
              } else {
                setAuthMode('register');
                setAuthError('');
                setAuthSuccess('');
                setShowAuthModal(true);
              }
            }}
            className="btn bg-white text-[var(--fg)] hover:bg-slate-100 font-semibold"
          >
            {currentUser ? '浏览精选课程 →' : '免费注册账号 →'}
          </button>
        </div>
      </section>

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
              <p className="text-sm text-[var(--muted)] leading-relaxed max-w-xs">
                让每个人都能学会编程。小宁学习 — 用心做教育，用技术改变未来。
              </p>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">精选课程</h4>
              <ul className="flex flex-col gap-3 text-sm text-[var(--muted)]">
                <li><Link href="/courses" className="hover:text-[var(--fg)]">Python 入门</Link></li>
                <li><Link href="/courses" className="hover:text-[var(--fg)]">前端 React 实战</Link></li>
                <li><Link href="/courses" className="hover:text-[var(--fg)]">AI 应用开发</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">关于学堂</h4>
              <ul className="flex flex-col gap-3 text-sm text-[var(--muted)]">
                <li><a href="#" className="hover:text-[var(--fg)]">讲师简介</a></li>
                <li><a href="#" className="hover:text-[var(--fg)]">帮助中心</a></li>
                <li><a href="#" className="hover:text-[var(--fg)]">联系我们</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">法律条款</h4>
              <ul className="flex flex-col gap-3 text-sm text-[var(--muted)]">
                <li><a href="#" className="hover:text-[var(--fg)]">用户协议</a></li>
                <li><a href="#" className="hover:text-[var(--fg)]">隐私政策</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row justify-between items-center text-[13px] text-[var(--muted)] gap-3">
            <span>© 2026 小宁学习. All rights reserved.</span>
            <span>用 ❤️ 做教育</span>
          </div>
        </div>
      </footer>

      {/* AUTHENTICATION DIALOG MODAL OVERLAY */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[var(--border)] rounded-3xl w-full max-w-[420px] overflow-hidden shadow-2xl relative flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-50 p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-slate-800" />
                <h3 className="font-semibold text-[17px] text-slate-800">
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
                <label className="text-[13px] font-semibold text-[var(--fg)]">
                  邮箱地址
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="bg-white border border-[var(--border)] rounded-xl px-4 py-3 text-[15px] text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[var(--fg)]">
                  登录密码
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white border border-[var(--border)] rounded-xl px-4 py-3 text-[15px] text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-2 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-glow)] text-white rounded-xl text-[15px] font-semibold transition-all disabled:opacity-50 shadow-sm cursor-pointer border-none"
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
                  className="text-sm text-blue-600 hover:underline transition-all cursor-pointer font-medium bg-transparent border-none"
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
