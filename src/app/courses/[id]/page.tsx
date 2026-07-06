'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db, Course, Lesson, UserProfile } from '@/lib/db';
import { Play, Lock, ChevronLeft, Film, Clock, CheckCircle, CreditCard, Sparkles } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    async function loadData() {
      const u = db.getCurrentUser();
      setCurrentUser(u);

      const c = await db.getCourse(courseId);
      if (!c) {
        setLoading(false);
        return;
      }
      setCourse(c);

      const l = await db.getLessons(courseId);
      setLessons(l);
      if (l.length > 0) {
        setCurrentLesson(l[0]);
        // Automatically log the initial lesson as watched if user has access
        if (u) {
          try {
            const accessVal = u.role === 'admin' || await db.checkUserAccess(u.id, courseId);
            if (accessVal || l[0].is_free_preview) {
              const key = `watched_lessons_${u.id}`;
              const stored = localStorage.getItem(key);
              let watchedIds: string[] = stored ? JSON.parse(stored) : [];
              if (!watchedIds.includes(l[0].id)) {
                watchedIds.push(l[0].id);
                localStorage.setItem(key, JSON.stringify(watchedIds));
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
      }

      if (u) {
        if (u.role === 'admin') {
          setHasAccess(true);
        } else {
          const access = await db.checkUserAccess(u.id, courseId);
          setHasAccess(access);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [courseId]);

  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    
    // Log progress to localStorage if user is logged in
    if (currentUser) {
      try {
        const isUnlocked = hasAccess || lesson.is_free_preview;
        if (isUnlocked) {
          const key = `watched_lessons_${currentUser.id}`;
          const stored = localStorage.getItem(key);
          let watchedIds: string[] = stored ? JSON.parse(stored) : [];
          if (!watchedIds.includes(lesson.id)) {
            watchedIds.push(lesson.id);
            localStorage.setItem(key, JSON.stringify(watchedIds));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleBuyCourse = async () => {
    if (!currentUser) {
      alert('请先登录（在首页可以切换/登录用户身份）');
      return;
    }
    if (!course) return;

    setBuying(true);
    try {
      const order = await db.createOrder(currentUser.id, course.id, course.price);
      router.push(`/pay?trade_no=${order.trade_no}`);
    } catch (err) {
      console.error(err);
      alert('创建订单失败');
      setBuying(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa]">
        <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-slate-500 text-xs">正在载入课时...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] text-center px-4">
        <h2 className="text-xl font-bold">课程不存在或已被下架</h2>
        <Link href="/" className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold">
          返回首页
        </Link>
      </div>
    );
  }

  const isVideoUnlocked = hasAccess || currentLesson?.is_free_preview === true;

  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/50 backdrop-blur-md px-4 py-3.5 flex items-center gap-3">
        <Link href="/" className="p-1 rounded-full hover:bg-slate-100 text-slate-505 hover:text-slate-800 transition-all">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-base text-slate-800 truncate">{course.title}</h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full flex flex-col md:grid md:grid-cols-3 gap-6 p-4">
        {/* Left Column: Player & Course Info */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Video Player Box (Retains dark container for screen contrast) */}
          <div className="relative aspect-[16/9] w-full bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
            {isVideoUnlocked ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-center p-4">
                <Film className="h-12 w-12 text-slate-600 mb-3 animate-pulse" />
                <p className="text-slate-200 text-sm font-semibold truncate max-w-xs sm:max-w-md">
                  正在以 HLS 安全模式播放: {currentLesson?.title}
                </p>
                <div className="w-48 bg-slate-850 h-1.5 rounded-full overflow-hidden mt-4">
                  <div className="bg-slate-500 h-full w-1/3 animate-[pulse_1.5s_infinite]"></div>
                </div>
                <span className="text-[11px] text-slate-500 mt-2">（模拟防录屏 HLS 鉴权通过）</span>
              </div>
            ) : (
              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
                <div className="p-3.5 rounded-full bg-white/10 border border-white/20 text-white mb-4 animate-bounce">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">本节课时需购买解锁</h3>
                <p className="text-[13px] text-slate-400 mb-6 max-w-xs leading-relaxed">
                  您目前正在试看或尚未购买该课程。购买后即可解锁全部课时视频，并获得专属学习支持。
                </p>
                <button
                  id="buy-course-btn"
                  onClick={handleBuyCourse}
                  disabled={buying}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold bg-white text-slate-900 hover:bg-slate-100 active:scale-95 transition-all shadow-lg cursor-pointer border-none"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  {buying ? '正在发起支付...' : `立即支付 ¥${Number(course.price).toFixed(2)} 解锁全课`}
                </button>
              </div>
            )}
          </div>

          {/* Course Details Text */}
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="font-bold text-base text-slate-800">课程介绍</h2>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-0.5">
                <Sparkles className="h-3 w-3" />
                精品微课
              </span>
            </div>
            <div 
              className="prose text-sm sm:text-base text-slate-650"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          </div>
        </div>

        {/* Right Column: Syllabus Playlist */}
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-3 h-fit">
          <h2 className="font-semibold text-[13px] text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3 mb-1">
            课程大纲 ({lessons.length} 课时)
          </h2>

          <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
            {lessons.map((lesson) => {
              const isSelected = currentLesson?.id === lesson.id;
              const isUnlocked = hasAccess || lesson.is_free_preview;

              return (
                <button
                  key={lesson.id}
                  id={`lesson-item-${lesson.id}`}
                  onClick={() => handleLessonClick(lesson)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200/80 text-slate-500 hover:bg-slate-50 hover:text-slate-850'
                  }`}
                >
                  <div className="mt-0.5">
                    {isUnlocked ? (
                      isSelected ? (
                        <Play className="h-3.5 w-3.5 fill-slate-800 text-slate-800" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 text-slate-400" />
                      )
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                      {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDuration(lesson.duration)}
                      </span>
                      {lesson.is_free_preview && (
                        <span className="text-blue-600 bg-blue-50 px-1 rounded-sm text-[10px] font-semibold">
                          试看
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {lessons.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-400">
                暂无课时内容
              </div>
            )}
          </div>

          {/* Action Button for Mobile Sticky View */}
          {!hasAccess && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                id="buy-course-sidebar-btn"
                onClick={handleBuyCourse}
                disabled={buying}
                className="w-full flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-900/10 cursor-pointer border-none"
              >
                <CreditCard className="h-3.5 w-3.5" />
                立即支付 ¥{Number(course.price).toFixed(2)} 解锁大纲
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
