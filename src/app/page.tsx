'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, Course, UserProfile } from '@/lib/db';
import { BookOpen, Shield, Play, GraduationCap } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const allCourses = await db.getCourses();
      setCourses(allCourses.filter(c => c.status === 'published'));
      setCurrentUser(db.getCurrentUser());
      setLoading(false);
    }
    loadData();
  }, []);

  const handleRoleToggle = (role: 'user' | 'admin') => {
    const email = role === 'admin' ? 'admin@example.com' : 'student@example.com';
    const updatedUser = db.signIn(email, role);
    setCurrentUser(updatedUser);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa]">
        <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-550 text-xs">正在加载课程内容...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] text-[#1e293b] min-h-screen pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/50 backdrop-blur-md px-4 py-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-slate-800" />
          <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            小宁学堂
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentUser?.role === 'admin' && (
            <Link 
              id="admin-dashboard-link"
              href="/admin/courses" 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-600 hover:bg-blue-500/20 transition-all"
            >
              <Shield className="h-3 w-3" />
              管理后台
            </Link>
          )}
          
          <div className="flex items-center gap-2 text-xs bg-slate-100 border border-slate-200/80 rounded-full p-0.5">
            <span className="px-2 text-slate-400">身份:</span>
            <button
              onClick={() => handleRoleToggle('user')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                currentUser?.role === 'user'
                  ? 'bg-white text-slate-800 border border-slate-250 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              学生
            </button>
            <button
              onClick={() => handleRoleToggle('admin')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                currentUser?.role === 'admin'
                  ? 'bg-white text-slate-800 border border-slate-250 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              管理员
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative px-4 py-12 sm:px-8 text-center max-w-4xl mx-auto mt-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/5 blur-3xl rounded-full -z-10 pointer-events-none animate-pulse-slow"></div>
        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-200/50 border border-slate-300/30 text-slate-600">
          🚀 Next.js 15 & Supabase 移动端优先实践
        </span>
        <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight leading-tight bg-gradient-to-b from-slate-900 to-slate-700 bg-clip-text text-transparent">
          怎么方便，怎么学
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          小宁学堂为您精心打造精品移动端课程，支持 HLS 视频防盗鉴权、7pay 支付极速闭环，以及全套管理后台。
        </p>
      </section>

      {/* Course List Catalog */}
      <main className="px-4 max-w-xl sm:max-w-4xl mx-auto w-full mt-6 flex-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          精品推荐
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {courses.map((course) => (
            <div key={course.id} className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
              {/* Cover Image */}
              <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                <img 
                  src={course.cover_image} 
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <span className="absolute top-3 right-3 px-2 py-1 text-[9px] font-bold tracking-wider rounded-md uppercase bg-white/90 text-slate-700 border border-slate-200 backdrop-blur-xs">
                  已上架
                </span>
              </div>

              {/* Course Detail Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 line-clamp-1 leading-snug">
                    {course.title}
                  </h3>
                  <div 
                    className="text-xs text-slate-500 mt-2 line-clamp-2 prose"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                </div>

                <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">应付学费</span>
                    <span className="text-base font-black text-slate-800">
                      ¥ {Number(course.price).toFixed(2)}
                    </span>
                  </div>

                  <Link
                    id={`view-course-${course.id}`}
                    href={`/courses/${course.id}`}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-900/10"
                  >
                    开始学习
                    <Play className="h-3 w-3 fill-current" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {courses.length === 0 && (
            <div className="col-span-full py-16 text-center glass-card rounded-2xl">
              <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-xs">暂无上架课程，请以管理员身份登录并在后台创建。</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer / Mobile Safety Bottom */}
      <footer className="mt-16 border-t border-slate-200/50 py-6 px-4 text-center text-[10px] text-slate-400 safe-pb">
        <p>© 2026 小宁学堂. All Rights Reserved.</p>
        <p className="mt-0.5 text-[9px] text-slate-350">基于 Next.js & Supabase & 7pay 构建</p>
      </footer>
    </div>
  );
}
