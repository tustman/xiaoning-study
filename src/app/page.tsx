'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, Course, Lesson, UserProfile } from '@/lib/db';
import { 
  BookOpen, Shield, Play, GraduationCap, User, LogOut, Key, Mail, Sparkles, 
  X, Check, ArrowRight, Laptop, HelpCircle, UserCheck, ShieldAlert 
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
      
      // Load lessons for each course to show syllabus on landing page
      const coursesWithLessons: ExtendedCourse[] = [];
      for (const course of published) {
        const lessons = await db.getLessons(course.id);
        coursesWithLessons.push({
          ...course,
          lessons: lessons.sort((a, b) => a.order_index - b.order_index)
        });
      }
      setCourses(coursesWithLessons);
      
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
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa]">
        <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 text-xs font-semibold">正在加载学堂...</p>
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
    <div className="flex-1 flex flex-col bg-white text-slate-900 min-h-screen pb-24 relative overflow-x-hidden">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-500/20">
            宁
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">
            小宁 AI 学堂
          </span>
        </div>

        <nav className="hidden md:flex gap-8 text-xs font-bold text-slate-500">
          <a href="#" className="hover:text-blue-600 transition-colors">首页</a>
          <a href="#courses" className="hover:text-blue-600 transition-colors">精选课程</a>
          <a href="#author" className="hover:text-blue-600 transition-colors">关于讲师</a>
          <a href="#faq" className="hover:text-blue-600 transition-colors">常见问题</a>
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              {currentUser.role === 'admin' && (
                <Link 
                  id="admin-dashboard-link"
                  href="/admin/courses" 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 transition-all"
                >
                  <Shield className="h-3 w-3" />
                  管理后台
                </Link>
              )}
              
              <div className="flex items-center gap-2 text-[10px] bg-slate-50 border border-slate-200/50 rounded-full px-3 py-1.5">
                <User className="h-3 w-3 text-slate-500" />
                <span className="font-extrabold text-slate-700 truncate max-w-[80px]">
                  {currentUser.nickname}
                </span>
                <span className="text-[9px] px-1 bg-slate-200/60 rounded font-bold text-slate-500">
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
              className="px-4 py-1.5 rounded-full text-xs font-extrabold bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              登录 / 注册
            </button>
          )}
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative px-4 py-16 sm:py-24 text-center max-w-5xl mx-auto w-full">
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-grid-pattern pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 border border-blue-100 text-blue-600 animate-pulse">
          <Sparkles className="h-3 w-3" />
          零基础也能用 AI 做出第一个能赚钱的项目
        </div>

        <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-900">
          零基础 AI 编程实战教程
        </h1>
        
        <p className="mt-4 text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
          以 <strong>Cursor + Claude Code</strong> 实战为主，面向编程新手的 AI 编程课程。
          通过几十个实战案例，手把手带你开发出属于自己的网站、小程序、浏览器插件、App 以及 AI Agent。
          让你零基础也能用 AI 做出第一个应用！
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <a
            href="#courses"
            className="inline-flex items-center justify-center gap-1.5 px-8 py-3 rounded-full text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 shadow-md shadow-blue-500/20"
          >
            立即开始学习
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
          <a
            href="#faq"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full text-xs font-extrabold border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all bg-white"
          >
            常见问题解答
          </a>
        </div>

        {/* Checklist Features */}
        <div className="flex items-center justify-center flex-wrap gap-5 mt-8 text-[11px] text-slate-500 font-bold">
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-blue-600" />
            <span>3000+ 学员已加入</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-blue-600" />
            <span>精选实战项目案例</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-blue-600" />
            <span>零基础友好保姆级</span>
          </div>
        </div>

        {/* Video Placeholder Box */}
        <div className="mt-12 max-w-4xl mx-auto rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xl bg-slate-50 aspect-[16/9] relative group cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&auto=format&fit=crop&q=80" 
            alt="Hero course mockup"
            className="w-full h-full object-cover group-hover:scale-101 transition-all duration-700 brightness-[0.95]"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-all">
            <div className="w-20 h-20 rounded-full bg-blue-600/10 backdrop-blur-md flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-all">
                <Play className="h-6 w-6 fill-current ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid List */}
      <section id="courses" className="py-16 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-12">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 border border-blue-100 text-blue-600">
              精品专栏
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-3">课程内容精选</h2>
            <p className="text-xs text-slate-400 mt-1">精心设计的课程体系，带你由浅入深搞定 AI 开发商业化</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5">
                
                {/* Card Header Cover */}
                <div className="relative aspect-[16/9] bg-slate-100 border-b border-slate-100">
                  <img 
                    src={course.cover_image} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 right-3 px-2 py-0.5 text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md">
                    持续更新中
                  </span>
                </div>

                {/* Content Area */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 line-clamp-1">
                      {course.title}
                    </h3>
                    <div 
                      className="text-xs text-slate-500 mt-2 line-clamp-2 prose"
                      dangerouslySetInnerHTML={{ __html: course.description }}
                    />

                    {/* Syllabus Lesson List */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        课程目录
                      </p>
                      {course.lessons.slice(0, 3).map((lesson) => (
                        <Link 
                          key={lesson.id}
                          href={`/courses/${course.id}?lessonId=${lesson.id}`}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 text-[11px] text-slate-600 hover:text-blue-600 font-bold transition-all"
                        >
                          <span className="truncate max-w-[150px]">{lesson.title}</span>
                          {lesson.is_free_preview ? (
                            <span className="text-[9px] px-1 bg-emerald-50 text-emerald-600 rounded">试听</span>
                          ) : (
                            <Play className="h-2.5 w-2.5 text-slate-400" />
                          )}
                        </Link>
                      ))}
                      {course.lessons.length > 3 && (
                        <p className="text-[10px] text-slate-400 font-bold text-center mt-1">
                          查看其余 {course.lessons.length - 3} 个课时...
                        </p>
                      )}
                      {course.lessons.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic">暂无课时录入</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-150 flex items-center justify-between">
                    <div>
                      <span className="block text-[8px] text-slate-400 font-bold uppercase">会员解锁价</span>
                      <span className="text-sm font-black text-slate-800">¥ {Number(course.price).toFixed(2)}</span>
                    </div>

                    <Link
                      id={`view-course-${course.id}`}
                      href={`/courses/${course.id}`}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm shadow-slate-900/10"
                    >
                      开始学习
                    </Link>
                  </div>
                </div>

              </div>
            ))}

            {courses.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200/80">
                <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-xs font-bold">暂无上架课程，请以管理员账号登录并在后台添加。</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      <section id="author" className="py-16 px-4 max-w-4xl mx-auto w-full text-center">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 mx-auto shadow-md">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" 
            alt="Instructor avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-xl font-black text-slate-900 mt-4">我是讲师：小宁老师</h2>
        <p className="text-xs text-blue-600 font-bold mt-1">全栈独立开发者 / AI 商业化顾问</p>
        <p className="text-xs text-slate-500 max-w-xl mx-auto mt-3 leading-relaxed">
          致力于向懂中文的非技术开发者普及低门槛的 AI 全栈开发方案。
          通过真实的国内/国外支付打通、HLS 视频防盗加密等商业项目落地实战案例，手把手带你通过 AI 工具开发属于自己的出海 SaaS 平台与小程序应用，赚取你的第一份独立开发收入！
        </p>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-16 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto w-full">
          <div className="text-center mb-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 border border-blue-100 text-blue-600">
              常见解答
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-3">FAQ 常见问题</h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-slate-400 font-normal">{activeFaq === index ? '−' : '+'}</span>
                </button>
                {activeFaq === index && (
                  <div className="p-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-150 py-8 px-4 text-center text-[10px] text-slate-400 safe-pb">
        <p>© 2026 小宁 AI 学堂. All Rights Reserved.</p>
        <p className="mt-1 text-[9px] text-slate-350">基于 Next.js & Supabase & 7pay 深度重制版</p>
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
