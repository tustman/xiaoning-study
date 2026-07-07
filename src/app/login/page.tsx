'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/db';
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successDesc, setSuccessDesc] = useState('');

  // Sync state if URL query changes
  useEffect(() => {
    const queryMode = searchParams.get('mode');
    if (queryMode === 'register') {
      setAuthMode('register');
    } else if (queryMode === 'login') {
      setAuthMode('login');
    }
  }, [searchParams]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (authMode === 'register' && !name)) {
      setError('请填写所有必填字段');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const { user, error: loginErr } = await db.signInWithEmail(email, password);
        if (loginErr) {
          setError(translateAuthError(loginErr));
        } else {
          setSuccessTitle('欢迎回来！');
          setSuccessDesc(`正在跳转至您的学习看板，${user?.nickname || email}...`);
          setSuccess(true);
          setTimeout(() => {
            router.push('/profile');
            // Refresh after a small delay to update session
            setTimeout(() => window.location.reload(), 150);
          }, 1500);
        }
      } else {
        const { user, requiresVerification, error: regErr } = await db.signUpWithEmail(email, password, name);
        if (regErr) {
          setError(translateAuthError(regErr));
        } else if (requiresVerification) {
          setSuccessTitle('注册成功！');
          setSuccessDesc('验证邮件已发送。请前往您的电子邮箱点击激活链接，完成验证后即可登录。');
          setSuccess(true);
          setEmail('');
          setPassword('');
          setName('');
        } else {
          setSuccessTitle('注册成功！');
          setSuccessDesc(`欢迎加入小宁学习，${user?.nickname || name}！正在跳转中...`);
          setSuccess(true);
          setTimeout(() => {
            router.push('/profile');
            setTimeout(() => window.location.reload(), 150);
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(translateAuthError(err.message || '操作失败，请重试'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setSuccessTitle('正在连接');
    setSuccessDesc(`正在通过 ${provider} 进行身份验证...`);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setError(`${provider} 登录暂时不可用，请使用邮箱密码登录。`);
    }, 1550);
  };

  return (
    <div className="w-full max-w-[420px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-8 sm:p-10 shadow-lg relative overflow-hidden transition-all duration-300">
      
      {!success ? (
        <>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 font-bold text-xl text-[var(--fg)] tracking-tight mb-4">
              <span className="w-8.5 h-8.5 bg-[var(--fg)] text-[var(--accent)] rounded-lg flex items-center justify-center text-[16px] font-extrabold shadow-sm">
                宁
              </span>
              小宁学习
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)] mb-1">
              {authMode === 'login' ? '欢迎回来' : '开始学习'}
            </h1>
            <p className="text-[13px] text-[var(--muted)]">
              {authMode === 'login' ? '登录后继续你的编程学习之旅' : '注册即开启你的编程学习之旅，全程免费试学'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-[var(--border)] mb-7">
            <button
              onClick={() => {
                setAuthMode('login');
                setError('');
              }}
              className={`flex-1 text-center pb-3 text-[14px] font-semibold transition-all border-b-2 cursor-pointer ${
                authMode === 'login'
                  ? 'border-[var(--accent)] text-[var(--fg)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--fg)]'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setError('');
              }}
              className={`flex-1 text-center pb-3 text-[14px] font-semibold transition-all border-b-2 cursor-pointer ${
                authMode === 'register'
                  ? 'border-[var(--accent)] text-[var(--fg)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--fg)]'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 text-[12.5px] rounded-lg bg-rose-50 border border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 font-medium font-sans">
                {error}
              </div>
            )}

            {authMode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--fg)] font-mono uppercase tracking-wider">昵称</label>
                <input
                  type="text"
                  placeholder="您的名字"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3.5 py-2.5 border border-[var(--border)] rounded-[var(--radius-md)] text-[14.5px] bg-[var(--surface)] text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors"
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[var(--fg)] font-mono uppercase tracking-wider">邮箱地址</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3.5 py-2.5 border border-[var(--border)] rounded-[var(--radius-md)] text-[14.5px] bg-[var(--surface)] text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[var(--fg)] font-mono uppercase tracking-wider">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={authMode === 'login' ? '••••••••' : '至少 8 位字符'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 border border-[var(--border)] rounded-[var(--radius-md)] text-[14.5px] bg-[var(--surface)] text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer p-1"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {authMode === 'login' && (
              <div className="flex justify-between items-center text-[12px]">
                <label className="flex items-center gap-2 text-[var(--muted)] cursor-pointer select-none">
                  <input type="checkbox" className="rounded border-[var(--border)] accent-[var(--accent)]" defaultChecked />
                  记住我
                </label>
                <a href="#" className="text-[var(--accent)] font-semibold hover:underline" onClick={(e) => { e.preventDefault(); alert('密码重置邮件功能暂未开启'); }}>
                  忘记密码？
                </a>
              </div>
            )}

            {authMode === 'register' && (
              <div className="text-[12px] text-[var(--muted)] leading-relaxed">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="mt-0.5 rounded border-[var(--border)] accent-[var(--accent)]" required />
                  <span>我已阅读并同意《用户协议》与《隐私政策》</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-3 font-semibold mt-2 cursor-pointer"
            >
              {loading ? '正在处理...' : authMode === 'login' ? '登 录' : '免费注册'}
            </button>

            <div className="flex items-center gap-4 text-[11px] text-[var(--muted)] font-mono my-2 select-none">
              <span className="flex-1 h-px bg-[var(--border)]"></span>
              或使用以下方式登录
              <span className="flex-1 h-px bg-[var(--border)]"></span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleSocialLogin('微信')}
                className="flex items-center justify-center p-2.5 border border-[var(--border)] rounded-[var(--radius-md)] hover:border-[var(--fg)] text-[var(--fg)] cursor-pointer bg-[var(--surface)] transition-colors"
                title="微信"
              >
                <svg className="h-4.5 w-4.5 stroke-current fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 4.5C5.9 4.5 3 7 3 10.1c0 1.8 1 3.4 2.6 4.5l-.6 1.9 2.2-1.1c.7.2 1.5.3 2.3.3h.4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 9.5c3.1 0 5.7 2.1 5.7 4.7 0 1.5-.9 2.9-2.3 3.8l.5 1.6-1.9-.9c-.6.2-1.3.3-2 .3-3.1 0-5.7-2.1-5.7-4.7s2.5-4.8 5.7-4.8z" />
                </svg>
              </button>
              
              <button
                type="button"
                onClick={() => handleSocialLogin('GitHub')}
                className="flex items-center justify-center p-2.5 border border-[var(--border)] rounded-[var(--radius-md)] hover:border-[var(--fg)] text-[var(--fg)] cursor-pointer bg-[var(--surface)] transition-colors"
                title="GitHub"
              >
                <svg className="h-4.5 w-4.5 stroke-current fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2-.2 4.5-1 4.5-4.5 0-1-.5-2-1-2.5.1-.5.4-1.5-.1-3 0 0-.9-.3-3 1a11 11 0 0 0-5.6 0c-2.1-1.3-3-1-3-1-.5 1.5-.2 2.5-.1 3-.5.5-1 1.5-1 2.5 0 3.5 2.5 4.3 4.5 4.5-.3.3-.5.9-.5 1.5v3.5" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center p-2.5 border border-[var(--border)] rounded-[var(--radius-md)] hover:border-[var(--fg)] text-[var(--fg)] cursor-pointer bg-[var(--surface)] transition-colors"
                title="Google"
              >
                <svg className="h-4.5 w-4.5 stroke-current fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.2c0-.7-.1-1.4-.2-2H12v3.9h5c-.2 1.2-.9 2.2-2 2.9v2.4h3.1c1.9-1.7 2.9-4.2 2.9-7.2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c2.6 0 4.8-.9 6.1-2.4l-3.1-2.4c-.9.6-2 .9-3 .9-2.3 0-4.3-1.5-5-3.6H3.8v2.4C5.2 19 8.4 21 12 21z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 13.5c-.2-.6-.3-1.3-.3-1.9s.1-1.3.3-1.9V7.3H3.8A9 9 0 0 0 3 11.6c0 1.5.4 2.9 1 4.1z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.1c1.4 0 2.7.5 3.6 1.4l2.8-2.7C16.8 3.2 14.6 2.2 12 2.2 8.4 2.2 5.2 4.3 3.8 7.3l3.2 2.4c.7-2.1 2.7-3.6 5-3.6z" />
                </svg>
              </button>
            </div>
          </form>

          <div className="text-center text-[12.5px] text-[var(--muted)] mt-6">
            {authMode === 'login' ? (
              <>
                还没有账号？{' '}
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-[var(--accent)] font-semibold hover:underline cursor-pointer bg-none border-none p-0"
                >
                  立即注册
                </button>
              </>
            ) : (
              <>
                已经有账号？{' '}
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-[var(--accent)] font-semibold hover:underline cursor-pointer bg-none border-none p-0"
                >
                  立即登录
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        /* SUCCESS STATE */
        <div className="py-10 text-center animate-fade-in">
          <div className="w-13 h-13 rounded-full bg-[var(--fg)] text-[var(--accent)] flex items-center justify-center mx-auto mb-6 shadow-md">
            <Check className="h-6 w-6 stroke-[3px]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--fg)] mb-2">{successTitle}</h2>
          <p className="text-[13.5px] text-[var(--muted)] leading-relaxed max-w-xs mx-auto">{successDesc}</p>
          {authMode === 'register' && (
            <button
              onClick={() => setSuccess(false)}
              className="btn btn-outline py-2 px-5 text-xs font-semibold mt-6 cursor-pointer"
            >
              返回登录
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col items-center justify-center p-6 relative">
      <Link href="/" className="fixed top-6 left-6 inline-flex items-center gap-1.5 text-[13.5px] text-[var(--muted)] hover:text-[var(--fg)] transition-colors font-medium">
        <ArrowLeft className="h-4 w-4" />
        返回首页
      </Link>
      <Suspense fallback={
        <div className="w-full max-w-[420px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-10 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </main>
  );
}
