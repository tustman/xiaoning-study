'use client';

import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    showToast?: (message: string, type?: 'success' | 'error') => void;
    showConfirm?: (message: string, onConfirm: () => void) => void;
  }
}

export default function ClientToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmData, setConfirmData] = useState<{ message: string; onConfirm: () => void } | null>(null);

  useEffect(() => {
    window.showToast = (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
    };

    window.showConfirm = (message: string, onConfirm: () => void) => {
      setConfirmData({ message, onConfirm });
    };

    return () => {
      delete window.showToast;
      delete window.showConfirm;
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <>
      {children}

      {/* Sleek Custom Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border text-xs font-bold shadow-lg transition-all animate-slide-in flex items-center gap-2 ${
          toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
            : 'bg-rose-50 border-rose-100 text-rose-600'
        }`}>
          <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sleek Custom Confirmation Modal */}
      {confirmData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm overflow-hidden shadow-2xl flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-slate-800">操作确认</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{confirmData.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmData(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  confirmData.onConfirm();
                  setConfirmData(null);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
