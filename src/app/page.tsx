'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, Course, Lesson, UserProfile } from '@/lib/db';
import { 
  BookOpen, Shield, Play, GraduationCap, User, LogOut, Key, Mail, Sparkles, 
  X, Check, ArrowRight, Laptop, HelpCircle, Activity, ExternalLink, PlayCircle 
} from 'lucide-react';

interface ExtendedCourse extends Course {
  lessons: Lesson[];
}

export default function Home() {
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

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa]">
        <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 text-xs font-semibold">正在载入云端资源...</p>
      </div>
    );
  }

  const faqs = [
    {
      q: '没有任何编程基础可以学吗？',
      a: '完全可以。本课程是专门面向零基础编程新手的。我们将使用 AI 编程辅助工具 Cursor 配合 Claude 模型，您不需要手写复杂的底层语法，只要用大白话（自然语言）向 AI 描述需求，就能在 AI 的帮助下轻松构建出实用的应用项目。'
    },
    {
      q: '购买课程后，我可以享受到哪些服务？',
      a: '购买课程后，您将立刻解锁该课程名下所有的课时视频播放权限，获得配套的源码、规则配置文件 rules，并可加入专属交流群与讲师及几千名独立开发者直接沟通。'
    },
    {
      q: '什么是 7pay 支付？如何进行模拟支付？',
      a: '本站集成了 7pay 收银台接口，为确保您的资金安全，当前处于沙箱调试模式。点击课程底部的“开始学习”或“立即解锁”，会引导您跳转到收银台，您可直接使用我们提供的内置模拟工具进行“一键完成支付”，无需真正花钱即可完整模拟整个交易授权闭环。'
    },
    {
      q: '课程内容是持续更新的吗？',
      a: '是的。AI 工具迭代日新月异，我们会根据 Cursor、Claude 等前沿工具的最新升级，不断录制并添加最新的开发案例和实用干货。已购用户均享有永久免费的更新迭代观看权。'
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#fafbfe] text-[#1e293b] min-h-screen pb-24 relative overflow-x-hidden">
      
      {/* Decorative Floating Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] bg-blue-400/8 blur-[130px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-[25%] right-[-10%] w-[700px] h-[700px] bg-purple-400/8 blur-[140px] rounded-full pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-[10%] left-[-5%] w-[600px] h-[600px] bg-pink-400/6 blur-[130px] rounded-full pointer-events-none -z-10"></div>

      {/* Sticky Header with Frosted Glass Effect */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/40 px-6 py-3.5 sm:px-12 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-blue-500/20">
            宁
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-tight text-slate-900 leading-none">
              小宁 AI 学堂
            </span>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Premium Learning
            </span>
          </div>
        </div>

        <nav className="hidden md:flex gap-8 text-[11px] font-black uppercase tracking-wider text-slate-450">
          <a href="#" className="hover:text-blue-600 transition-colors">首页</a>
          <a href="#courses" className="hover:text-blue-600 transition-colors">精选课系</a>
          <a href="#author" className="hover:text-blue-600 transition-colors">讲师简介</a>
          <a href="#faq" className="hover:text-blue-600 transition-colors">学堂常见问题解答</a>
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              {currentUser.role === 'admin' && (
                <Link 
                  id="admin-dashboard-link"
                  href="/admin/courses" 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold bg-blue-50/80 border border-blue-100 text-blue-600 hover:bg-blue-100/80 transition-all active:scale-95"
                >
                  <Shield className="h-3 w-3" />
                  管理后台
                </Link>
              )}
              
              <div className="flex items-center gap-2 text-[10px] bg-white/70 border border-slate-200/50 rounded-xl px-3 py-1.5 shadow-xs">
                <User className="h-3 w-3 text-slate-500" />
                <span className="font-extrabold text-slate-700 truncate max-w-[80px]">
                  {currentUser.nickname}
                </span>
                <span className="text-[9px] px-1 bg-slate-100 border border-slate-200/50 rounded font-bold text-slate-500">
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
                setAuthSuccess('');
                setShowAuthModal(true);
              }}
              className="px-5 py-2 rounded-xl text-xs font-black bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95 cursor-pointer shadow-md shadow-slate-900/10"
            >
              登录 / 注册
            </button>
          )}
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative px-6 py-20 sm:py-28 text-center max-w-5xl mx-auto w-full">
        {/* Dot Matrix Background Pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-grid-pattern pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-blue-50/80 border border-blue-100/50 text-blue-600 shadow-xs">
          <Sparkles className="h-3.5 w-3.5" />
          零基础智能开发课程 · 即学即用
        </div>

        <h1 className="mt-6 text-4xl sm:text-7xl font-black tracking-tight leading-[1.1] text-slate-900">
          零基础 <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">AI 编程</span>实战教程
        </h1>
        
        <p className="mt-6 text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed font-bold">
          基于 <strong>Cursor & Claude Code</strong> 全面改版，面向开发小白设计的实战网课。
          跳过枯燥语法，直接以产品实战为导向，带你完成数十款出海 SaaS、小程序与 App 落地，开启数字游民变现大门。
        </p>

        <div className="flex flex-col sm:flex-row gap-4.5 justify-center mt-10">
          <a
            href="#courses"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 shadow-lg shadow-blue-500/25"
          >
            开始解锁课程
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#faq"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl text-xs font-black border border-slate-200/80 hover:bg-slate-50 text-slate-600 transition-all bg-white shadow-xs"
          >
            了解课程 FAQ
          </a>
        </div>

        {/* Feature Checkpoints */}
        <div className="flex items-center justify-center flex-wrap gap-6 mt-10 text-[11px] text-slate-400 font-bold">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center">
              <Check className="h-3 w-3 text-blue-600 stroke-[3]" />
            </div>
            <span>3000+ 精英学员共同选择</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center">
              <Check className="h-3 w-3 text-blue-600 stroke-[3]" />
            </div>
            <span>覆盖国内+海外个人商业收款</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center">
              <Check className="h-3 w-3 text-blue-600 stroke-[3]" />
            </div>
            <span>配套规则与完整工程源码</span>
          </div>
        </div>

        {/* Video Bezel Mockup Container with glowing light shadow */}
        <div className="mt-16 max-w-4xl mx-auto rounded-3xl overflow-hidden border border-slate-200/70 shadow-[0_30px_70px_rgba(59,130,246,0.12)] bg-slate-900 aspect-[16/9] relative group cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&auto=format&fit=crop&q=80" 
            alt="Hero course mockup"
            className="w-full h-full object-cover group-hover:scale-102 transition-all duration-1000 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/30 transition-all">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 transition-transform group-hover:scale-105 duration-75">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/50">
                <Play className="h-6 w-6 fill-current ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Curriculum Roadmap list */}
      <section id="courses" className="py-20 px-6 bg-slate-50/50 border-y border-slate-200/40 relative">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-16">
            <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-blue-50 border border-blue-100/50 text-blue-600">
              CURRICULUM
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-4 leading-tight">全栈商业化课程体系</h2>
            <p className="text-xs text-slate-400 mt-2 font-medium">跳过传统的模拟实训，直接做上线就能开始赚钱的真实商业产品</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 items-start">
            {courses.map((course) => (
              <div key={course.id} className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between h-full border border-slate-200/50">
                
                {/* Course Cover */}
                <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                  <img 
                    src={course.cover_image} 
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
                  />
                  <div className="absolute top-3 right-3 flex gap-1">
                    <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-white/95 text-blue-600 border border-slate-200/50 rounded-lg shadow-xs backdrop-blur-xs">
                      推荐
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 line-clamp-1">
                      {course.title}
                    </h3>
                    <div 
                      className="text-[11px] text-slate-450 mt-2.5 line-clamp-2 prose"
                      dangerouslySetInnerHTML={{ __html: course.description }}
                    />

                    {/* Timeline road map syllabus */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          实战课时大纲
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                          共 {course.lessons.length} 节
                        </span>
                      </div>
                      
                      {course.lessons.slice(0, 4).map((lesson, idx) => (
                        <Link 
                          key={lesson.id}
                          href={`/courses/${course.id}?lessonId=${lesson.id}`}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-150/50 hover:border-blue-200 hover:bg-blue-50/30 text-[11px] text-slate-600 hover:text-blue-600 font-bold transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-lg bg-slate-200/60 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0">
                              {idx + 1}
                            </span>
                            <span className="truncate max-w-[130px]">{lesson.title}</span>
                          </div>
                          {lesson.is_free_preview ? (
                            <span className="text-[8px] font-black px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md shrink-0">免费</span>
                          ) : (
                            <PlayCircle className="h-3.5 w-3.5 text-slate-400 hover:text-blue-600 transition-colors shrink-0" />
                          )}
                        </Link>
                      ))}

                      {course.lessons.length > 4 && (
                        <p className="text-[10px] text-slate-450 font-bold text-center mt-2 hover:text-blue-600 transition-colors">
                          已折叠其余 {course.lessons.length - 4} 个精彩课时 · 点击查看
                        </p>
                      )}
                      {course.lessons.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic">课时录制中，敬请期待</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-slate-150/70 flex items-center justify-between">
                    <div>
                      <span className="block text-[8px] text-slate-400 font-black uppercase tracking-wider">课程专栏学费</span>
                      <span className="text-base font-black text-slate-800">¥ {Number(course.price).toFixed(2)}</span>
                    </div>

                    <Link
                      id={`view-course-${course.id}`}
                      href={`/courses/${course.id}`}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-2xl text-xs font-black transition-all active:scale-95 shadow-md shadow-slate-950/10"
                    >
                      立即开始
                    </Link>
                  </div>
                </div>

              </div>
            ))}

            {courses.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200/50">
                <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-xs font-bold">暂无上架课程，请以管理员账号登录并在后台添加。</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modern Profile Panel */}
      <section id="author" className="py-20 px-6 max-w-4xl mx-auto w-full">
        <div className="glass-card rounded-3xl p-8 border border-slate-200/60 flex flex-col md:flex-row items-center gap-8 shadow-xs bg-white/70">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-slate-200 mx-auto shadow-md shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80" 
              alt="Instructor avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-600">
              INSTRUCTOR
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2 flex items-center justify-center md:justify-start gap-2">
              我是主讲：小宁老师
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/30">Indie Dev</span>
            </h2>
            <p className="text-xs text-blue-600 font-bold mt-1">独立开发者 · 前大厂系统架构师 · AI内容创作者</p>
            <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
              专注于利用前沿的 AI（Cursor + Claude）工具包解放个体生产力。
              带你完成能够真正上线、具备个人收款支付闭环、视频防盗防护的商业级全栈项目。
              希望通过实操案例真正帮助到懂中文的开发者们实现个人出海变现，开启独立开发新征程！
            </p>
          </div>
        </div>
      </section>

      {/* Premium FAQ Accordion Section */}
      <section id="faq" className="py-20 px-6 bg-slate-50/50 border-t border-slate-200/40">
        <div className="max-w-3xl mx-auto w-full">
          <div className="text-center mb-12">
            <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-blue-50 border border-blue-100/50 text-blue-600">
              FAQ
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-4">常见疑问解答</h2>
          </div>

          <div className="flex flex-col gap-3.5">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-xs hover:border-slate-300"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-5 flex items-center justify-between text-left font-extrabold text-xs text-slate-800 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-slate-400 font-normal">{activeFaq === index ? '−' : '+'}</span>
                </button>
                {activeFaq === index && (
                  <div className="p-5 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed bg-slate-50/30 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200/50 py-10 px-6 text-center text-[10px] text-slate-400 safe-pb">
        <p>© 2026 小宁 AI 学堂. All Rights Reserved.</p>
        <p className="mt-1.5 text-[9px] text-slate-350">基于 Next.js 15 & Supabase & 7pay 极速全栈微课架构</p>
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

              {authSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold leading-relaxed animate-pulse">
                  ✓ {authSuccess}
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
                className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-slate-900/10 cursor-pointer"
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
