'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, UserProfile } from '@/lib/db';
import { 
  LogoGlyph, 
  CourseIcon, 
  FeatureIcon, 
  CheckIcon 
} from '@/components/icons';

// Prototype data definitions
const navLinks = [
  { label: '课程内容', href: '#course' },
  { label: '课程特色', href: '#features' },
  { label: '讲师介绍', href: '#instructor' },
  { label: '学员评价', href: '#testimonials' },
  { label: '课程价格', href: '#pricing' },
  { label: '常见问题', href: '#faq' }
];

const hero = {
  badge: '零基础 · Cursor + Claude 实战 · 持续更新',
  headline: '零基础AI编程实战教程',
  subline: '用 Cursor + Claude 轻松开发你的第一个应用',
  desc: '面向不懂代码的编程新手，以实战案例带你开发网站、小程序、浏览器插件、App 与 Agent——让你零基础也能用 AI 把想法变成产品。',
  stats: [
    { num: '3000+', label: '名学员' },
    { num: '¥599', label: '元 / 年' },
    { num: '50+', label: '实战项目' },
  ],
  ctaPrimary: '立即购买 ¥599',
  ctaSecondary: '了解课程大纲',
};

const courseEyebrow = 'PARTIAL CURRICULUM · 部分课程';
const courseTitle = '课程内容精选';
const courseDesc = '精心挑选的 AI 编程课程，从工具使用到项目实战，助你快速上手 AI 开发';

type CourseCategory = {
  title: string;
  icon: 'ai' | 'env' | 'fe' | 'be' | 'pay' | 'project';
  items: string[];
  featured?: boolean;
};

const courseCategories: CourseCategory[] = [
  {
    title: 'AI 工具入门',
    icon: 'ai',
    items: [
      '·  Cursor 安装与配置',
      '·  掌握 Cursor：AI 编程必备神器',
      '·  Claude Code 入门：开发赚钱的文档工具',
      '·  如何创建 Cursor rules',
    ],
  },
  {
    title: '开发环境',
    icon: 'env',
    items: [
      '·  安装 Git',
      '·  安装 Node.js',
      '·  安装 Python',
      '·  新手友好！在 Zeabur 部署你的服务',
    ],
  },
  {
    title: '前端开发',
    icon: 'fe',
    items: [
      '·  AI 时代下的前端核心概念 + 最佳实践',
      '·  AI 赋能下的前端开发：Next.js 框架基础入门',
      '·  使用 v0 + Supabase + Cursor 创建导航站',
      '·  开发 Elon Musk 多语言简历网站',
    ],
  },
  {
    title: '后端开发',
    icon: 'be',
    items: [
      '·  新手入门后端必要概念 + 最佳实践',
      '·  Python 的基本使用',
      '·  用 Flask 实现一个简单的 API',
      '·  数据库开发 + 编写 SQL 指南',
      '·  出海必备：Supabase 详细教程',
    ],
  },
  {
    title: '支付与商业化',
    icon: 'pay',
    featured: true,
    items: [
      '·  开发能赚钱的网站：接入国内个人支付（无需营业执照）',
      '·  Creem 支付完整入门（上）',
      '·  Creem 支付完整入门（下）：实现美金收款',
    ],
  },
  {
    title: '综合项目',
    icon: 'project',
    items: [
      '·  ShipAny：1 小时开发海外游客 AI 旅游助手 SaaS',
      '·  复制 Midjourney：登录 + 通义模型 + 支付 + token 管理',
      '·  MkSaaS 模板：开发 AI 试衣出海产品',
      '·  iOS 应用：AI 语音记账软件（基于 Qwen Omni）',
    ],
  },
];

const instructor = {
  initial: '一',
  name: '一宁',
  title: '独立开发者 · 全栈工程师 · AI 内容创作者',
  socials: ['X · 40K', 'YouTube · 6K', '哔哩哔哩 · 48K', '小红书 · 12K', '微博 · 100K', '抖音 · 60K'],
  eyebrow: 'ABOUT THE INSTRUCTOR · 讲师介绍',
  heading: 'Hello 大家好！我是一宁',
  bio: '大家好，我是一宁，一个有着 10 年 Web 前后端开发经验的程序员，目前全职做 AI 编程相关的内容创作者。去年我做了 NuxtBase 这个 Boilerplate 产品，帮助大家快速开发项目。但我发现很多非程序员，即使有了 Cursor、Claude Code 这些强大的 AI 工具，也不会写提示词、不知道开发的基础知识 and 流程，也不会选择合适的技术选项。所以我希望用自己的经验，帮更多人跨出第一步——哪怕只是试着完成一个最简单的产品也好。这门课程会持续更新，不是为了教你成为程序员，而是希望你能在这个最好的时代，亲手把一个小想法变成现实！',
  fans: '26万+',
  fanLabel: '全网总粉丝',
  exp: '10年',
  expLabel: 'Web 全栈经验',
};

const featuresEyebrow = 'WHY THIS COURSE · 课程特色';
const featuresTitle = '全面的 AI 编程学习体系';
const featuresDesc = '让零基础学员也能快速上手，从工具使用到项目实战的完整学习路径';

type Feature = {
  title: string;
  desc: string;
  icon: 'friendly' | 'project' | 'cursor' | 'fullstack' | 'group' | 'update';
};

const features: Feature[] = [
  {
    title: '零基础友好',
    desc: '专为编程新手设计，从最基础的概念开始，循序渐进学习 AI 编程。',
    icon: 'friendly',
  },
  {
    title: '实战项目驱动',
    desc: '通过几十个真实项目案例，包括网站、小程序、插件、App 等实际应用。',
    icon: 'project',
  },
  {
    title: 'Cursor + Claude',
    desc: '深度讲解 Cursor 编辑器与 Claude AI 的配合使用，大幅提升开发效率。',
    icon: 'cursor',
  },
  {
    title: '全栈开发',
    desc: '涵盖前端、后端、移动端、浏览器插件等多个开发领域。',
    icon: 'fullstack',
  },
  {
    title: '答疑微信群',
    desc: '微信群我亲自答疑，解决你学习中遇到的任何问题。',
    icon: 'group',
  },
  {
    title: '持续更新',
    desc: '课程内容持续更新，紧跟 AI 技术发展趋势和最新工具。',
    icon: 'update',
  },
];

const testiEyebrow = 'COMMUNITY · 学员评价';
const testiTitle = '社区 & 学员评价';
const testiDesc = '来自真实学员和各个社区的评价';

const testimonials = [
  {
    quote: '熠辉做的课程好，是我最近花钱最开心、最用心的课，多多学习，争取工作和副业都成型。',
    author: 'ChaosInMotion · AlexanderJimlee',
  },
  {
    quote: '这就是全网最好的 AI 编程实战课！国外编程课我只服 Antonio，但他没法像 yihui 这么紧跟时事，周更效率太强了！',
    author: 'Fox · MkSaaS / indie_maker_fox',
  },
  {
    quote: '国区大多数 AI 编程课不推荐，除了这位老师。小破站听过他的课程，讲得专业又细致，牛。',
    author: 'Feng言峰语 · xiaofengc1989',
  },
  {
    quote: 'AI 编程课认准熠辉，看过他的视频，讲得很细，推荐。',
    author: '极客杰尼 · seekjourney',
  },
  {
    quote: '真的好清晰的课程，果断粉你了。',
    author: '八宝周168',
  },
  {
    quote: '纯小白，看了这个做出了一真想帮家里做的管理软件，真干货。',
    author: '剑魂古翼',
  },
  {
    quote: '最好的 AI 编程教程！',
    author: '金然学员',
  },
  {
    quote: '老师很负责任，群里答疑基本秒回，真的很有帮助！',
    author: '信司学员',
  },
  {
    quote: '我是一个小白，通过这个课程已经开发了好几个网站了，感谢熠辉！',
    author: '蔚琴学员',
  },
];

const priceEyebrow = 'PRICING · 课程价格';
const priceTitle = '课程价格';
const priceDesc = '一次购买，立即开始你的 AI 编程之旅';

const pricing = {
  badge: '限时优惠',
  planName: 'AI 编程实战课程',
  price: '¥599',
  period: '/ 年',
  features: [
    '完整课程内容',
    '50+ 实战项目',
    '专属微信答疑群',
    '视频 + 文档 + 源码',
    '会员专属模板赠送',
    '持续更新服务',
    '答疑群指导',
    '学员专属社群',
  ],
  cta: '立即购买 ¥599',
};

const faqEyebrow = 'FAQ · 常见问题';
const faqTitle = '常见问题解答';
const faqDesc = '针对课程学习的常见问题解答';

const faqs = [
  {
    q: '我完全没有编程基础，能学会吗？',
    a: '当然可以。课程专为零基础学员设计，从最基础的概念讲起，跟着实战项目一步步操作，不需要任何前置基础。',
  },
  {
    q: '学完这门课程我能做什么？',
    a: '你可以独立开发出网站、小程序、浏览器插件，甚至 App 和 Agent，把脑海中的小想法变成真实可用的产品。',
  },
  {
    q: '为什么课程是一年，而不是永久？',
    a: '课程以「年度会员」形式提供，一年内可学习全部内容并享受持续更新与答疑。这样能保证内容紧跟最新 AI 工具，质量也更有保障。',
  },
  {
    q: '课程包含最新的 AI 技术吗？',
    a: '包含。课程持续更新，会紧跟 Cursor、Claude Code 等最新工具和最佳实践，确保你学到的是当下最实用的内容。',
  },
  {
    q: '购买了课程如何学习呢？',
    a: '购买后你会获得专属学习入口，包含视频、文档与源码，按章节顺序学习即可，随时可回看。',
  },
  {
    q: '可以开发票吗？',
    a: '可以。购买后可在订单页申请开具发票，支持个人与对公发票，具体流程会在购买后说明。',
  },
  {
    q: '购买后如何加答疑群？',
    a: '购买成功后，页面与邮件会提供加群方式，扫码即可加入专属微信答疑群。',
  },
  {
    q: '是老师亲自答疑吗？',
    a: '是的。答疑群由熠辉本人亲自答疑，学习过程中遇到的问题都能得到及时解答。',
  },
];

const ctaTitle = '准备好开启你的 AI 编程之旅了吗？';
const ctaSubtitle = '3000+ 学员的共同选择，¥599/年 限时优惠。现在加入，用一年时间从零基础成长为能独立交付项目的 AI 开发者。';
const ctaButton = '立即购买 · ¥599/年';

const footer = {
  brand: 'HappyAI Coding',
  tagline: '零基础 AI 编程实战教程',
  socials: '微信 · 抖音 · B站 · 小红书',
  columns: [
    {
      title: '课程',
      links: ['AI 工具入门', '前端开发实战', '后端开发实战', '支付与商业化'],
    },
    {
      title: '关于',
      links: ['讲师介绍', '学员评价', '常见问题'],
    },
    {
      title: '支持',
      links: ['购买咨询', '退款政策'],
    },
  ],
  copyright: '© 2026 HappyAI Coding. 保留所有权利。',
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-slate3 text-xs font-semibold">正在载入...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-ink antialiased">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 w-full border-b border-hairline bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-page items-center justify-between px-6 lg:px-12">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00D9A1] to-[#04994F] shadow-brand">
              <LogoGlyph className="text-white" />
            </span>
            <span className="text-[22px] font-bold text-ink">{footer.brand}</span>
          </Link>
          
          <div className="flex items-center gap-6 sm:gap-8">
            <nav className="hidden items-center gap-7 lg:flex">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href} className="text-[15px] font-medium text-slate2 transition-colors hover:text-brand-dark">
                  {l.label}
                </a>
              ))}
              {currentUser && (
                <Link href="/profile" className="text-[15px] font-medium text-slate2 transition-colors hover:text-brand-dark">
                  我的学习
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button 
                className="w-9 h-9 rounded-full border border-hairline bg-white text-slate2 hover:text-ink hover:border-brand flex items-center justify-center cursor-pointer transition-colors"
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
                <div className="flex items-center gap-3">
                  {currentUser.role === 'admin' && (
                    <Link 
                      href="/admin/courses" 
                      className="flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-bold bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 transition-all"
                    >
                      管理后台
                    </Link>
                  )}
                  
                  <div className="flex items-center gap-2 text-[14px] bg-canvas border border-hairline rounded-full px-4 py-2">
                    <span className="font-semibold text-ink truncate max-w-[100px]">
                      {currentUser.nickname}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="ml-1.5 text-slate3 hover:text-rose-500 font-bold transition-all cursor-pointer bg-none border-none p-0"
                    >
                      退出
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login?mode=login" className="px-4 py-2.5 text-[15px] font-bold text-slate2 hover:text-ink transition-colors">
                    登录
                  </Link>
                  <Link 
                    href="/login?mode=register" 
                    className="rounded-full bg-brand px-5 py-2.5 text-[15px] font-bold text-white transition-transform hover:scale-[1.02]"
                  >
                    免费注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* ===== HERO ===== */}
        <section className="relative w-full overflow-hidden bg-white">
          <div className="hero-grid" />
          <div className="hero-content mx-auto flex max-w-page justify-center px-6 py-20 lg:py-24">
            <div className="flex w-full max-w-[640px] flex-col items-start gap-6 text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2">
                <span className="h-2 w-2 rounded-[4px] bg-brand" />
                <span className="text-[14px] font-medium text-brand-dark">{hero.badge}</span>
              </span>
              <h1 className="text-[40px] font-black leading-[52px] text-ink sm:text-[56px] sm:leading-[68px]">
                {hero.headline}
              </h1>
              <p className="text-[22px] font-bold text-ink">{hero.subline}</p>
              <p className="text-[17px] leading-[28px] text-slate2">{hero.desc}</p>
              <div className="flex items-start gap-9">
                {hero.stats.map((s) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    <span className="text-[28px] font-black text-brand-dark">{s.num}</span>
                    <span className="text-[14px] text-slate3">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex flex-col gap-4 sm:flex-row w-full sm:w-auto">
                <Link
                  href={currentUser ? "/courses" : "/login?mode=register"}
                  className="rounded-full bg-brand px-8 py-3.5 text-[17px] font-bold text-white text-center transition-transform hover:scale-[1.02]"
                >
                  {hero.ctaPrimary}
                </Link>
                <a
                  href="#course"
                  className="rounded-full border border-[#CBD4E0] bg-white px-8 py-3.5 text-[17px] font-bold text-ink text-center transition-colors hover:bg-canvas"
                >
                  {hero.ctaSecondary}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== COURSE CONTENT ===== */}
        <section id="course" className="w-full bg-white scroll-mt-20">
          <div className="mx-auto max-w-page px-6 py-20 lg:px-12 lg:py-24">
            <div className="mx-auto max-w-[760px] text-center">
              <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand-dark">
                {courseEyebrow}
              </span>
              <h2 className="mt-3 text-[34px] font-black leading-[44px] text-ink lg:text-[40px] lg:leading-[52px]">
                {courseTitle}
              </h2>
              <p className="mt-4 text-[17px] leading-[28px] text-slate2">{courseDesc}</p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courseCategories.map((c) => (
                <div
                  key={c.title}
                  className={[
                    'flex min-h-[270px] flex-col rounded-3xl border bg-white p-7 shadow-card',
                    c.featured ? 'border-brand' : 'border-hairline',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={[
                        'flex h-12 w-12 items-center justify-center rounded-2xl',
                        c.featured ? 'bg-brand text-white' : 'bg-mint text-brand-dark',
                      ].join(' ')}
                    >
                      <CourseIcon type={c.icon} width={24} height={24} />
                    </span>
                    <h3 className="text-[18px] font-bold text-ink">{c.title}</h3>
                  </div>
                  <ul className="mt-5 flex flex-1 flex-col gap-3">
                    {c.items.map((it) => (
                      <li key={it} className="text-[14px] leading-[22px] text-slate2">
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== INSTRUCTOR ===== */}
        <section id="instructor" className="w-full bg-canvas scroll-mt-20">
          <div className="mx-auto max-w-page px-6 py-20 lg:px-12 lg:py-24">
            <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand-dark">
              {instructor.eyebrow}
            </span>
            <h2 className="mt-3 text-[34px] font-black leading-[44px] text-ink lg:text-[40px] lg:leading-[52px]">
              {instructor.heading}
            </h2>

            <div className="mt-12 flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-16">
              {/* Avatar Card */}
              <div className="flex w-full shrink-0 flex-col items-center rounded-3xl border border-hairline bg-white p-8 shadow-card lg:w-[340px]">
                <span className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#00D9A1] to-[#04994F] text-[56px] font-black text-white shadow-card-strong">
                  {instructor.initial}
                </span>
                <p className="mt-5 text-[22px] font-bold text-ink">{instructor.name}</p>
                <p className="mt-1 text-center text-[14px] leading-[22px] text-slate2">
                  {instructor.title}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {instructor.socials.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-hairline bg-canvas px-3 py-1.5 text-[13px] font-medium text-slate2"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bio Content */}
              <div className="flex-1">
                <p className="text-[17px] leading-[30px] text-slate2">{instructor.bio}</p>
                <div className="mt-8 flex gap-10">
                  <div className="flex flex-col">
                    <span className="text-[32px] font-black text-brand-dark">{instructor.fans}</span>
                    <span className="mt-1 text-[14px] text-slate3">{instructor.fanLabel}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[32px] font-black text-brand-dark">{instructor.exp}</span>
                    <span className="mt-1 text-[14px] text-slate3">{instructor.expLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section id="features" className="w-full bg-white scroll-mt-20">
          <div className="mx-auto max-w-page px-6 py-20 lg:px-12 lg:py-24">
            <div className="mx-auto max-w-[760px] text-center">
              <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand-dark">
                {featuresEyebrow}
              </span>
              <h2 className="mt-3 text-[34px] font-black leading-[44px] text-ink lg:text-[40px] lg:leading-[52px]">
                {featuresTitle}
              </h2>
              <p className="mt-4 text-[17px] leading-[28px] text-slate2">{featuresDesc}</p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex flex-col rounded-3xl border border-hairline bg-white p-7 shadow-card transition-transform hover:-translate-y-1"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-brand-dark">
                    <FeatureIcon type={f.icon} width={24} height={24} />
                  </span>
                  <h3 className="mt-5 text-[18px] font-bold text-ink">{f.title}</h3>
                  <p className="mt-2 text-[14px] leading-[24px] text-slate2">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section id="testimonials" className="w-full bg-canvas scroll-mt-20">
          <div className="mx-auto max-w-page px-6 py-20 lg:px-12 lg:py-24">
            <div className="mx-auto max-w-[760px] text-center">
              <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand-dark">
                {testiEyebrow}
              </span>
              <h2 className="mt-3 text-[34px] font-black leading-[44px] text-ink lg:text-[40px] lg:leading-[52px]">
                {testiTitle}
              </h2>
              <p className="mt-4 text-[17px] leading-[28px] text-slate2">{testiDesc}</p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <div
                  key={t.author}
                  className="flex h-[160px] flex-col justify-between rounded-3xl border border-hairline bg-white p-6 shadow-card"
                >
                  <p className="text-[14px] leading-[24px] text-ink3">“{t.quote}”</p>
                  <p className="text-[13px] font-semibold text-slate3">{t.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section id="pricing" className="w-full bg-mint-bg scroll-mt-20">
          <div className="mx-auto max-w-page px-6 py-20 lg:px-12 lg:py-24">
            <div className="mx-auto max-w-[760px] text-center">
              <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand-dark">
                {priceEyebrow}
              </span>
              <h2 className="mt-3 text-[34px] font-black leading-[44px] text-ink lg:text-[40px] lg:leading-[52px]">
                {priceTitle}
              </h2>
              <p className="mt-4 text-[17px] leading-[28px] text-slate2">{priceDesc}</p>
            </div>

            <div className="mx-auto mt-14 max-w-[480px]">
              <div className="overflow-hidden rounded-3xl border border-hairline bg-white shadow-card-strong">
                <div className="flex items-center justify-center bg-brand py-3">
                  <span className="text-[14px] font-bold text-white">{pricing.badge}</span>
                </div>
                <div className="p-8">
                  <h3 className="text-center text-[20px] font-bold text-ink">{pricing.planName}</h3>
                  <div className="mt-4 flex items-end justify-center gap-1">
                    <span className="text-[52px] font-black leading-none text-brand-dark">
                      {pricing.price}
                    </span>
                    <span className="mb-2 text-[16px] font-medium text-slate3">{pricing.period}</span>
                  </div>
                  <ul className="mt-7 grid grid-cols-1 gap-3">
                    {pricing.features.map((f) => (
                      <li key={f} className="flex items-center gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint text-brand-dark">
                          <CheckIcon width={13} height={13} />
                        </span>
                        <span className="text-[15px] text-ink3">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={currentUser ? "/courses" : "/login?mode=login"}
                    className="mt-8 block rounded-full bg-brand py-4 text-center text-[17px] font-bold text-white transition-transform hover:scale-[1.02]"
                  >
                    {pricing.cta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" className="w-full bg-white scroll-mt-20">
          <div className="mx-auto max-w-page px-6 py-20 lg:px-12 lg:py-24">
            <div className="mx-auto max-w-[760px] text-center">
              <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand-dark">
                {faqEyebrow}
              </span>
              <h2 className="mt-3 text-[34px] font-black leading-[44px] text-ink lg:text-[40px] lg:leading-[52px]">
                {faqTitle}
              </h2>
              <p className="mt-4 text-[17px] leading-[28px] text-slate2">{faqDesc}</p>
            </div>

            <div className="mx-auto mt-14 grid max-w-[920px] grid-cols-1 gap-4 lg:grid-cols-2">
              {faqs.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-hairline bg-canvas px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-[16px] font-bold text-ink">
                    <span>{item.q}</span>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint text-brand-dark transition-transform group-open:rotate-45">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-[14px] leading-[24px] text-slate2">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="w-full bg-mint">
          <div className="mx-auto max-w-page px-6 py-20 lg:px-12 lg:py-24">
            <div className="mx-auto max-w-[760px] text-center">
              <h2 className="text-[32px] font-black leading-[44px] text-ink lg:text-[40px] lg:leading-[52px]">
                {ctaTitle}
              </h2>
              <p className="mx-auto mt-5 max-w-[620px] text-[17px] leading-[28px] text-slate2">
                {ctaSubtitle}
              </p>
              <Link
                href={currentUser ? "/courses" : "/login?mode=register"}
                className="mt-8 inline-block rounded-full bg-brand px-10 py-4 text-[17px] font-bold text-white shadow-card-strong transition-transform hover:scale-[1.02]"
              >
                {ctaButton}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="w-full bg-ink">
        <div className="mx-auto max-w-page px-6 py-16 lg:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00D9A1] to-[#04994F]">
                  <LogoGlyph className="text-white" />
                </span>
                <span className="text-[22px] font-bold text-white">{footer.brand}</span>
              </div>
              <p className="mt-4 text-[14px] leading-[22px] text-copyright">{footer.tagline}</p>
              <p className="mt-3 text-[13px] text-copyright">{footer.socials}</p>
            </div>

            {footer.columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-[15px] font-bold text-white">{col.title}</h4>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href="/courses" className="text-[14px] text-copyright transition-colors hover:text-white">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-white/10 pt-6">
            <p className="text-[13px] text-copyright">{footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
