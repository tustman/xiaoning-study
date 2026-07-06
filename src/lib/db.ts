// Unified Data Access & Authentication Layer
// Automatically switches between Supabase and localStorage-based Mock DB

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

// Check if Supabase env vars are set
const hasSupabase = 
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mock Data Store
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
  },
  {
    id: 'course-3',
    title: 'React Server Components 与服务端渲染性能优化 (草稿)',
    description: '<p>深入 RSC 架构底层，搞懂 Hydration 机制，利用 Streaming 解决首屏白屏焦虑。</p>',
    cover_image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
    price: 149.00,
    status: 'draft',
    created_at: new Date().toISOString(),
  }
];

const DEFAULT_LESSONS: Lesson[] = [
  // Course 1 lessons
  {
    id: 'lesson-1-1',
    course_id: 'course-1',
    title: '01. 课程导学与技术栈选型（免费试看）',
    video_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // HLS stream
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
  },
  {
    id: 'lesson-1-3',
    course_id: 'course-1',
    title: '03. Supabase 数据表设计与 RLS 授权',
    video_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 540,
    is_free_preview: false,
    order_index: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'lesson-1-4',
    course_id: 'course-1',
    title: '04. 7pay 支付网关接入与订单生成',
    video_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 410,
    is_free_preview: false,
    order_index: 4,
    created_at: new Date().toISOString(),
  },
  // Course 2 lessons
  {
    id: 'lesson-2-1',
    course_id: 'course-2',
    title: '01. PostgreSQL 核心特性与表关联设计',
    video_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 290,
    is_free_preview: true,
    order_index: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'lesson-2-2',
    course_id: 'course-2',
    title: '02. 什么是行级安全策略（RLS）？',
    video_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 480,
    is_free_preview: false,
    order_index: 2,
    created_at: new Date().toISOString(),
  }
];

// Helper to get/set localStorage items in client side
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

// DB state initialized on client side
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
  role: 'admin', // default to admin for ease of testing both roles in dev
  created_at: new Date().toISOString()
});
const saveAuthState = (user: UserProfile | null) => setStorageItem('currentUser', user);

// Unified Database API
export const db = {
  // Course APIs
  async getCourses(): Promise<Course[]> {
    if (hasSupabase) {
      // Supabase query would go here, return mock as fallback if query fails or env is not loaded
    }
    return getCoursesState();
  },

  async getCourse(id: string): Promise<Course | null> {
    const list = await this.getCourses();
    return list.find(c => c.id === id) || null;
  },

  async saveCourse(course: Course): Promise<Course> {
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
    const list = getCoursesState();
    const filtered = list.filter(c => c.id !== id);
    saveCoursesState(filtered);
  },

  // Lesson APIs
  async getLessons(courseId: string): Promise<Lesson[]> {
    const list = getLessonsState();
    return list
      .filter(l => l.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index);
  },

  async getLesson(lessonId: string): Promise<Lesson | null> {
    const list = getLessonsState();
    return list.find(l => l.id === lessonId) || null;
  },

  async saveLesson(lesson: Lesson): Promise<Lesson> {
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
    const list = getLessonsState();
    const filtered = list.filter(l => l.id !== id);
    saveLessonsState(filtered);
  },

  // Order APIs
  async getOrders(): Promise<Order[]> {
    const orders = getOrdersState();
    const courses = getCoursesState();
    // mock join table
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
    const list = getOrdersState();
    const tradeNo = '7PAY' + Date.now() + Math.floor(Math.random() * 1000);
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
    const list = getOrdersState();
    return list.some(o => o.user_id === userId && o.course_id === courseId && o.status === 'completed');
  },

  // Auth APIs
  getCurrentUser(): UserProfile | null {
    return getAuthState();
  },

  signIn(email: string, role: 'user' | 'admin' = 'user'): UserProfile {
    const newUser: UserProfile = {
      id: 'mock-user-123',
      email,
      nickname: email.split('@')[0],
      role,
      created_at: new Date().toISOString()
    };
    saveAuthState(newUser);
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
      return updated;
    }
    return null;
  }
};
