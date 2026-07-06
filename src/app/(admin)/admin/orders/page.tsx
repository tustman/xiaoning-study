'use client';

import React, { useEffect, useState } from 'react';
import { db, Order } from '@/lib/db';
import { Receipt, Search, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const list = await db.getOrders();
    setOrders(list);
    setFilteredOrders(list);
    setLoading(false);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
    } else {
      const q = searchQuery.toLowerCase().trim();
      const filtered = orders.filter(
        (o) =>
          o.trade_no.toLowerCase().includes(q) ||
          o.course_title?.toLowerCase().includes(q) ||
          o.user_email?.toLowerCase().includes(q)
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  const handleManualComplete = async (tradeNo: string) => {
    if (confirm(`您确定要为订单 ${tradeNo} 执行「手动补单」操作吗？该操作将直接把订单标记为「已完成」并开通课程权限。`)) {
      const result = await db.updateOrderStatus(tradeNo, 'completed');
      if (result) {
        alert('补单操作成功，课程权限已开通！');
        loadOrders();
      } else {
        alert('补单失败，请检查订单是否存在。');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Receipt className="h-5 w-5 text-brand-500" />
            交易订单管理
          </h1>
          <p className="text-xs text-zinc-500 mt-1">查看全局交易流水流水，追踪支付状态及提供客服手动补单支持</p>
        </div>

        <button
          onClick={loadOrders}
          className="p-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative w-full max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
          <Search className="h-4 w-4" />
        </span>
        <input
          id="order-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="按照订单号 / 课程标题 / 用户邮箱搜索..."
          className="w-full bg-zinc-950/70 border border-zinc-900/80 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-500 placeholder-zinc-650"
        />
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-zinc-900 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-900">
                <th className="p-4">创建时间</th>
                <th className="p-4">业务订单号</th>
                <th className="p-4">购买用户</th>
                <th className="p-4">课程项目</th>
                <th className="p-4">金额</th>
                <th className="p-4 text-center">支付状态</th>
                <th className="p-4 text-right">管理操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60 text-xs">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-900/20 text-zinc-300">
                  <td className="p-4 whitespace-nowrap text-[10px] text-zinc-500">
                    {new Date(order.created_at).toLocaleString('zh-CN')}
                  </td>
                  <td className="p-4 font-mono text-[10px] text-zinc-200">{order.trade_no}</td>
                  <td className="p-4 max-w-[120px] truncate text-zinc-400">{order.user_email}</td>
                  <td className="p-4 font-bold text-zinc-200 max-w-[180px] truncate">{order.course_title}</td>
                  <td className="p-4 font-extrabold text-brand-400">¥{Number(order.amount).toFixed(2)}</td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      order.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : order.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {order.status === 'completed' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          已支付
                        </>
                      ) : order.status === 'pending' ? (
                        <>
                          <AlertCircle className="h-3 w-3 animate-spin-slow" />
                          待支付
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          已关闭
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    {order.status === 'pending' ? (
                      <button
                        onClick={() => handleManualComplete(order.trade_no)}
                        className="px-2.5 py-1 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-400 hover:text-brand-300 rounded-lg text-[10px] font-extrabold transition-all active:scale-95"
                      >
                        手动补单
                      </button>
                    ) : (
                      <span className="text-[10px] text-zinc-600 font-medium">无需操作</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-zinc-650 text-xs">
                    {loading ? '正在查询交易流水...' : '没有找到匹配的交易记录'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
