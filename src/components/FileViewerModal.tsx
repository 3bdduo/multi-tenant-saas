"use client";

import { useState, useEffect } from "react";

interface FileViewerModalProps {
  file: {
    url: string;
    name?: string;
    date?: string;
    subtitle?: string;
  } | null;
  onClose: () => void;
}

export function FileViewerModal({ file, onClose }: FileViewerModalProps) {
  const [zoom, setZoom] = useState(1);

  // Reset zoom whenever file changes
  useEffect(() => {
    setZoom(1);
  }, [file?.url]);

  // Handle ESC key
  useEffect(() => {
    if (!file) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [file, onClose]);

  if (!file) return null;

  const isImage = file.url.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)(\?.*)?$/i) || file.url.includes("image");

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Main Modal Frame */}
      <div
        className="relative w-full max-w-5xl max-h-[95vh] flex flex-col rounded-2xl sm:rounded-3xl bg-surface border border-border/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Logos & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-border/60 bg-surface-raised/90 shrink-0">
          {/* Brand Logos: ARC + Nabd */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* ARC Logo */}
            <div className="flex items-center gap-2">
              <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full overflow-hidden border border-border/80 shadow-md bg-black/40">
                <img
                  src="/logo/arc-logo.jpg"
                  alt="ARC Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-display font-extrabold text-sm text-text-primary tracking-wide hidden sm:inline">
                ARC
              </span>
            </div>

            <div className="w-px h-6 bg-border/60"></div>

            {/* Nabd Logo */}
            <div className="flex items-center gap-2">
              <img
                src="/images/nabd-logo.jpeg"
                alt="شعار نبض"
                className="h-8 sm:h-9 w-auto rounded-lg object-cover shadow-sm border border-border/40"
              />
            </div>
          </div>

          {/* Document Title / Details */}
          <div className="hidden md:flex flex-col items-center">
            <span className="text-xs font-extrabold text-text-primary max-w-xs truncate">
              {file.name || "معاينة المستند الطبي"}
            </span>
            {file.date && (
              <span className="text-[10px] text-text-secondary font-medium">
                تاريخ الرفع: {file.date}
              </span>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Image Zoom Controls */}
            {isImage && (
              <div className="flex items-center bg-surface border border-border/60 rounded-xl p-0.5 shadow-sm text-xs font-bold">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="تكبير"
                  className="p-1.5 hover:bg-surface-raised text-text-secondary hover:text-text-primary rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="إعادة ضبط الحجم"
                  className="px-2 py-1 text-[11px] text-text-secondary hover:text-text-primary transition-colors"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="تصغير"
                  className="p-1.5 hover:bg-surface-raised text-text-secondary hover:text-text-primary rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </button>
              </div>
            )}

            {/* Open in New Window */}
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              title="فتح الملف في نافذة منفصلة"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/70 bg-surface text-xs font-bold text-text-primary hover:text-primary hover:border-primary/50 shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden sm:inline">نافذة جديدة</span>
            </a>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              title="إغلاق النافذة (Esc)"
              className="p-1.5 sm:p-2 rounded-xl bg-surface border border-border/70 text-text-secondary hover:text-danger hover:bg-danger/10 hover:border-danger/30 shadow-sm transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Viewer Canvas */}
        <div className="relative flex-1 overflow-auto p-4 sm:p-6 bg-[#090C16] flex items-center justify-center min-h-[55vh] max-h-[75vh]">
          {isImage ? (
            <div className="overflow-auto max-w-full max-h-full flex items-center justify-center p-2">
              <img
                src={file.url}
                alt={file.name || "مستند طبي"}
                style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                className="max-w-full max-h-[68vh] object-contain rounded-xl shadow-2xl transition-transform duration-200 ease-out border border-white/10 bg-white"
              />
            </div>
          ) : (
            <iframe
              src={file.url}
              className="w-full h-[68vh] rounded-xl border border-white/10 shadow-2xl bg-white"
              title={file.name || "عارض المستندات"}
            />
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-surface-raised border-t border-border/50 flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-success"></span>
            <span className="truncate">{file.name || "مستند طبي معتمد"}</span>
            {file.subtitle && <span className="text-text-muted">({file.subtitle})</span>}
          </div>
          <span className="text-[11px] shrink-0 font-medium">
            منظومة نبض الطبية - مجتمع ARC
          </span>
        </div>
      </div>
    </div>
  );
}
