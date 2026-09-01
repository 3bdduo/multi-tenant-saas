"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function PatientInfoButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="secondary" 
        size="lg" 
        onClick={() => setIsOpen(true)}
        className="w-full justify-center text-sm font-semibold hover:border-accent/60"
      >
        كيف أحصل على حساب جديد؟
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in-slow">
          <div 
            className="fixed inset-0" 
            onClick={() => setIsOpen(false)}
          />

          <Card glass vibrant className="relative z-10 w-full max-w-md p-8 border-accent/40 shadow-2xl animate-scale-in-slow">
            <div className="flex flex-col items-center text-center">
              {}
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 text-accent shadow-glow-emerald">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>

              <h3 className="font-display text-2xl font-extrabold text-text-primary mb-3">
                حسابات المرضى
              </h3>

              <p className="text-base leading-relaxed text-text-secondary mb-6 font-medium">
                يتم إنشاء حساب المريض <span className="font-bold text-accent">حصرياً من قبل الطبيب المعالج</span> للحفاظ على سرية وخصوصية سجلاتك الطبية.
              </p>

              <div className="rounded-2xl bg-mint border border-[rgba(20,107,112,0.18)] dark:bg-primary/10 dark:border-primary/20 p-4 mb-6 w-full text-right">
                <p className="text-xs text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">خطوات بسيطة:</strong> تواصل مع طبيبك أو عيادتك المسجلة، وسيتم تزويدك ببيانات الدخول للوصول الفوري لسجلاتك ومواعيدك.
                </p>
              </div>

              <Button 
                variant="primary"
                size="lg"
                onClick={() => setIsOpen(false)}
                className="w-full justify-center text-base font-bold"
              >
                فهمت ذلك
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
