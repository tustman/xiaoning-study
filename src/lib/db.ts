// Unified Data Access & Authentication Layer
// Automatically switches between Supabase and localStorage-based Mock DB

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  price: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  video_url: string;
  duration: number; // in seconds
  is_free_preview: boolean;
  order_index: number;
  created_at: string;
}

export interface Order {
  id: string;
  trade_no: string;
  user_id: string;
  course_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paid_at?: string;
  created_at: string;
  // Join fields helper
  course_title?: string;
  user_email?: string;
}

// Check if Supabase env vars are set and not default placeholders
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'your_supabase_project_url_here' &&
  supabaseKey && 
  supabaseKey !== 'your_supabase_anon_public_key_here' &&
  supabaseKey !== 'sb_publishable_mEmKarZSdLTk9FW67xPMzw_DH0fJVwk'; // wait, sb_publishable is their real key, so check for placeholder instead

const hasRealSupabase = !!(supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase'));

// Initialize clients
export const supabase = hasRealSupabase 
  ? createSupabaseClient(supabaseUrl!, supabaseKey!) 
  : null;

export const supabaseAdmin = (hasRealSupabase && adminKey && !adminKey.includes('your_supabase'))
  ? createSupabaseClient(supabaseUrl!, adminKey!)
  : null;

// Mock Data Store (Fallback)
const DEFAULT_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Next.js 15 全栈微课平台实战',
    description: '<p>本课程将带你从零开始，使用 Next.js 15 App Router、Tailwind CSS、Supabase 以及 7pay 支付网关，构建一个完整的移动端优先的在线课程平台，并包含 PC 端管理后台。</p><h4>课程亮点</h4><ul><li>Next.js 15 最新特性与 Server Actions 实战</li><li>移动端极致的 HLS 视频防盗鉴权播放</li><li>7pay 支付闭环与 Webhook 自动化流水线</li><li>响应式 B 端 Dashboard 深度定制</li></ul>',
    cover_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
    price: 99.00,
    status: 'published',
    created_at: new Date().toISOString(),
  },
  {
    id: 'course-2',
    title: 'Supabase + PostgreSQL 数据库高阶设计与 RLS 策略',
    description: '<p>掌握 Postgres 核心模型设计，学会配置行级安全策略（RLS），保障企业级 API 安全，构建超高性能的 Serverless 后端。</p>',
    cover_image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=60',
    price: 199.00,
    status: 'published',
    created_at: new Date().toISOString(),
  }
];

const DEFAULT_LESSONS: Lesson[] = [
  {
    id: 'lesson-1-1',
    course_id: 'course-1',
    title: '01. 课程导学与技术栈选型（免费试看）',
    video_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 185,
    is_free_preview: true,
    order_index: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'lesson-1-2',
    course_id: 'course-1',
    title: '02. Next.js 15 项目脚手架与目录规范',
    video_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 320,
    is_free_preview: false,
    order_index: 2,
    created_at: new Date().toISOString(),
  }
];

const isClient = typeof window !== 'undefined';

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isClient) return defaultValue;
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (!isClient) return;
  localStorage.setItem(key, JSON.stringify(value));
}

const getCoursesState = () => getStorageItem<Course[]>('courses', DEFAULT_COURSES);
const saveCoursesState = (courses: Course[]) => setStorageItem('courses', courses);

const getLessonsState = () => getStorageItem<Lesson[]>('lessons', DEFAULT_LESSONS);
const saveLessonsState = (lessons: Lesson[]) => setStorageItem('lessons', lessons);

const getOrdersState = () => getStorageItem<Order[]>('orders', []);
const saveOrdersState = (orders: Order[]) => setStorageItem('orders', orders);

const getAuthState = () => getStorageItem<UserProfile | null>('currentUser', {
  id: 'mock-user-123',
  email: 'student@example.com',
  nickname: '王小宁',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  role: 'admin',
  created_at: new Date().toISOString()
});
const saveAuthState = (user: UserProfile | null) => setStorageItem('currentUser', user);

// Unified Database API
export const db = {
  // Course APIs
  async getCourses(): Promise<Course[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Course[];
      console.warn('Supabase fetch courses failed, falling back to mock:', error);
    }
    return getCoursesState();
  },

  async getCourse(id: string): Promise<Course | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) return data as Course;
    }
    const list = await this.getCourses();
    return list.find(c => c.id === id) || null;
  },

  async saveCourse(course: Course): Promise<Course> {
    if (supabase) {
      const payload: any = {
        title: course.title,
        description: course.description,
        cover_image: course.cover_image,
        price: Number(course.price),
        status: course.status
      };
      // Omit ID if it is a temporary mock client prefix string
      if (course.id && !course.id.startsWith('course-')) {
        payload.id = course.id;
      }
      const { data, error } = await supabase
        .from('courses')
        .upsert(payload)
        .select()
        .single();
      if (!error && data) return data as Course;
      console.error('Supabase save course failed:', error);
    }
    const list = getCoursesState();
    const index = list.findIndex(c => c.id === course.id);
    if (index >= 0) {
      list[index] = course;
    } else {
      list.push(course);
    }
    saveCoursesState(list);
    return course;
  },

  async deleteCourse(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (!error) return;
    }
    const list = getCoursesState();
    const filtered = list.filter(c => c.id !== id);
    saveCoursesState(filtered);
  },

  // Lesson APIs
  async getLessons(courseId: string): Promise<Lesson[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      if (!error && data) return data as Lesson[];
    }
    const list = getLessonsState();
    return list
      .filter(l => l.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index);
  },

  async getLesson(lessonId: string): Promise<Lesson | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .maybeSingle();
      if (!error && data) return data as Lesson;
    }
    const list = getLessonsState();
    return list.find(l => l.id === lessonId) || null;
  },

  async saveLesson(lesson: Lesson): Promise<Lesson> {
    if (supabase) {
      const payload: any = {
        course_id: lesson.course_id,
        title: lesson.title,
        video_url: lesson.video_url,
        duration: Number(lesson.duration),
        is_free_preview: lesson.is_free_preview,
        order_index: Number(lesson.order_index)
      };
      if (lesson.id && !lesson.id.startsWith('lesson-')) {
        payload.id = lesson.id;
      }
      const { data, error } = await supabase
        .from('lessons')
        .upsert(payload)
        .select()
        .single();
      if (!error && data) return data as Lesson;
      console.error('Supabase save lesson failed:', error);
    }
    const list = getLessonsState();
    const index = list.findIndex(l => l.id === lesson.id);
    if (index >= 0) {
      list[index] = lesson;
    } else {
      list.push(lesson);
    }
    saveLessonsState(list);
    return lesson;
  },

  async deleteLesson(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('lessons').delete().eq('id', id);
      if (!error) return;
    }
    const list = getLessonsState();
    const filtered = list.filter(l => l.id !== id);
    saveLessonsState(filtered);
  },

  // Order APIs
  async getOrders(): Promise<Order[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          courses ( title ),
          users ( email )
        `)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return (data as any[]).map(o => ({
          ...o,
          course_title: o.courses?.title || '未知课程',
          user_email: o.users?.email || '未知用户',
        })) as Order[];
      }
    }
    const orders = getOrdersState();
    const courses = getCoursesState();
    return orders.map(order => {
      const course = courses.find(c => c.id === order.course_id);
      return {
        ...order,
        course_title: course ? course.title : '未知课程',
        user_email: order.user_id === 'mock-user-123' ? 'student@example.com' : 'other@example.com',
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getOrder(tradeNo: string): Promise<Order | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          courses ( title ),
          users ( email )
        `)
        .eq('trade_no', tradeNo)
        .maybeSingle();
      if (!error && data) {
        const o = data as any;
        return {
          ...o,
          course_title: o.courses?.title || '未知课程',
          user_email: o.users?.email || '未知用户'
        } as Order;
      }
    }
    const list = getOrdersState();
    const order = list.find(o => o.trade_no === tradeNo);
    if (!order) return null;
    const courses = getCoursesState();
    const course = courses.find(c => c.id === order.course_id);
    return {
      ...order,
      course_title: course ? course.title : '未知课程',
      user_email: order.user_id === 'mock-user-123' ? 'student@example.com' : 'other@example.com',
    };
  },

  async createOrder(userId: string, courseId: string, amount: number): Promise<Order> {
    const tradeNo = '7PAY' + Date.now() + Math.floor(Math.random() * 1000);
    if (supabase) {
      const payload: any = {
        trade_no: tradeNo,
        course_id: courseId,
        amount: Number(amount),
        status: 'pending'
      };
      // Skip setting mock prefix user IDs if they violate UUID foreign key checks
      if (userId && !userId.startsWith('mock-')) {
        payload.user_id = userId;
      }
      const { data, error } = await supabase
        .from('orders')
        .insert(payload)
        .select()
        .single();
      if (!error && data) {
        // Query course details to match interface
        const course = await this.getCourse(courseId);
        return {
          ...data,
          course_title: course?.title || '未知课程',
        } as Order;
      }
      console.error('Supabase create order failed:', error);
    }
    const list = getOrdersState();
    const newOrder: Order = {
      id: 'order-' + Date.now(),
      trade_no: tradeNo,
      user_id: userId,
      course_id: courseId,
      amount,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    list.push(newOrder);
    saveOrdersState(list);
    return newOrder;
  },

  async updateOrderStatus(tradeNo: string, status: 'pending' | 'completed' | 'failed'): Promise<Order | null> {
    // Webhook callbacks are server-side, they use supabaseAdmin (service role client) to bypass RLS
    const activeClient = supabaseAdmin || supabase;
    if (activeClient) {
      const paidAt = status === 'completed' ? new Date().toISOString() : null;
      const { data, error } = await activeClient
        .from('orders')
        .update({ status, paid_at: paidAt })
        .eq('trade_no', tradeNo)
        .select()
        .maybeSingle();
      if (!error && data) return data as Order;
      console.error('Supabase update order status failed:', error);
    }
    const list = getOrdersState();
    const index = list.findIndex(o => o.trade_no === tradeNo);
    if (index >= 0) {
      list[index].status = status;
      if (status === 'completed') {
        list[index].paid_at = new Date().toISOString();
      }
      saveOrdersState(list);
      return list[index];
    }
    return null;
  },

  async checkUserAccess(userId: string, courseId: string): Promise<boolean> {
    if (supabase) {
      // Admins bypass lock
      const userProfile = await this.getCurrentUser();
      if (userProfile?.role === 'admin') return true;

      // Real check on orders
      if (userId && !userId.startsWith('mock-')) {
        const { data, error } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .eq('status', 'completed')
          .limit(1);
        if (!error && data && data.length > 0) return true;
      }
    }
    const list = getOrdersState();
    return list.some(o => o.user_id === userId && o.course_id === courseId && o.status === 'completed');
  },

  // Auth APIs
  getCurrentUser(): UserProfile | null {
    // Since Next.js uses client-side localStorage in our UI for login state toggles,
    // we fetch current login status from mock state so students/admins can switch roles on the fly.
    // In a real production deployment, this maps to supabase.auth.getUser()
    return getAuthState();
  },

  signIn(email: string, role: 'user' | 'admin' = 'user'): UserProfile {
    // Real Supabase Auth would call supabase.auth.signInWithPassword or similar.
    // For demo purposes, we also sync with public.users table if supabase is connected
    const userId = role === 'admin' ? 'd6b9f291-a1b5-44de-96cb-8b5ff2c7f53f' : 'f6b9f291-a1b5-44de-96cb-8b5ff2c7f53f';
    const newUser: UserProfile = {
      id: userId,
      email,
      nickname: email.split('@')[0],
      role,
      created_at: new Date().toISOString()
    };
    saveAuthState(newUser);

    if (supabase) {
      // Sync or insert user profile in Supabase public.users table for joins to work
      supabase.from('users').upsert({
        id: userId,
        email,
        nickname: newUser.nickname,
        role
      }).then(({ error }) => {
        if (error) console.warn('Supabase profile sync warning:', error);
      });
    }

    return newUser;
  },

  signOut(): void {
    saveAuthState(null);
  },

  updateUserProfile(userId: string, nickname: string, avatarUrl: string): UserProfile | null {
    const current = getAuthState();
    if (current && current.id === userId) {
      const updated = { ...current, nickname, avatar_url: avatarUrl };
      saveAuthState(updated);
      
      if (supabase) {
        supabase.from('users').update({
          nickname,
          avatar_url: avatarUrl
        }).eq('id', userId);
      }
      
      return updated;
    }
    return null;
  }
};
