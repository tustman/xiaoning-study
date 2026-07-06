'use client';

import React, { useEffect, useState } from 'react';
import { db, Course, Lesson } from '@/lib/db';
import { Plus, Edit2, Trash2, BookOpen, Settings, Save, Check } from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingLessons, setEditingLessons] = useState<Lesson[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'lessons'>('info');

  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [courseCover, setCourseCover] = useState('');
  const [courseStatus, setCourseStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [courseDesc, setCourseDesc] = useState('');

  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonVideo, setLessonVideo] = useState('');
  const [lessonDuration, setLessonDuration] = useState(0);
  const [lessonPreview, setLessonPreview] = useState(false);
  const [lessonOrder, setLessonOrder] = useState(1);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const list = await db.getCourses();
    setCourses(list);
  };

  const handleEditCourseClick = async (course: Course) => {
    setEditingCourse(course);
    setCourseTitle(course.title);
    setCoursePrice(course.price);
    setCourseCover(course.cover_image);
    setCourseStatus(course.status);
    setCourseDesc(course.description);
    setActiveTab('info');

    const l = await db.getLessons(course.id);
    setEditingLessons(l);
    resetLessonForm();
  };

  const handleCreateCourseClick = () => {
    const newId = 'course-' + Date.now();
    const newCourse: Course = {
      id: newId,
      title: '新建优质全栈课程',
      description: '<p>请在此输入详细的课程描述...</p>',
      cover_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
      price: 99.00,
      status: 'draft',
      created_at: new Date().toISOString()
    };
    db.saveCourse(newCourse).then((savedCourse) => {
      loadCourses();
      handleEditCourseClick(savedCourse);
    });
  };

  const handleSaveCourse = async () => {
    if (!editingCourse) return;
    const updated: Course = {
      ...editingCourse,
      title: courseTitle,
      price: coursePrice,
      cover_image: courseCover,
      status: courseStatus,
      description: courseDesc,
    };
    const saved = await db.saveCourse(updated);
    window.showToast?.('课程基础信息保存成功！');
    loadCourses();
    setEditingCourse(saved);
  };

  const handleDeleteCourse = async (id: string) => {
    if (window.showConfirm) {
      window.showConfirm('确定要删除这门课程吗？所有关联课时都将被清空。', async () => {
        await db.deleteCourse(id);
        if (editingCourse?.id === id) {
          setEditingCourse(null);
        }
        loadCourses();
        window.showToast?.('课程已成功删除');
      });
    } else {
      await db.deleteCourse(id);
      if (editingCourse?.id === id) setEditingCourse(null);
      loadCourses();
    }
  };

  const resetLessonForm = () => {
    setLessonTitle('');
    setLessonVideo('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
    setLessonDuration(300);
    setLessonPreview(false);
    setLessonOrder(editingLessons.length + 1);
    setSelectedLessonId(null);
  };

  const handleSaveLesson = async () => {
    if (!editingCourse) return;
    if (!lessonTitle) {
      window.showToast?.('请输入课时名称', 'error');
      return;
    }

    const lessonData: Lesson = {
      id: selectedLessonId || 'lesson-' + Date.now(),
      course_id: editingCourse.id,
      title: lessonTitle,
      video_url: lessonVideo,
      duration: Number(lessonDuration),
      is_free_preview: lessonPreview,
      order_index: Number(lessonOrder),
      created_at: new Date().toISOString()
    };

    await db.saveLesson(lessonData);
    window.showToast?.(selectedLessonId ? '课时编辑成功！' : '课时添加成功！');
    resetLessonForm();
    const l = await db.getLessons(editingCourse.id);
    setEditingLessons(l);
  };

  const handleEditLessonSelect = (lesson: Lesson) => {
    setSelectedLessonId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonVideo(lesson.video_url);
    setLessonDuration(lesson.duration);
    setLessonPreview(lesson.is_free_preview);
    setLessonOrder(lesson.order_index);
  };

  const handleDeleteLesson = async (id: string) => {
    if (window.showConfirm) {
      window.showConfirm('确定要删除这节课时吗？', async () => {
        await db.deleteLesson(id);
        if (editingCourse) {
          const l = await db.getLessons(editingCourse.id);
          setEditingLessons(l);
        }
        resetLessonForm();
        window.showToast?.('课时已成功删除');
      });
    } else {
      await db.deleteLesson(id);
      if (editingCourse) {
        const l = await db.getLessons(editingCourse.id);
        setEditingLessons(l);
      }
      resetLessonForm();
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800">
      {/* Page Title Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-slate-850" />
            课程与课时管理
          </h1>
          <p className="text-xs text-slate-450 mt-1">创建和维护前台展示课程、上传点播地址与管理价格状态</p>
        </div>

        <button
          id="create-course-btn"
          onClick={handleCreateCourseClick}
          className="flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all text-xs font-bold text-white rounded-xl shadow-md shadow-slate-900/10"
        >
          <Plus className="h-4 w-4" />
          创建新课程
        </button>
      </div>

      {/* Main Grid: Course List & Editor Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Course Grid */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h2 className="text-xs uppercase tracking-wider font-extrabold text-slate-400">课程目录 ({courses.length})</h2>
          
          <div className="flex flex-col gap-3">
            {courses.map((course) => {
              const isSelected = editingCourse?.id === course.id;
              return (
                <div
                  key={course.id}
                  id={`admin-course-row-${course.id}`}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-white border-slate-900 text-slate-900 shadow-md'
                      : 'bg-white/60 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex gap-2.5">
                    <img 
                      src={course.cover_image} 
                      alt="" 
                      className="w-16 h-10 object-cover rounded-lg bg-slate-100 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <h3 className="text-xs font-extrabold text-slate-800 truncate leading-snug">{course.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-slate-700">¥{Number(course.price).toFixed(2)}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          course.status === 'published' 
                            ? 'bg-emerald-50 text-emerald-600 bg-emerald-50 border border-emerald-100'
                            : course.status === 'draft'
                            ? 'bg-amber-50 text-amber-600 bg-amber-50 border border-amber-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {course.status === 'published' ? '上架' : course.status === 'draft' ? '草稿' : '下架'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleEditCourseClick(course)}
                      className="p-1.5 rounded-lg bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-slate-350 transition-all text-[10px] font-bold flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      管理课时
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-100 hover:border-rose-250 transition-all text-[10px] font-bold flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      删除
                    </button>
                  </div>
                </div>
              );
            })}

            {courses.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                暂无课程，点击右上角创建。
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Tabbed Form Editor */}
        <div className="lg:col-span-2">
          {editingCourse ? (
            <div className="glass-panel rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-white">
              {/* Tab Selector */}
              <div className="bg-slate-50 border-b border-slate-150 flex">
                <button
                  id="tab-info-btn"
                  onClick={() => setActiveTab('info')}
                  className={`px-5 py-3 text-xs font-black border-b-2 transition-all ${
                    activeTab === 'info'
                      ? 'border-slate-900 text-slate-900 bg-white'
                      : 'border-transparent text-slate-450 hover:text-slate-700'
                  }`}
                >
                  1. 课程基本信息
                </button>
                <button
                  id="tab-lessons-btn"
                  onClick={() => setActiveTab('lessons')}
                  className={`px-5 py-3 text-xs font-black border-b-2 transition-all ${
                    activeTab === 'lessons'
                      ? 'border-slate-900 text-slate-900 bg-white'
                      : 'border-transparent text-slate-450 hover:text-slate-700'
                  }`}
                >
                  2. 课时列表编辑 ({editingLessons.length})
                </button>
              </div>

              {/* Tab 1: Info */}
              {activeTab === 'info' && (
                <div className="p-5 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">课程名称</label>
                      <input
                        type="text"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                        placeholder="请输入课程名称"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">课程价格 (¥)</label>
                      <input
                        type="number"
                        value={coursePrice}
                        onChange={(e) => setCoursePrice(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">封面图 URL</label>
                      <input
                        type="text"
                        value={courseCover}
                        onChange={(e) => setCourseCover(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                        placeholder="https://images.unsplash.com..."
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">上架状态</label>
                      <select
                        value={courseStatus}
                        onChange={(e) => setCourseStatus(e.target.value as any)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                      >
                        <option value="draft">草稿 (前台隐藏)</option>
                        <option value="published">上架 (前台可见)</option>
                        <option value="archived">下架 (前台隐藏)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">课程描述 (富文本/HTML)</label>
                    <textarea
                      rows={8}
                      value={courseDesc}
                      onChange={(e) => setCourseDesc(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-850 font-mono"
                      placeholder="<p>课程详细内容介绍...</p>"
                    />
                  </div>

                  <button
                    id="save-course-details-btn"
                    onClick={handleSaveCourse}
                    className="mt-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white rounded-xl active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/10"
                  >
                    <Save className="h-4 w-4" />
                    保存课程基本信息
                  </button>
                </div>
              )}

              {/* Tab 2: Lessons */}
              {activeTab === 'lessons' && (
                <div className="p-5 flex flex-col gap-6">
                  {/* Lesson Form */}
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col gap-4">
                    <h3 className="text-xs font-black text-slate-800">
                      {selectedLessonId ? '📝 编辑课时' : '➕ 添加新课时'}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">课时名称</label>
                        <input
                          type="text"
                          value={lessonTitle}
                          onChange={(e) => setLessonTitle(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                          placeholder="例如: 01. 课程导学"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">视频播放 URL (HLS / m3u8)</label>
                        <input
                          type="text"
                          value={lessonVideo}
                          onChange={(e) => setLessonVideo(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                          placeholder="https://example.com/hls.m3u8"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">课时时长 (秒)</label>
                        <input
                          type="number"
                          value={lessonDuration}
                          onChange={(e) => setLessonDuration(Number(e.target.value))}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                          placeholder="300"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">排序权重 (Index)</label>
                        <input
                          type="number"
                          value={lessonOrder}
                          onChange={(e) => setLessonOrder(Number(e.target.value))}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                          placeholder="1"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">支持免费试看</label>
                        <select
                          value={lessonPreview ? 'true' : 'false'}
                          onChange={(e) => setLessonPreview(e.target.value === 'true')}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                        >
                          <option value="false">需要购买 (锁标)</option>
                          <option value="true">支持试看 (开锁)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      {selectedLessonId && (
                        <button
                          onClick={resetLessonForm}
                          className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs text-slate-500 hover:text-slate-800"
                        >
                          取消
                        </button>
                      )}
                      <button
                        id="save-lesson-btn"
                        onClick={handleSaveLesson}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1 shadow-xs"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {selectedLessonId ? '确认更新课时' : '确认添加课时'}
                      </button>
                    </div>
                  </div>

                  {/* List of lessons */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">大纲列表 ({editingLessons.length})</h3>
                    
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                      {editingLessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[10px] font-bold text-slate-550 bg-slate-100 px-1.5 py-0.5 rounded">
                              #{lesson.order_index}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-700 truncate">{lesson.title}</p>
                              <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400 font-medium">
                                <span>时长: {Math.floor(lesson.duration / 60)}分钟</span>
                                <span>•</span>
                                <span className={lesson.is_free_preview ? 'text-blue-600' : 'text-slate-450'}>
                                  {lesson.is_free_preview ? '可试看' : '需解锁'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditLessonSelect(lesson)}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-800 transition-all"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="p-1.5 rounded-lg bg-rose-50 border border-rose-100 hover:border-rose-250 text-rose-600 hover:text-rose-700 transition-all"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {editingLessons.length === 0 && (
                        <div className="py-8 text-center text-slate-450 text-xs">
                          当前课程下暂无课时，请在上方添加首个课时。
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-16 rounded-3xl text-center border border-slate-200 flex flex-col items-center justify-center min-h-[450px] bg-white">
              <Settings className="h-8 w-8 text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-400 text-sm">暂未选择管理对象</h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                请在左侧课程列表中选择一个课程进行基本信息和课时明细管理，或者直接点击“创建新课程”。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
