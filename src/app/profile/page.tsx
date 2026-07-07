'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, Course, Lesson, UserProfile } from '@/lib/db';

interface EnrolledCourse extends Course {
  lessons: Lesson[];
  watchedCount: number;
  progressPercent: number;
  watchedDuration: number; // seconds
}

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [inProgressCourses, setInProgressCourses] = useState<EnrolledCourse[]>([]);
  const [completedCourses, setCompletedCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Stats
  const [statLessonsCount, setStatLessonsCount] = useState(0);
  const [statHoursCount, setStatHoursCount] = useState(0);

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

      const activeUser = await db.syncSessionUserProfile();
      setCurrentUser(activeUser);

      if (activeUser) {
        // Fetch all courses
        const allCourses = await db.getCourses();
        const published = allCourses.filter(c => c.status === 'published');

        // Fetch user's orders
        const ordersObj = await db.getOrders();
        const paidCourseIds = new Set(
          ordersObj
            .filter(o => o.user_id === activeUser.id && o.status === 'completed')
            .map(o => o.course_id)
        );

        // Get watched lessons from localStorage
        let watchedIds: string[] = [];
        try {
          const stored = localStorage.getItem(`watched_lessons_${activeUser.id}`);
          if (stored) {
            watchedIds = JSON.parse(stored);
          }
        } catch (e) {
          console.error(e);
        }

        const enrolled: EnrolledCourse[] = [];
        let totalWatchedLessons = 0;
        let totalSeconds = 0;

        for (const c of published) {
          const isPaidOwned = paidCourseIds.has(c.id);
          const isFree = Number(c.price) === 0;

          // Enrolled if owned or free
          if (isPaidOwned || isFree) {
            const lessons = await db.getLessons(c.id);
            const sortedLessons = lessons.sort((a, b) => a.order_index - b.order_index);
            
            // Calculate watched lessons
            const courseLessonIds = new Set(sortedLessons.map(l => l.id));
            const watchedList = sortedLessons.filter(l => watchedIds.includes(l.id));
            const watchedCount = watchedList.length;
            const totalCount = sortedLessons.length;
            const progressPercent = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;
            
            // Watched duration
            const watchedDuration = watchedList.reduce((acc, curr) => acc + curr.duration, 0);

            totalWatchedLessons += watchedCount;
            totalSeconds += watchedDuration;

            enrolled.push({
              ...c,
              lessons: sortedLessons,
              watchedCount,
              progressPercent,
              watchedDuration
            });
          }
        }

        setStatLessonsCount(totalWatchedLessons);
        setStatHoursCount(Math.ceil(totalSeconds / 3600));

        // Split into in-progress and completed
        setInProgressCourses(enrolled.filter(c => c.progressPercent < 100));
        setCompletedCourses(enrolled.filter(c => c.progressPercent === 100));
      }

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
    window.location.href = '/';
  };

  // Helper to render icon matching course content
  const renderCourseIcon = (title: string, colorClass = "text-[var(--accent)]") => {
    const t = title.toLowerCase();
    if (t.includes('python') || t.includes('go') || t.includes('后端')) {
      return (
        <svg className={`h-5 w-5 ${colorClass} stroke-current fill-none`} strokeWidth="1.6" viewBox="0 0 24 24">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    }
    if (t.includes('react') || t.includes('html') || t.includes('前端') || t.includes('javascript') || t.includes('css')) {
      return (
        <svg className={`h-5 w-5 ${colorClass} stroke-current fill-none`} strokeWidth="1.6" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="2.5" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
        </svg>
      );
    }
    if (t.includes('ai') || t.includes('learning') || t.includes('学习') || t.includes('agent')) {
      return (
        <svg className={`h-5 w-5 ${colorClass} stroke-current fill-none`} strokeWidth="1.6" viewBox="0 0 24 24">
          <rect x="3" y="8" width="18" height="12" rx="2" />
          <path d="M8 8V6a4 4 0 0 1 8 0v2" />
          <circle cx="9" cy="14" r="1" />
          <circle cx="15" cy="14" r="1" />
        </svg>
      );
    }
    // Default fallback
    return (
      <svg className={`h-5 w-5 ${colorClass} stroke-current fill-none`} strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[var(--bg)]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-[var(--muted)] text-xs font-semibold">正在载入您的学习看板...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[var(--bg)] px-6 text-center">
        <svg className="h-12 w-12 text-[var(--muted)] mb-4 stroke-current fill-none" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
          <path d="M12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" />
          <path d="M6 19C6 16.2386 8.68629 14 12 14C15.3137 14 18 16.2386 18 19" />
        </svg>
        <h2 className="text-xl font-bold text-[var(--fg)]">您尚未登录</h2>
        <p className="text-sm text-[var(--muted)] mt-1.5 max-w-xs">请先前往登录页面登录或注册，开启您的编程学习之旅。</p>
        <Link href="/login?mode=login" className="btn btn-primary text-xs font-bold mt-6">
          前往登录
        </Link>
      </div>
    );
  }

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
            <Link href="/courses" className="px-4 py-2 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors">
              课程
            </Link>
            <Link href="/profile" className="px-4 py-2 rounded-[var(--radius-sm)] text-[var(--fg)] bg-[var(--surface-2)] font-semibold">
              我的学习
            </Link>
          </div>

          <div className="flex items-center gap-2">
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
            
            <span 
              onClick={handleSignOut}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-[oklch(52%_0.2_275)] flex items-center justify-center text-white text-[15px] font-bold cursor-pointer select-none"
              title="点击退出登录"
            >
              {currentUser.nickname ? currentUser.nickname.slice(0, 1).toUpperCase() : '宁'}
            </span>
          </div>
        </div>
      </nav>

      {/* ===== PAGE HEADER ===== */}
      <div className="max-w-[1180px] mx-auto w-full px-6 pt-14 pb-8 flex items-center gap-4.5">
        <span className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)] to-[oklch(52%_0.2_275)] flex items-center justify-center text-white text-[19px] font-extrabold shadow-sm select-none">
          {currentUser.nickname ? currentUser.nickname.slice(0, 1).toUpperCase() : '宁'}
        </span>
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--fg)] leading-none mb-1">我的课程</h1>
          <p className="text-[14.5px] text-[var(--muted)]">持续学习是最好的投资</p>
        </div>
      </div>

      {/* ===== STATISTICS STRIP ===== */}
      <div className="max-w-[1180px] mx-auto w-full px-6 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[var(--border)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
          <div className="bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors p-[22px_26px]">
            <div className="font-mono text-[27px] font-bold text-[var(--fg)] leading-none">{inProgressCourses.length}</div>
            <div className="text-[12.5px] text-[var(--muted)] mt-1.5">在学课程</div>
          </div>
          <div className="bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors p-[22px_26px]">
            <div className="font-mono text-[27px] font-bold text-[var(--fg)] leading-none">{statLessonsCount}</div>
            <div className="text-[12.5px] text-[var(--muted)] mt-1.5">已完成课时</div>
          </div>
          <div className="bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors p-[22px_26px]">
            <div className="font-mono text-[27px] font-bold text-[var(--fg)] leading-none">{statHoursCount} h</div>
            <div className="text-[12.5px] text-[var(--muted)] mt-1.5">累计学习时长</div>
          </div>
          <div className="bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors p-[22px_26px]">
            <div className="font-mono text-[27px] font-bold text-[var(--fg)] leading-none">12</div>
            <div className="text-[12.5px] text-[var(--muted)] mt-1.5">连续打卡天数</div>
          </div>
        </div>
      </div>

      {/* ===== STUDY CONTENT ===== */}
      <main className="max-w-[1180px] mx-auto w-full px-6 flex-1 mb-16 flex flex-col gap-6">
        
        {/* 进行中的课程 */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
          <div className="flex justify-between items-center px-[26px] py-[22px] border-b border-[var(--border)]">
            <h2 className="font-bold text-[18px] text-[var(--fg)] leading-none">进行中的课程</h2>
            <Link href="/courses" className="text-[13px] text-[var(--accent)] font-semibold hover:underline">
              继续选课 &rarr;
            </Link>
          </div>

          <div className="flex flex-col">
            {inProgressCourses.map((course) => (
              <div 
                key={course.id}
                onClick={() => window.location.href = `/courses/${course.id}`}
                className="flex items-center gap-4.5 px-6.5 py-5 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              >
                <div className="w-[46px] h-[46px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                  {renderCourseIcon(course.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-bold text-[var(--fg)] mb-1 truncate leading-snug">{course.title}</h3>
                  <p className="text-[12.5px] text-[var(--muted)] font-mono">
                    小宁老师 &middot; 课时 {course.watchedCount}/{course.lessons.length}
                  </p>
                  <div className="w-full bg-[var(--border)] h-[3px] rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-[var(--accent)] h-full rounded-full transition-all duration-350" style={{ width: `${course.progressPercent}%` }}></div>
                  </div>
                </div>
                <span className="font-mono text-[13px] font-bold text-[var(--muted)] min-w-[40px] text-right">
                  {course.progressPercent}%
                </span>
              </div>
            ))}

            {inProgressCourses.length === 0 && (
              <div className="py-14 text-center text-sm text-[var(--muted)] font-semibold">
                当前没有正在学习中的课程，去选课吧。
              </div>
            )}
          </div>
        </div>

        {/* 已完成的课程 */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
          <div className="px-[26px] py-[22px] border-b border-[var(--border)]">
            <h2 className="font-bold text-[18px] text-[var(--fg)] leading-none">已完成的课程</h2>
          </div>

          <div className="flex flex-col">
            {completedCourses.map((course) => (
              <div 
                key={course.id}
                onClick={() => window.location.href = `/courses/${course.id}`}
                className="flex items-center gap-4.5 px-6.5 py-5 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              >
                <div className="w-[46px] h-[46px] rounded-[var(--radius-md)] border border-transparent bg-[var(--green-soft)] flex items-center justify-center shrink-0">
                  {renderCourseIcon(course.title, "text-[var(--green)]")}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-bold text-[var(--fg)] mb-1 truncate leading-snug">{course.title}</h3>
                  <p className="text-[12.5px] text-[var(--muted)] font-mono">
                    小宁老师 &middot; {course.lessons.length} 课时 &middot; 已学完
                  </p>
                </div>
                <span className="text-[13px] font-bold text-[var(--green)] flex items-center gap-1">
                  <svg className="h-4.5 w-4.5 stroke-current fill-none stroke-[2.5]" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  100%
                </span>
              </div>
            ))}

            {completedCourses.length === 0 && (
              <div className="py-14 text-center text-sm text-[var(--muted)] font-semibold">
                暂无已完成的课程，加油！
              </div>
            )}
          </div>
        </div>

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

          <div className="border-t border-[var(--border)] pt-5.5 flex justify-between items-center text-[13px] text-[var(--muted)] flex-wrap gap-2">
            <span>&copy; 2026 小宁学习</span>
            <span>保留所有权利</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
