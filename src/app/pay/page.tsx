'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db, Order } from '@/lib/db';
import { CreditCard, CheckCircle, AlertTriangle, QrCode, ShieldCheck, ShoppingBag } from 'lucide-react';

function PayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tradeNo = searchParams.get('trade_no');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<'alipay' | 'wechat'>('alipay');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!tradeNo) {
        setLoading(false);
        return;
      }
      const o = await db.getOrder(tradeNo);
      setOrder(o);
      setLoading(false);
    }
    loadOrder();
  }, [tradeNo]);

  const handleSimulatePayment = async () => {
    if (!order) return;
    setSimulating(true);

    try {
      const res = await fetch('/api/pay/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trade_no: order.trade_no }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentSuccess(true);
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push(`/courses/${order.course_id}`);
        }, 2000);
      } else {
        alert('模拟支付失败: ' + (data.error || '未知错误'));
      }
    } catch (err) {
      console.error(err);
      alert('网络连接错误，无法完成支付模拟');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#09090b]">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-zinc-400 text-xs">正在载入收银台...</p>
      </div>
    );
  }

  if (!tradeNo || !order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#09090b] text-center px-4">
        <AlertTriangle className="h-12 w-12 text-rose-500 mb-3 animate-bounce" />
        <h2 className="text-xl font-bold">订单不存在或格式不正确</h2>
        <Link href="/" className="mt-4 px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg text-sm">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#09090b] min-h-screen items-center justify-center p-4">
      {paymentSuccess ? (
        <div className="glass-panel max-w-sm w-full p-8 rounded-3xl text-center shadow-2xl border border-emerald-500/20">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">支付模拟成功</h2>
          <p className="text-xs text-zinc-400 mb-6">
            订单状态已通过 7pay Webhook 自动更新为「已完成」。正在为您跳转回课时播放页...
          </p>
          <div className="w-24 bg-zinc-800 h-1 rounded-full overflow-hidden mx-auto">
            <div className="bg-emerald-500 h-full w-full animate-[loading_2s_ease-in-out]"></div>
          </div>
        </div>
      ) : (
        <div className="glass-panel max-w-md w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-zinc-850">
          {/* Header */}
          <div className="bg-brand-500/10 p-5 border-b border-zinc-800/60 flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-brand-400" />
            <div>
              <h2 className="font-extrabold text-sm text-white">7pay 极速安全收银台</h2>
              <p className="text-[10px] text-zinc-400 mt-0.5">订单号: {order.trade_no}</p>
            </div>
          </div>

          {/* Details Card */}
          <div className="p-5 flex-1 flex flex-col gap-5">
            <div className="flex justify-between items-center bg-zinc-900/50 border border-zinc-850 p-4 rounded-2xl">
              <div>
                <p className="text-xs text-zinc-400">商品名称</p>
                <h3 className="text-sm font-bold text-white mt-1 line-clamp-1">{order.course_title}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400">应付金额</p>
                <h3 className="text-lg font-black text-brand-400 mt-0.5">¥{Number(order.amount).toFixed(2)}</h3>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-2 gap-3">
              <button
                id="select-alipay-btn"
                onClick={() => setMethod('alipay')}
                className={`py-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  method === 'alipay'
                    ? 'border-sky-500 bg-sky-500/5 text-sky-400'
                    : 'border-zinc-800 bg-zinc-900/20 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                支付宝支付
              </button>
              <button
                id="select-wechat-btn"
                onClick={() => setMethod('wechat')}
                className={`py-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  method === 'wechat'
                    ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400'
                    : 'border-zinc-800 bg-zinc-900/20 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                微信支付
              </button>
            </div>

            {/* Mock QR Code scan section */}
            <div className="flex flex-col items-center justify-center py-6 bg-zinc-950/40 rounded-2xl border border-zinc-850">
              <div className="relative p-4 bg-white rounded-xl mb-3 shadow-inner">
                {/* Visual Representation of QR Code */}
                <div className="w-32 h-32 flex items-center justify-center border border-zinc-200 rounded-lg bg-zinc-50">
                  <QrCode className="h-28 w-28 text-zinc-900" />
                </div>
                {/* Scan Overlay Lines */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-brand-500 animate-[bounce_2s_infinite]"></div>
              </div>
              <p className="text-[10px] text-zinc-500">使用 {method === 'alipay' ? '支付宝' : '微信'} 扫码完成支付</p>
            </div>

            {/* Call to action */}
            <button
              id="simulate-success-btn"
              onClick={handleSimulatePayment}
              disabled={simulating}
              className="w-full py-3.5 rounded-2xl font-black text-sm bg-brand-500 hover:bg-brand-600 active:scale-98 transition-all text-white shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              {simulating ? '正在上报交易流水...' : '我已扫码支付 (模拟支付成功)'}
            </button>
            
            <Link 
              href={`/courses/${order.course_id}`}
              className="text-center text-xs text-zinc-500 hover:text-zinc-400 underline transition-all"
            >
              取消并返回课程
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#09090b]">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-zinc-400 text-xs">正在载入收银台...</p>
      </div>
    }>
      <PayContent />
    </Suspense>
  );
}
