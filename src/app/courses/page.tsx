'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, Course, Lesson, UserProfile } from '@/lib/db';

interface ExtendedCourse extends Course {
  lessons: Lesson[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<ExtendedCourse[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedLevel, setSelectedLevel] = useState<'全部' | '入门' | '进阶' | '高级'>('全部');

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

      // Fetch all courses
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

  const getCourseLevel = (price: number, title: string) => {
    const t = title.toLowerCase();
    // Check advanced first
    if (t.includes('高级') || t.includes('架构') || t.includes('pytorch') || t.includes('深度学习') || price > 400) {
      return { label: '高级', className: 'level-advanced text-[var(--rose)]' };
    }
    // Check intermediate second
    if (t.includes('实战') || t.includes('企业级') || t.includes('kubernetes') || price > 200) {
      return { label: '进阶', className: 'level-intermediate text-[var(--amber)]' };
    }
    // Default to beginner
    return { label: '入门', className: 'level-beginner text-[var(--green)]' };
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[var(--bg)]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-[var(--muted)] text-xs font-semibold">正在载入课程列表...</p>
      </div>
    );
  }

  // Filter courses by level pill selection
  const filteredCourses = courses.filter(course => {
    if (selectedLevel === '全部') return true;
    const lvl = getCourseLevel(Number(course.price), course.title).label;
    return lvl === selectedLevel;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      
      {/* ===== NAVIGATION ===== */}
      <nav className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--border)] bg-[oklch(from_var(--bg)_l_c_h_/_0.82)]">
        <div className="max-w-[1180px] mx-auto px-6 flex items-center justify-between h-17">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-[20px] tracking-tight text-[var(--fg)]">
            <span className="w-7.5 h-7.5 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white text-[15px] font-extrabold">
              宁
            </span>
            小宁学习
          </Link>
          
          <div className="hidden md:flex items-center gap-0.5 font-medium text-[14.5px]">
            <Link href="/" className="px-4 py-2 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors">
              首页
            </Link>
            <Link href="/courses" className="px-4 py-2 rounded-[var(--radius-sm)] text-[var(--fg)] bg-[var(--surface-2)] font-semibold">
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
                <Link href="/login?mode=login" className="btn hover:bg-[var(--surface-2)] border border-[var(--border)] px-[20px] py-[9px] text-[14px] text-[var(--muted)]">
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

      {/* ===== PAGE HEADER ===== */}
      <div className="max-w-[1180px] mx-auto w-full px-6 pt-14 pb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)] mb-3.5">
            120+ 系统课程 · 持续更新
          </div>
          <h1 className="text-3xl sm:text-[38px] font-extrabold tracking-tight text-[var(--fg)] leading-none mb-2.5">全部课程</h1>
          <p className="text-[15.5px] text-[var(--muted)] max-w-[480px] leading-normal">找到适合你当前水平的课程，从入门到精通，系统化学习编程。</p>
        </div>
        
        {/* Filter Pills */}
        <div className="flex gap-2 flex-wrap select-none">
          {(['全部', '入门', '进阶', '高级'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`font-mono text-[12.5px] tracking-wider px-4 py-2 rounded-full border cursor-pointer transition-colors ${
                selectedLevel === lvl
                  ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* ===== COURSES GRID ===== */}
      <main className="max-w-[1180px] mx-auto w-full px-6 flex-1 mb-14">
        
        <div className="grid gap-[1px] md:grid-cols-2 lg:grid-cols-3 bg-[var(--border)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
          
          {filteredCourses.map((course) => {
            const priceVal = Number(course.price);
            const levelInfo = getCourseLevel(priceVal, course.title);
            const totalHours = Math.ceil(course.lessons.reduce((acc, curr) => acc + curr.duration, 0) / 3600);
            
            return (
              <article 
                key={course.id}
                onClick={() => window.location.href = `/courses/${course.id}`}
                className="bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer flex flex-col justify-between"
              >
                
                {/* Course Thumbnail */}
                <div className="h-[152px] relative flex items-center justify-center overflow-hidden bg-[var(--border)] group">
                  {course.cover_image ? (
                    <img 
                      src={course.cover_image} 
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-[var(--accent-soft)] flex items-center justify-center text-4xl">
                      宁
                    </div>
                  )}

                  {/* Play Hover Overlay */}
                  <span className="play-icon relative z-10 w-[42px] h-[42px] rounded-full bg-white/92 dark:bg-slate-900/90 flex items-center justify-center text-[var(--accent)] shadow-md transition-transform duration-200 group-hover:scale-108">
                    <svg className="h-[15px] w-[15px] fill-current stroke-none" viewBox="0 0 24 24">
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                  </span>
                  
                  {/* Level Badge */}
                  <span className={`absolute top-3 left-3 z-10 px-2.75 py-1 rounded-full text-[10.5px] font-bold font-mono tracking-wider uppercase bg-white/90 dark:bg-slate-900/90 ${levelInfo.className}`}>
                    {levelInfo.label}
                  </span>
                </div>

                {/* Course Content */}
                <div className="p-[22px_22px_16px] flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-[18px] text-[var(--fg)] tracking-tight leading-snug mb-2 line-clamp-1">
                      {course.title}
                    </h3>
                    
                    <div 
                      className="text-[13.5px] text-[var(--muted)] leading-relaxed mb-4 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: course.description }}
                    />
                    
                    {/* Meta Row */}
                    <div className="flex items-center gap-3.5 text-[12.5px] text-[var(--muted)]">
                      <span className="flex items-center gap-1.25">
                        <svg className="h-[15px] w-[15px] stroke-current fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        {course.lessons.length} 课时
                      </span>
                      <span className="flex items-center gap-1.25">
                        <svg className="h-[15px] w-[15px] stroke-current fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {totalHours > 0 ? totalHours : 1} 小时
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="h-[15px] w-[15px] fill-current stroke-none text-amber-400" viewBox="0 0 24 24">
                          <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
                        </svg>
                        4.8 (1.2k)
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-[var(--border)] mt-[16px] pt-4.5 flex items-center justify-between">
                    <span className="flex items-center gap-2.5 text-[13px] text-[var(--muted)] font-medium">
                      <span className="w-5.5 h-5.5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-[10px]">
                        宁
                      </span>
                      小宁老师
                    </span>
                    <span className={`font-mono font-bold text-[14.5px] ${priceVal === 0 ? 'text-[var(--green)]' : 'text-[var(--accent)]'}`}>
                      {priceVal === 0 ? '免费' : `¥${priceVal}`}
                    </span>
                  </div>
                </div>

              </article>
            );
          })}

          {filteredCourses.length === 0 && (
            <div className="col-span-full py-20 text-center bg-[var(--surface)]">
              <svg className="h-9 w-9 text-[var(--muted)] mx-auto mb-3 stroke-current fill-none" strokeWidth="1.6" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-[var(--muted)] text-sm font-semibold">该分类下暂无已上架的课程，敬请期待。</p>
            </div>
          )}
        </div>

        {/* Pagination Buttons */}
        {filteredCourses.length > 0 && (
          <div className="flex justify-center gap-1.5 mt-14 mb-[72px] select-none">
            <button className="page-btn active w-9.5 h-9.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--accent)] text-white flex items-center justify-center font-mono text-[13px] cursor-pointer">1</button>
            <button className="page-btn w-9.5 h-9.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--fg)] hover:text-[var(--fg)] flex items-center justify-center font-mono text-[13px] cursor-pointer">2</button>
            <button className="page-btn w-9.5 h-9.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--fg)] hover:text-[var(--fg)] flex items-center justify-center font-mono text-[13px] cursor-pointer">3</button>
            <button className="page-btn w-9.5 h-9.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--fg)] hover:text-[var(--fg)] flex items-center justify-center font-mono text-[13px] cursor-pointer">4</button>
            <button className="page-btn w-9.5 h-9.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--fg)] hover:text-[var(--fg)] flex items-center justify-center font-mono text-[13px] cursor-pointer">›</button>
          </div>
        )}

      </main>

      {/* ===== FOOTER ===== */}
      <footer className="py-14 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 mb-12">
            
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
                <li><Link href="/courses" className="text-[13.5px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">Python 入门</Link></li>
                <li><Link href="/courses" className="text-[13.5px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">前端开发</Link></li>
                <li><Link href="/courses" className="text-[13.5px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">AI 应用</Link></li>
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
            <span>ALL RIGHTS RESERVED</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
