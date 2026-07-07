'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, UserProfile } from '@/lib/db';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [openFaq, setOpenFaq] = useState<number | null>(0); // Default first FAQ open

  useEffect(() => {
    async function loadData() {
      // Get current theme
      const savedTheme = localStorage.getItem('xiaoning-theme');
      if (savedTheme === 'dark') {
        setTheme('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        setTheme('light');
        document.documentElement.removeAttribute('data-theme');
      }

      // Sync user profile
      const activeUser = await db.syncSessionUserProfile();
      setCurrentUser(activeUser);
      setLoading(false);
    }
    loadData();
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('xiaoning-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('xiaoning-theme', 'light');
    }
  };

  const handleSignOut = async () => {
    await db.signOut();
    setCurrentUser(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[var(--bg)]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-[var(--muted)] text-xs font-semibold">正在载入小宁学习...</p>
      </div>
    );
  }

  const faqItems = [
    {
      q: "我完全没有编程基础，能学会吗？",
      a: "可以。课程从最基础的概念开始，配合真实项目循序渐进，并有 AI 助教随时答疑，专为零基础学员设计。"
    },
    {
      q: "学完能做什么？",
      a: "你会积累多个完整的实战项目经验，具备独立开发网站、应用或参与团队开发的基础能力，可作为求职或转型的作品集。"
    },
    {
      q: "课程会持续更新吗？",
      a: "会。课程内容持续迭代，紧跟主流技术栈和工具的变化，购买后可长期访问最新内容。"
    },
    {
      q: "购买后如何开始学习？",
      a: "登录账号后，在「我的学习」页面即可看到已购课程，按顺序观看视频、完成配套练习即可。"
    },
    {
      q: "遇到问题可以怎么提问？",
      a: "课程内置 AI 助教，可随时针对代码报错或知识点提问；同时也有学习社群供同学之间互相交流。"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      
      {/* ===== ANNOUNCEMENT BAR ===== */}
      <div className="bg-[var(--accent)] text-white text-[13.5px] font-medium py-2.5 text-center">
        <div className="max-w-[1180px] mx-auto px-6 flex items-center justify-center gap-3.5 flex-wrap">
          <span>新课程上线：AI 应用开发实战 已加入课程库</span>
          <Link href="/courses" className="btn bg-white text-[var(--accent)] hover:bg-[oklch(96%_0.01_258)] py-1.5 px-4 text-xs font-semibold rounded-full">
            立即查看
          </Link>
        </div>
      </div>

      {/* ===== NAVIGATION ===== */}
      <nav className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--border)] bg-[oklch(from_var(--bg)_l_c_h_/_0.82)]">
        <div className="max-w-[1180px] mx-auto px-6 flex items-center justify-between h-16.5">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-[19px] tracking-tight text-[var(--fg)]">
            <span className="w-7.5 h-7.5 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white text-[15px] font-extrabold">
              宁
            </span>
            小宁学习
          </Link>
          
          <div className="hidden md:flex items-center gap-0.5 font-medium text-[14.5px]">
            <Link href="/" className="px-4 py-2 rounded-[var(--radius-sm)] text-[var(--fg)] bg-[var(--surface-2)] font-semibold">
              首页
            </Link>
            <Link href="/courses" className="px-4 py-2 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors">
              课程
            </Link>
            {currentUser && (
              <Link href="/profile" className="px-4 py-2 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors">
                我的学习
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--accent)] flex items-center justify-center cursor-pointer transition-colors"
              onClick={toggleTheme}
              aria-label="切换深色模式"
            >
              {theme === 'dark' ? (
                <svg className="h-4.5 w-4.5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg className="h-4.5 w-4.5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2.5">
                {currentUser.role === 'admin' && (
                  <Link 
                    href="/admin/courses" 
                    className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-[12px] font-bold bg-blue-50 border border-blue-100 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400 hover:bg-blue-100 transition-all"
                  >
                    管理后台
                  </Link>
                )}
                
                <div className="flex items-center gap-2 text-[13px] bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2">
                  <span className="font-semibold text-[var(--fg)] truncate max-w-[80px]">
                    {currentUser.nickname}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="ml-1 text-[var(--muted)] hover:text-rose-500 font-semibold transition-all cursor-pointer bg-none border-none p-0"
                  >
                    退出
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login?mode=login" className="btn btn-ghost text-[14px]">
                  登录
                </Link>
                <Link href="/login?mode=register" className="btn btn-primary text-[14px]" style={{ padding: '9px 20px' }}>
                  免费注册
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="py-22 sm:py-24 text-center max-w-[1180px] mx-auto w-full px-6">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)] mb-4.5">
          从零基础到独立上线 · 项目驱动式教学
        </div>
        
        <h1 className="text-4xl sm:text-5.5xl md:text-6xl font-extrabold tracking-tight leading-[1.18] text-[var(--fg)] max-w-[780px] mx-auto mb-5.5">
          零基础<span className="text-[var(--accent)]">AI编程</span>实战教程
        </h1>
        
        <p className="text-[16px] sm:text-[18px] text-[var(--muted)] max-w-[560px] mx-auto leading-[1.75] mb-9">
          以Cursor + Claude Code实战为主，面向不懂代码的编程新手研发的课程。以实战案例的形式开发几十个项目，包括：网站、小程序、浏览器插件、App、Agent。让你零基础也能用AI开发出自己的应用！
        </p>

        <div className="flex justify-center gap-3 flex-wrap mb-7.5">
          <Link href="/login?mode=register" className="btn btn-primary">
            免费试听学习
          </Link>
          <Link href="/courses" className="btn btn-outline">
            立即购买学习
          </Link>
        </div>

        <div className="flex justify-center gap-6.5 flex-wrap text-[13.5px] text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4.5 w-4.5 text-[var(--accent)] stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            120+ 系统课程
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4.5 w-4.5 text-[var(--accent)] stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            AI 助教 24/7 答疑
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-4.5 w-4.5 text-[var(--accent)] stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            4.8 学员平均评分
          </span>
        </div>
      </section>

      {/* ===== COURSE CATEGORIES ===== */}
      <section className="py-24 bg-[var(--surface-2)] border-t border-b border-[var(--border)]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] mb-4.5">
              课程分类
            </div>
            <h2 className="text-[28px] md:text-[36px] font-extrabold tracking-tight text-[var(--fg)] leading-[1.25] mb-3.5">
              课程内容精选
            </h2>
            <p className="text-[15px] sm:text-[17px] text-[var(--muted)] leading-[1.7]">
              精心设计的编程课程体系，从工具使用到项目实战，覆盖前端、后端、AI 和算法。
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Category 1 */}
            <div className="border border-[var(--border)] rounded-[var(--radius-lg)] p-[26px_24px] bg-[var(--green-soft)] dark:bg-[var(--surface)] flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-[18px] text-[var(--fg)] tracking-tight mb-1.5">编程基础入门</h3>
                <p className="text-[13.5px] text-[var(--muted)] mb-[18px]">不懂代码也能跟上的第一步</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/courses" className="flex items-center justify-between gap-2.5 p-[11px_14px] rounded-[var(--radius-sm)] bg-[var(--surface)] border border-transparent hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)] transition-all text-[13.5px] font-medium">
                  <span>Python 零基础入门</span>
                  <span className="text-[11.5px] text-[var(--muted)] font-normal">42 课时</span>
                </Link>
                <Link href="/courses" className="flex items-center justify-between gap-2.5 p-[11px_14px] rounded-[var(--radius-sm)] bg-[var(--surface)] border border-transparent hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)] transition-all text-[13.5px] font-medium">
                  <span>JavaScript 核心概念</span>
                  <span className="text-[11.5px] text-[var(--muted)] font-normal">28 课时</span>
                </Link>
                <Link href="/courses" className="flex items-center justify-between gap-2.5 p-[11px_14px] rounded-[var(--radius-sm)] bg-[var(--surface)] border border-transparent hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)] transition-all text-[13.5px] font-medium">
                  <span>数据结构与算法</span>
                  <span className="text-[11.5px] text-[var(--muted)] font-normal">52 课时</span>
                </Link>
              </div>
            </div>

            {/* Category 2 */}
            <div className="border border-[var(--border)] rounded-[var(--radius-lg)] p-[26px_24px] bg-[var(--accent-soft)] dark:bg-[var(--surface)] flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-[18px] text-[var(--fg)] tracking-tight mb-1.5">前端开发</h3>
                <p className="text-[13.5px] text-[var(--muted)] mb-[18px]">现代化前端应用开发实战</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/courses" className="flex items-center justify-between gap-2.5 p-[11px_14px] rounded-[var(--radius-sm)] bg-[var(--surface)] border border-transparent hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)] transition-all text-[13.5px] font-medium">
                  <span>React 实战 · 企业级项目</span>
                  <span className="text-[11.5px] text-[var(--muted)] font-normal">58 课时</span>
                </Link>
                <Link href="/courses" className="flex items-center justify-between gap-2.5 p-[11px_14px] rounded-[var(--radius-sm)] bg-[var(--surface)] border border-transparent hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)] transition-all text-[13.5px] font-medium">
                  <span>HTML & CSS 从零到精通</span>
                  <span className="text-[11.5px] text-[var(--muted)] font-normal">32 课时</span>
                </Link>
                <Link href="/courses" className="flex items-center justify-between gap-2.5 p-[11px_14px] rounded-[var(--radius-sm)] bg-[var(--surface)] border border-transparent hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)] transition-all text-[13.5px] font-medium">
                  <span>JavaScript 核心概念</span>
                  <span className="text-[11.5px] text-[var(--muted)] font-normal">28 课时</span>
                </Link>
              </div>
            </div>

            {/* Category 3 */}
            <div className="border border-[var(--border)] rounded-[var(--radius-lg)] p-[26px_24px] bg-[var(--amber-soft)] dark:bg-[var(--surface)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="font-extrabold text-[18px] text-[var(--fg)] tracking-tight">AI 与机器学习</h3>
                  <span className="text-[11.5px] font-bold py-0.5 px-2 rounded-full text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent-soft-border)]">热门</span>
                </div>
                <p className="text-[13.5px] text-[var(--muted)] mb-[18px]">用 AI 构建智能应用</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/courses" className="flex items-center justify-between gap-2.5 p-[11px_14px] rounded-[var(--radius-sm)] bg-[var(--surface)] border border-transparent hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)] transition-all text-[13.5px] font-medium">
                  <span>AI 应用开发实战</span>
                  <span className="text-[11.5px] text-[var(--muted)] font-normal">36 课时</span>
                </Link>
                <Link href="/courses" className="flex items-center justify-between gap-2.5 p-[11px_14px] rounded-[var(--radius-sm)] bg-[var(--surface)] border border-transparent hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)] transition-all text-[13.5px] font-medium">
                  <span>深度学习与 PyTorch</span>
                  <span className="text-[11.5px] text-[var(--muted)] font-normal">44 课时</span>
                </Link>
              </div>
            </div>

            {/* Category 4 */}
            <div className="border border-[var(--border)] rounded-[var(--radius-lg)] p-[26px_24px] bg-[var(--purple-soft)] dark:bg-[var(--surface)] flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-[18px] text-[var(--fg)] tracking-tight mb-1.5">后端开发</h3>
                <p className="text-[13.5px] text-[var(--muted)] mb-[18px]">服务端与高并发架构</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/courses" className="flex items-center justify-between gap-2.5 p-[11px_14px] rounded-[var(--radius-sm)] bg-[var(--surface)] border border-transparent hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)] transition-all text-[13.5px] font-medium">
                  <span>Go 语言后端开发</span>
                  <span className="text-[11.5px] text-[var(--muted)] font-normal">48 课时</span>
                </Link>
                <Link href="/courses" className="flex items-center justify-between gap-2.5 p-[11px_14px] rounded-[var(--radius-sm)] bg-[var(--surface)] border border-transparent hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)] transition-all text-[13.5px] font-medium">
                  <span>Docker & Kubernetes 实战</span>
                  <span className="text-[11.5px] text-[var(--muted)] font-normal">34 课时</span>
                </Link>
              </div>
            </div>

            {/* Category 5 */}
            <div className="border border-[var(--border)] rounded-[var(--radius-lg)] p-[26px_24px] bg-[var(--rose-soft)] dark:bg-[var(--surface)] flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-[18px] text-[var(--fg)] tracking-tight mb-1.5">工程与部署</h3>
                <p className="text-[13.5px] text-[var(--muted)] mb-[18px]">把项目真正送上线</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/courses" className="flex items-center justify-between gap-2.5 p-[11px_14px] rounded-[var(--radius-sm)] bg-[var(--surface)] border border-transparent hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)] transition-all text-[13.5px] font-medium">
                  <span>Docker & Kubernetes 实战</span>
                  <span className="text-[11.5px] text-[var(--muted)] font-normal">34 课时</span>
                </Link>
                <Link href="/courses" className="flex items-center justify-between gap-2.5 p-[11px_14px] rounded-[var(--radius-sm)] bg-[var(--surface)] border border-transparent hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)] transition-all text-[13.5px] font-medium">
                  <span>Go 语言后端开发</span>
                  <span className="text-[11.5px] text-[var(--muted)] font-normal">48 课时</span>
                </Link>
              </div>
            </div>

            {/* Category 6 */}
            <div className="border border-[var(--border)] rounded-[var(--radius-lg)] p-[26px_24px] bg-[var(--surface)] flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-[18px] text-[var(--fg)] tracking-tight mb-1.5">算法与进阶</h3>
                <p className="text-[13.5px] text-[var(--muted)] mb-[18px]">为面试和硬核项目打基础</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/courses" className="flex items-center justify-between gap-2.5 p-[11px_14px] rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-transparent hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)] transition-all text-[13.5px] font-medium">
                  <span>数据结构与算法</span>
                  <span className="text-[11.5px] text-[var(--muted)] font-normal">52 课时</span>
                </Link>
                <Link href="/courses" className="flex items-center justify-between gap-2.5 p-[11px_14px] rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-transparent hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)] transition-all text-[13.5px] font-medium">
                  <span>深度学习与 PyTorch</span>
                  <span className="text-[11.5px] text-[var(--muted)] font-normal">44 课时</span>
                </Link>
              </div>
            </div>

          </div>

          <div className="text-center mt-9 flex justify-center">
            <Link href="/courses" className="btn btn-outline">
              查看所有课程 →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24 bg-[var(--surface)]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)] mb-4.5">
              课程特色
            </div>
            <h2 className="text-[28px] md:text-[36px] font-extrabold tracking-tight text-[var(--fg)] leading-[1.25] mb-3.5">
              全面的编程学习体系
            </h2>
            <p className="text-[15px] sm:text-[17px] text-[var(--muted)] leading-[1.7]">
              让零基础学员也能快速上手，从工具使用到项目实战的完整学习路径。
            </p>
          </div>

          <div className="grid gap-4.5 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Feature 1 */}
            <div className="p-[30px_26px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] hover:border-[var(--accent)] transition-colors">
              <div className="w-10.5 h-10.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft-border)] flex items-center justify-center mb-5">
                <svg className="h-5 w-5 stroke-current fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <h3 className="font-extrabold text-[17.5px] text-[var(--fg)] tracking-tight mb-2.5">项目驱动学习</h3>
              <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">每门课程都包含多个实战项目，边学边做，在真实场景中掌握技能。</p>
            </div>

            {/* Feature 2 */}
            <div className="p-[30px_26px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] hover:border-[var(--accent)] transition-colors">
              <div className="w-10.5 h-10.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft-border)] flex items-center justify-center mb-5">
                <svg className="h-5 w-5 stroke-current fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="3" y="8" width="18" height="12" rx="2" />
                  <path d="M8 8V6a4 4 0 0 1 8 0v2" />
                  <circle cx="9" cy="14" r="1" />
                  <circle cx="15" cy="14" r="1" />
                </svg>
              </div>
              <h3 className="font-extrabold text-[17.5px] text-[var(--fg)] tracking-tight mb-2.5">AI 助教陪伴</h3>
              <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">遇到问题随时向 AI 助教提问，不用等老师回复，24 小时全天候答疑。</p>
            </div>

            {/* Feature 3 */}
            <div className="p-[30px_26px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] hover:border-[var(--accent)] transition-colors">
              <div className="w-10.5 h-10.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft-border)] flex items-center justify-center mb-5">
                <svg className="h-5 w-5 stroke-current fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="9" cy="8" r="3" />
                  <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
                  <circle cx="17" cy="9" r="2.5" />
                  <path d="M22 20c0-2.6-2-4.7-4.6-5" />
                </svg>
              </div>
              <h3 className="font-extrabold text-[17.5px] text-[var(--fg)] tracking-tight mb-2.5">社区互助成长</h3>
              <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">加入学习社群，和志同道合的伙伴一起打卡、讨论、组队做项目。</p>
            </div>

            {/* Feature 4 */}
            <div className="p-[30px_26px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] hover:border-[var(--accent)] transition-colors">
              <div className="w-10.5 h-10.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft-border)] flex items-center justify-center mb-5">
                <svg className="h-5 w-5 stroke-current fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M3 3v18h18" />
                  <path d="M7 15l4-5 3 3 5-7" />
                </svg>
              </div>
              <h3 className="font-extrabold text-[17.5px] text-[var(--fg)] tracking-tight mb-2.5">学习路径规划</h3>
              <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">根据你的基础和目标，智能推荐学习路径，避免走弯路。</p>
            </div>

            {/* Feature 5 */}
            <div className="p-[30px_26px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] hover:border-[var(--accent)] transition-colors">
              <div className="w-10.5 h-10.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft-border)] flex items-center justify-center mb-5">
                <svg className="h-5 w-5 stroke-current fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M12 2l2.9 6.3 6.9.9-5 4.8 1.3 6.9L12 17.6l-6.1 3.3 1.3-6.9-5-4.8 6.9-.9z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-[17.5px] text-[var(--fg)] tracking-tight mb-2.5">成就激励系统</h3>
              <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">完成任务获得勋章和学分，保持学习动力，让进步可见。</p>
            </div>

            {/* Feature 6 */}
            <div className="p-[30px_26px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] hover:border-[var(--accent)] transition-colors">
              <div className="w-10.5 h-10.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft-border)] flex items-center justify-center mb-5">
                <svg className="h-5 w-5 stroke-current fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <line x1="12" y1="18" x2="12" y2="18.01" />
                </svg>
              </div>
              <h3 className="font-extrabold text-[17.5px] text-[var(--fg)] tracking-tight mb-2.5">多端同步学习</h3>
              <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">电脑、平板、手机，学习进度实时同步，随时随地都能学。</p>
            </div>

          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)] mb-4.5">
              学员心声
            </div>
            <h2 className="text-[28px] md:text-[36px] font-extrabold tracking-tight text-[var(--fg)] leading-[1.25]">
              他们在这里改变了职业轨迹
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Card 1 */}
            <div className="p-6 sm:p-6.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] relative flex flex-col justify-between">
              <p className="text-[14.5px] leading-[1.75] text-[var(--fg)] mb-5">
                &ldquo;零基础转行学 Python，3 个月后做出了自己的第一个 Web 应用。小宁学习的项目驱动方式真的非常适合自学。&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <span className="w-9.5 h-9.5 rounded-full bg-[oklch(42%_0.06_250)] text-white flex items-center justify-center text-sm font-bold">李</span>
                <div>
                  <div className="font-bold text-[14px]">李小明</div>
                  <div className="text-[12.5px] text-[var(--muted)]">Python 全栈 · 在职转行</div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 sm:p-6.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] relative flex flex-col justify-between">
              <p className="text-[14.5px] leading-[1.75] text-[var(--fg)] mb-5">
                &ldquo;AI 助教功能太强了，遇到 Bug 直接提问就能得到解答。比起自己搜索效率提升太多了，强烈推荐。&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <span className="w-9.5 h-9.5 rounded-full bg-[oklch(38%_0.05_20)] text-white flex items-center justify-center text-sm font-bold">陈</span>
                <div>
                  <div className="font-bold text-[14px]">陈思远</div>
                  <div className="text-[12.5px] text-[var(--muted)]">前端开发 · 大三学生</div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 sm:p-6.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] relative flex flex-col justify-between">
              <p className="text-[14.5px] leading-[1.75] text-[var(--fg)] mb-5">
                &ldquo;完全零基础，跟着项目一步步做，现在已经能独立接一些小外包了。课程更新很快，紧跟最新工具。&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <span className="w-9.5 h-9.5 rounded-full bg-[oklch(55%_0.1_155)] text-white flex items-center justify-center text-sm font-bold">王</span>
                <div>
                  <div className="font-bold text-[14px]">王雅琪</div>
                  <div className="text-[12.5px] text-[var(--muted)]">自由开发者 · 创业者</div>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 sm:p-6.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] relative flex flex-col justify-between">
              <p className="text-[14.5px] leading-[1.75] text-[var(--fg)] mb-5">
                &ldquo;作为在职人员时间很紧张，课程节奏刚好能利用碎片时间学完，社群里的同学也会互相答疑，很有动力。&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <span className="w-9.5 h-9.5 rounded-full bg-[oklch(45%_0.05_75)] text-white flex items-center justify-center text-sm font-bold">周</span>
                <div>
                  <div className="font-bold text-[14px]">周子豪</div>
                  <div className="text-[12.5px] text-[var(--muted)]">产品经理 · 职场转型</div>
                </div>
              </div>
            </div>

            {/* Card 5 */}
            <div className="p-6 sm:p-6.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] relative flex flex-col justify-between">
              <p className="text-[14.5px] leading-[1.75] text-[var(--fg)] mb-5">
                &ldquo;讲得很细，从环境搭建到项目部署都覆盖了，特别适合完全没有基础但想认真学的人。&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <span className="w-9.5 h-9.5 rounded-full bg-[oklch(50%_0.14_20)] text-white flex items-center justify-center text-sm font-bold">赵</span>
                <div>
                  <div className="font-bold text-[14px]">赵梦琪</div>
                  <div className="text-[12.5px] text-[var(--muted)]">在校学生 · 大二</div>
                </div>
              </div>
            </div>

            {/* Card 6 */}
            <div className="p-6 sm:p-6.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] relative flex flex-col justify-between">
              <p className="text-[14.5px] leading-[1.75] text-[var(--fg)] mb-5">
                &ldquo;性价比很高，比市面上同类课程内容更扎实，客服和答疑响应也很快，值得推荐给身边想转行的朋友。&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <span className="w-9.5 h-9.5 rounded-full bg-[oklch(48%_0.09_295)] text-white flex items-center justify-center text-sm font-bold">孙</span>
                <div>
                  <div className="font-bold text-[14px]">孙志远</div>
                  <div className="text-[12.5px] text-[var(--muted)]">编程爱好者</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== ABOUT / INSTRUCTOR ===== */}
      <section className="py-24 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="grid gap-[44px] md:grid-cols-[320px_1fr] items-center bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 sm:p-12">
            
            <div className="text-center">
              <div className="w-22 h-22 rounded-full mx-auto mb-4.5 bg-gradient-to-br from-[var(--accent)] to-[oklch(52%_0.2_275)] flex items-center justify-center text-white font-extrabold text-[32px]">
                宁
              </div>
              <h3 className="font-extrabold text-[21px] mb-1.5">Hello，我是小宁</h3>
              <div className="text-[13.5px] text-[var(--muted)] mb-5.5">课程主理人 · 全栈工程师</div>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)]">
                  <strong className="block font-mono text-[17px] text-[var(--accent)] font-bold">10 年+</strong>
                  <span className="text-[11.5px] text-[var(--muted)]">一线开发经验</span>
                </div>
                <div className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)]">
                  <strong className="block font-mono text-[17px] text-[var(--accent)] font-bold">120+</strong>
                  <span className="text-[11.5px] text-[var(--muted)]">系统课程</span>
                </div>
                <div className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)]">
                  <strong className="block font-mono text-[17px] text-[var(--accent)] font-bold">3000+</strong>
                  <span className="text-[11.5px] text-[var(--muted)]">累计学员</span>
                </div>
                <div className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)]">
                  <strong className="block font-mono text-[17px] text-[var(--accent)] font-bold">4.8</strong>
                  <span className="text-[11.5px] text-[var(--muted)]">学员平均评分</span>
                </div>
              </div>
            </div>

            <div className="text-[15px] leading-[1.85] text-[var(--fg)] flex flex-col gap-4">
              <p>
                大家好，我是小宁，一名有着<strong>10 年一线开发经验</strong>的工程师。这些年带过团队、做过创业项目，也见过太多人因为 &ldquo;不知道从哪学起&rdquo; 而放弃了编程这条路。
              </p>
              <p>
                所以我做了「小宁学习」—— 不是又一门讲语法的课，而是<strong>用真实项目带你走完整条路</strong>：从装环境、写第一行代码，到独立完成能上线的作品。每一课都配 AI 助教答疑，遇到报错不用干等。
              </p>
              <p>
                课程会持续更新，不是为了让你 &ldquo;记住知识点&rdquo;，而是希望你能在这个最好的时代，<strong>亲手把一个小想法变成现实</strong>。
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="py-24 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)] mb-4.5">
              课程价格
            </div>
            <h2 className="text-[28px] md:text-[36px] font-extrabold tracking-tight text-[var(--fg)] leading-[1.25] mb-3.5">
              一次购买，长期学习
            </h2>
            <p className="text-[15px] sm:text-[17px] text-[var(--muted)]">
              系统化学完编程，不用东拼西凑找教程
            </p>
          </div>

          <div className="max-w-[460px] mx-auto border border-[var(--border)] rounded-[var(--radius-xl)] p-10 bg-[var(--surface)] relative shadow-lg">
            <span className="absolute top-6 right-6 bg-[var(--accent)] text-white text-[11.5px] font-bold py-1 px-3 rounded-full">
              限时优惠
            </span>
            <h3 className="font-extrabold text-[20px] mb-3.5">编程实战全课程</h3>
            <div className="font-mono text-[44px] font-extrabold text-[var(--fg)] mb-1.5 leading-none">
              ¥599 <span className="text-[15px] font-medium text-[var(--muted)]">/ 年</span>
            </div>
            <p className="text-[13.5px] text-[var(--muted)] mb-6.5">
              覆盖前端、后端、AI 与算法的完整学习路径
            </p>
            
            <ul className="flex flex-col gap-3.5 mb-7.5">
              <li className="flex items-center gap-2.5 text-[14.5px]">
                <svg className="h-4.5 w-4.5 text-[var(--accent)] shrink-0 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                120+ 系统课程全解锁
              </li>
              <li className="flex items-center gap-2.5 text-[14.5px]">
                <svg className="h-4.5 w-4.5 text-[var(--accent)] shrink-0 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                50+ 实战项目源码
              </li>
              <li className="flex items-center gap-2.5 text-[14.5px]">
                <svg className="h-4.5 w-4.5 text-[var(--accent)] shrink-0 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                AI 助教 24/7 答疑
              </li>
              <li className="flex items-center gap-2.5 text-[14.5px]">
                <svg className="h-4.5 w-4.5 text-[var(--accent)] shrink-0 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                专属学习社群
              </li>
              <li className="flex items-center gap-2.5 text-[14.5px]">
                <svg className="h-4.5 w-4.5 text-[var(--accent)] shrink-0 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                持续更新，紧跟最新技术
              </li>
            </ul>

            <Link href={currentUser ? "/courses" : "/login?mode=login"} className="btn btn-primary w-full justify-center">
              立即购买
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-24 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)] mb-4.5">
              常见问题
            </div>
            <h2 className="text-[28px] md:text-[36px] font-extrabold tracking-tight text-[var(--fg)] leading-[1.25] mb-3.5">
              常见问题解答
            </h2>
            <p className="text-[15px] sm:text-[17px] text-[var(--muted)]">
              针对课程学习的常见问题解答
            </p>
          </div>

          <div className="max-w-[760px] mx-auto flex flex-col">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border-b border-[var(--border)]">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 py-5.5 px-1 bg-none border-none text-left cursor-pointer font-bold text-[15.5px] text-[var(--fg)]"
                  >
                    <span>{item.q}</span>
                    <svg
                      className={`h-4.5 w-4.5 text-[var(--muted)] transition-transform duration-200 shrink-0 stroke-current fill-none ${
                        isOpen ? 'rotate-180 text-[var(--accent)]' : ''
                      }`}
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-350 ease-in-out ${
                      isOpen ? 'max-h-[240px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="pb-5.5 px-1 text-[14.5px] text-[var(--muted)] leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-24 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="bg-gradient-to-br from-[var(--accent)] to-[oklch(52%_0.2_275)] rounded-[var(--radius-xl)] p-12 sm:p-17 text-center text-white shadow-lg">
            <h2 className="font-extrabold text-2xl sm:text-[36px] tracking-tight mb-3.5 leading-tight">准备开启你的编程之旅了吗？</h2>
            <p className="text-[15.5px] text-[oklch(96%_0.01_258_/_0.9)] mb-8 max-w-[480px] mx-auto">从今天的第一节课开始，一步步把想法变成能上线的项目。</p>
            <div className="flex justify-center gap-3.5 flex-wrap">
              <Link href={currentUser ? "/profile" : "/login?mode=register"} className="btn btn-on-accent text-[15px]">
                免费注册 →
              </Link>
              <Link href="/courses" className="btn btn-outline-on-accent text-[15px]">
                浏览课程
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-14 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 mb-11">
            
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 font-bold text-[19px] tracking-tight text-[var(--fg)] mb-3.5">
                <span className="w-7.5 h-7.5 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white text-[15px] font-extrabold">
                  宁
                </span>
                小宁学习
              </Link>
              <p className="text-[13.5px] text-[var(--muted)] leading-relaxed max-w-[280px]">
                让每个人都能学会编程。小宁学习 — 用心做教育，用技术改变未来。
              </p>
            </div>

            <div>
              <h4 className="text-[13px] font-bold text-[var(--fg)] mb-4">课程</h4>
              <ul className="flex flex-col gap-2.5">
                <li><Link href="/courses" className="text-[13.5px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">编程基础</Link></li>
                <li><Link href="/courses" className="text-[13.5px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">前端开发</Link></li>
                <li><Link href="/courses" className="text-[13.5px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">AI 与机器学习</Link></li>
                <li><Link href="/courses" className="text-[13.5px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">全部课程</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[13px] font-bold text-[var(--fg)] mb-4">关于</h4>
              <ul className="flex flex-col gap-2.5">
                <li><a href="#" className="text-[13.5px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">关于我们</a></li>
                <li><a href="#" className="text-[13.5px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">讲师入驻</a></li>
                <li><a href="#" className="text-[13.5px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">帮助中心</a></li>
                <li><a href="#" className="text-[13.5px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">联系我们</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[13px] font-bold text-[var(--fg)] mb-4">法律</h4>
              <ul className="flex flex-col gap-2.5">
                <li><a href="#" className="text-[13.5px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">用户协议</a></li>
                <li><a href="#" className="text-[13.5px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">隐私政策</a></li>
                <li><a href="#" className="text-[13.5px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">版权声明</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-[var(--border)] pt-[22px] flex justify-between items-center text-[13px] text-[var(--muted)] flex-wrap gap-2">
            <span>&copy; 2026 小宁学习</span>
            <span>保留所有权利</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
