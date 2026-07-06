'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, Course, UserProfile } from '@/lib/db';
import { BookOpen, User, Shield, ExternalLink, Play, GraduationCap } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const allCourses = await db.getCourses();
      // Only show published courses on C-end
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
    // Force reload courses in case access changes
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#09090b]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-brand-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-zinc-400 text-sm">正在加载课程内容...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#09090b] text-[#fafafa] min-h-screen pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-zinc-800/50 backdrop-blur-md px-4 py-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-brand-500" />
          <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            小宁学堂
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentUser?.role === 'admin' && (
            <Link 
              id="admin-dashboard-link"
              href="/admin/courses" 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 border border-brand-500/30 text-brand-400 hover:bg-brand-500/20 transition-all"
            >
              <Shield className="h-3 w-3" />
              管理后台
            </Link>
          )}
          
          <div className="flex items-center gap-2 text-xs bg-zinc-900 border border-zinc-800 rounded-full p-0.5">
            <span className="px-2 text-zinc-400">身份:</span>
            <button
              onClick={() => handleRoleToggle('user')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                currentUser?.role === 'user'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              学生
            </button>
            <button
              onClick={() => handleRoleToggle('admin')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                currentUser?.role === 'admin'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              管理员
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative px-4 py-12 sm:px-8 text-center max-w-4xl mx-auto mt-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-500/10 blur-3xl rounded-full -z-10 pointer-events-none animate-pulse-slow"></div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 border border-brand-500/20 text-brand-400">
          🚀 Next.js 15 & Supabase 移动端优先实践
        </span>
        <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight leading-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          掌握全栈开发核心技能
        </h1>
        <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
          小宁学堂为您精心打造精品移动端课程，支持 HLS 视频防盗鉴权、7pay 支付极速闭环，以及全套管理后台。
        </p>
      </section>

      {/* Course List Catalog */}
      <main className="px-4 max-w-xl sm:max-w-4xl mx-auto w-full mt-6 flex-1">
        <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-500" />
          推荐课程
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {courses.map((course) => (
            <div key={course.id} className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
              {/* Cover Image */}
              <div className="relative aspect-[16/9] w-full bg-zinc-950 overflow-hidden">
                <img 
                  src={course.cover_image} 
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <span className="absolute top-3 right-3 px-2 py-1 text-[10px] font-bold tracking-wider rounded-md uppercase bg-black/60 border border-white/10 backdrop-blur-sm">
                  已上架
                </span>
              </div>

              {/* Course Detail Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-zinc-100 line-clamp-1 leading-snug">
                    {course.title}
                  </h3>
                  {/* Clean Rich Text Snippet */}
                  <div 
                    className="text-xs text-zinc-400 mt-2 line-clamp-2 prose"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                </div>

                <div className="mt-5 flex items-center justify-between pt-3 border-t border-zinc-800/60">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">课程价格</span>
                    <span className="text-lg font-black text-brand-400">
                      ¥ {Number(course.price).toFixed(2)}
                    </span>
                  </div>

                  <Link
                    id={`view-course-${course.id}`}
                    href={`/courses/${course.id}`}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 active:scale-95 transition-all shadow-lg shadow-brand-500/20"
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
              <BookOpen className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">暂无上架课程，请以管理员身份登录并在后台创建。</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer / Mobile Safety Bottom */}
      <footer className="mt-16 border-t border-zinc-900 py-6 px-4 text-center text-xs text-zinc-500 safe-pb">
        <p>© 2026 小宁学堂. All Rights Reserved.</p>
        <p className="mt-1 text-[10px] text-zinc-600">采用 Tailwind CSS & Next.js App Router 驱动</p>
      </footer>
    </div>
  );
}
