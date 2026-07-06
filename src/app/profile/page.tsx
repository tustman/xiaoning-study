'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, Course, Lesson, UserProfile } from '@/lib/db';
import { BookOpen, Award, CheckCircle } from 'lucide-react';

interface EnrolledCourse extends Course {
  lessons: Lesson[];
  watchedCount: number;
  progressPercent: number;
}

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [inProgressCourses, setInProgressCourses] = useState<EnrolledCourse[]>([]);
  const [completedCourses, setCompletedCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
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
        for (const c of published) {
          const isPaidOwned = paidCourseIds.has(c.id);
          const isFree = Number(c.price) === 0;

          // Enrolled if owned or free
          if (isPaidOwned || isFree) {
            const lessons = await db.getLessons(c.id);
            const sortedLessons = lessons.sort((a, b) => a.order_index - b.order_index);
            
            // Calculate watched lessons
            const courseLessonIds = new Set(sortedLessons.map(l => l.id));
            const watchedCount = watchedIds.filter(id => courseLessonIds.has(id)).length;
            const totalCount = sortedLessons.length;
            const progressPercent = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

            enrolled.push({
              ...c,
              lessons: sortedLessons,
              watchedCount,
              progressPercent
            });
          }
        }

        // Split into in-progress and completed
        setInProgressCourses(enrolled.filter(c => c.progressPercent < 100));
        setCompletedCourses(enrolled.filter(c => c.progressPercent === 100));
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const handleSignOut = async () => {
    await db.signOut();
    setCurrentUser(null);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#fafbfe]">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-slate-500 text-xs font-semibold">正在载入您的学习看板...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[var(--bg)] px-6 text-center">
        <Award className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-[var(--fg)]">您尚未登录</h2>
        <p className="text-sm text-[var(--muted)] mt-1.5 max-w-xs">请先返回首页登录或注册，开启您的编程学习之旅。</p>
        <Link href="/" className="btn btn-primary text-xs font-bold mt-6">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      
      {/* ===== NAVIGATION ===== */}
      <nav className="sticky top-0 z-45 backdrop-blur-md border-b border-[var(--border)] bg-white/80">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-[var(--fg)] tracking-tight">
            <span className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white text-base font-extrabold shadow-sm">
              宁
            </span>
            小宁学习
          </Link>
          
          <div className="hidden md:flex items-center gap-1 font-semibold text-xs text-[var(--muted)]">
            <Link href="/" className="px-4 py-2 rounded-md hover:text-[var(--fg)] hover:bg-[var(--border)]">
              首页
            </Link>
            <Link href="/courses" className="px-4 py-2 rounded-md hover:text-[var(--fg)] hover:bg-[var(--border)]">
              课程
            </Link>
            <Link href="/profile" className="px-4 py-2 rounded-md hover:text-[var(--fg)] hover:bg-[var(--border)] text-[var(--accent)] font-bold">
              我的学习
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              {currentUser.role === 'admin' && (
                <Link 
                  href="/admin/courses" 
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-extrabold bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 transition-all"
                >
                  管理后台
                </Link>
              )}
              
              <div className="flex items-center gap-2 text-[11px] bg-slate-100/80 border border-[var(--border)] rounded-lg px-3 py-1.5">
                <span className="font-bold text-[var(--fg)] truncate max-w-[80px]">
                  {currentUser.nickname}
                </span>
                <button
                  onClick={handleSignOut}
                  className="ml-1 text-slate-400 hover:text-rose-500 font-bold transition-all cursor-pointer"
                >
                  退出
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== PAGE HEADER ===== */}
      <div className="max-w-[1200px] mx-auto w-full px-6 py-12 flex items-center gap-4">
        <span className="w-11 h-11 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-base font-extrabold shadow-sm">
          {currentUser.nickname.slice(0, 1).toUpperCase()}
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)]">我的课程</h1>
      </div>

      {/* ===== STUDY CONTENT ===== */}
      <main className="max-w-[1200px] mx-auto w-full px-6 flex-1 mb-16">
        
        {/* 进行中的课程 */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] mb-8 overflow-hidden">
          <div className="flex justify-between items-center px-7 py-5 border-b border-[var(--border)]">
            <h2 className="font-bold text-sm text-[var(--fg)]">进行中的课程</h2>
            <Link href="/courses" className="text-xs text-[var(--accent)] font-semibold hover:underline">
              继续选课 →
            </Link>
          </div>

          <div className="flex flex-col">
            {inProgressCourses.map((course) => (
              <div 
                key={course.id}
                onClick={() => window.location.href = `/courses/${course.id}`}
                className="flex items-center gap-4 px-7 py-5 border-b border-[var(--border)] last:border-b-0 hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <div className="w-[72px] h-[52px] rounded-lg bg-[oklch(from_var(--accent)_0.94_0.03_255)] text-white flex items-center justify-center text-lg shrink-0">
                  📚
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[var(--fg)] mb-1 truncate">{course.title}</h3>
                  <p className="text-[11px] text-[var(--muted)] font-semibold">
                    已学 {course.watchedCount}/{course.lessons.length} 课时
                  </p>
                  <div className="w-full bg-[var(--border)] h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[var(--accent)] h-full rounded-full transition-all" style={{ width: `${course.progressPercent}%` }}></div>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-[var(--muted)] min-w-[36px] text-right">
                  {course.progressPercent}%
                </span>
              </div>
            ))}

            {inProgressCourses.length === 0 && (
              <div className="py-12 text-center text-xs text-[var(--muted)] font-semibold">
                当前没有正在学习中的课程，去选课吧。
              </div>
            )}
          </div>
        </div>

        {/* 已完成的课程 */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
          <div className="px-7 py-5 border-b border-[var(--border)]">
            <h2 className="font-bold text-sm text-[var(--fg)]">已完成的课程</h2>
          </div>

          <div className="flex flex-col">
            {completedCourses.map((course) => (
              <div 
                key={course.id}
                onClick={() => window.location.href = `/courses/${course.id}`}
                className="flex items-center gap-4 px-7 py-5 border-b border-[var(--border)] last:border-b-0 hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <div className="w-[72px] h-[52px] rounded-lg bg-emerald-500 text-white flex items-center justify-center text-lg shrink-0">
                  🎓
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[var(--fg)] mb-1 truncate">{course.title}</h3>
                  <p className="text-[11px] text-[var(--muted)] font-semibold">
                    {course.lessons.length} 个课时已全部学完
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> 100%
                </span>
              </div>
            ))}

            {completedCourses.length === 0 && (
              <div className="py-12 text-center text-xs text-[var(--muted)] font-semibold">
                暂无已完成的课程，加油！
              </div>
            )}
          </div>
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
    </div>
  );
}
