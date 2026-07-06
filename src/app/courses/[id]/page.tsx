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
      }

      if (u) {
        // Admin always has access
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
      // Redirect to simulated payment page
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
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#09090b]">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-zinc-400 text-xs">正在载入课时...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#09090b] text-center px-4">
        <h2 className="text-xl font-bold">课程不存在或已被下架</h2>
        <Link href="/" className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-semibold">
          返回首页
        </Link>
      </div>
    );
  }

  // Active video has access if:
  // 1. User has full access to the course, OR
  // 2. Active lesson is marked as is_free_preview
  const isVideoUnlocked = hasAccess || currentLesson?.is_free_preview === true;

  return (
    <div className="flex-1 flex flex-col bg-[#09090b] min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full glass-panel border-b border-zinc-800/40 backdrop-blur-md px-4 py-3 flex items-center gap-3">
        <Link href="/" className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-sm sm:text-base text-zinc-100 truncate">{course.title}</h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full flex flex-col md:grid md:grid-cols-3 gap-6 p-4">
        {/* Left Column: Player & Course Info */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Simulated HLS Video Player / Lock Shield */}
          <div className="relative aspect-[16/9] w-full bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
            {isVideoUnlocked ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-center p-4">
                {/* Simulated video playback area */}
                <Film className="h-12 w-12 text-brand-500/50 mb-3 animate-pulse" />
                <p className="text-zinc-200 text-sm font-bold truncate max-w-xs sm:max-w-md">
                  正在以 HLS 安全模式播放: {currentLesson?.title}
                </p>
                <div className="w-48 bg-zinc-850 h-1.5 rounded-full overflow-hidden mt-4">
                  <div className="bg-brand-500 h-full w-1/3 animate-[pulse_1.5s_infinite]"></div>
                </div>
                <span className="text-[10px] text-zinc-500 mt-2">（模拟防录屏 HLS 鉴权通过）</span>
              </div>
            ) : (
              <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <div className="p-4 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 mb-4 animate-bounce">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">本节课时需购买解锁</h3>
                <p className="text-xs text-zinc-400 mb-6 max-w-sm">
                  您目前正在试看或尚未购买该课程。购买后即可解锁全部课时视频，并获得专属学习支持。
                </p>
                <button
                  id="buy-course-btn"
                  onClick={handleBuyCourse}
                  disabled={buying}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-black bg-brand-500 text-white hover:bg-brand-600 active:scale-95 transition-all shadow-lg shadow-brand-500/25 disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4" />
                  {buying ? '正在发起支付...' : `立即支付 ¥${Number(course.price).toFixed(2)} 解锁全课`}
                </button>
              </div>
            )}
          </div>

          {/* Course Details Text */}
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
              <h2 className="font-extrabold text-base text-white">课程介绍</h2>
              <span className="text-xs font-semibold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                精品微课
              </span>
            </div>
            <div 
              className="prose text-sm text-zinc-300"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          </div>
        </div>

        {/* Right Column: Syllabus Playlist */}
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-3 h-fit">
          <h2 className="font-extrabold text-sm text-zinc-200 uppercase tracking-widest border-b border-zinc-800/80 pb-3 mb-1">
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
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-brand-500/10 border-brand-500 text-white shadow-md'
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`}
                >
                  <div className="mt-0.5">
                    {isUnlocked ? (
                      isSelected ? (
                        <Play className="h-3.5 w-3.5 fill-brand-400 text-brand-400" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 text-zinc-500" />
                      )
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-zinc-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate leading-tight ${isSelected ? 'text-brand-400' : 'text-zinc-200'}`}>
                      {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500">
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDuration(lesson.duration)}
                      </span>
                      {lesson.is_free_preview && (
                        <span className="text-brand-400 bg-brand-500/10 px-1 rounded-sm text-[9px] font-semibold">
                          试看
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {lessons.length === 0 && (
              <div className="py-8 text-center text-xs text-zinc-500">
                暂无课时内容
              </div>
            )}
          </div>

          {/* Action Button for Mobile Sticky View */}
          {!hasAccess && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <button
                id="buy-course-sidebar-btn"
                onClick={handleBuyCourse}
                disabled={buying}
                className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold bg-brand-500 text-white hover:bg-brand-600 active:scale-95 transition-all shadow-lg shadow-brand-500/25"
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
