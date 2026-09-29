/**
 * Idle, concurrency-limited background prefetch queue.
 *
 * قبل كده GlobalPreloader كان بينادي كل الـ prefetchApi() calls مرة واحدة فور معرفة
 * الـ role، وده بالظبط اللي طلب صاحب المشروع تجنبه (استدعاء كل الـ APIs عند الدخول
 * بيحمّل السيرفر مع أي زيادة في المستخدمين). دلوقتي: بنجدول الشغل وقت الخمول
 * (requestIdleCallback) وبحد أقصى 3 طلبات متزامنة.
 */
type Task = () => Promise<unknown>;

function whenIdle(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    if (ric) {
      ric(() => resolve(), { timeout: 2000 });
    } else {
      // Safari / older browsers: قريب من نفس الفكرة
      setTimeout(resolve, 300);
    }
  });
}

export async function runIdlePrefetch(tasks: Task[], concurrency = 3) {
  if (typeof window === "undefined" || tasks.length === 0) return;
  await whenIdle();

  let cursor = 0;
  async function worker() {
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      try {
        await task();
      } catch {
        // ignore: prefetch failures should never surface to the user
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, worker),
  );
}
