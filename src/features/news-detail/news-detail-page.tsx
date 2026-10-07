"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X, Loader2, Newspaper } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { ContactFab } from "@/components/shared/contact-fab";
import { Footer } from "@/components/shared/footer";
import { getNewsPostById, type NewsPost, type NewsImage } from "@/features/news/actions";

export default function NewsDetailPage({ id }: { id: number }) {
  const router = useRouter();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    getNewsPostById(id)
      .then((res) => { if (res.success) setPost(res.post); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const imageUrls = post?.images.map((img) => `/api/news-images/${img.storedName}`) ?? [];

  const handlePrev = () => setLightboxIndex((i) => (i === 0 ? imageUrls.length - 1 : i - 1));
  const handleNext = () => setLightboxIndex((i) => (i === imageUrls.length - 1 ? 0 : i + 1));

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, imageUrls.length]);

  const formattedDate = post
    ? new Date(post.publishedAt).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 font-prompt">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-24">
        <button
          onClick={() => router.push("/news")}
          className="inline-flex items-center gap-1.5 mb-6 text-sm font-semibold text-slate-500 dark:text-zinc-400 hover:text-[#0b52a7] dark:hover:text-blue-400 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับหน้าข่าวสารทั้งหมด
        </button>

        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="h-7 w-7 animate-spin text-[#0b52a7]" />
          </div>
        ) : !post ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="p-4 bg-slate-100 dark:bg-zinc-800 text-slate-400">
              <Newspaper className="h-10 w-10" />
            </div>
            <p className="text-slate-500 font-semibold">ไม่พบข่าวสารที่ต้องการ</p>
            <button
              onClick={() => router.push("/news")}
              className="text-sm font-bold text-[#0b52a7] dark:text-blue-400 hover:underline cursor-pointer"
            >
              กลับหน้าข่าวสาร
            </button>
          </div>
        ) : (
          <article className="space-y-6">
            {/* Article meta */}
            <div className="border-l-4 border-[#0b52a7] pl-4 py-1">
              <span className="inline-block bg-[#0b52a7] text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wide mb-2">
                {post.newsType}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-snug">
                {post.title}
              </h2>
              <p className="text-sm text-slate-400 dark:text-zinc-500 mt-2">{formattedDate}</p>
            </div>

            {/* Images */}
            {post.images.length > 0 && (
              <PostImagesCollage
                images={post.images}
                onImageClick={(idx) => { setLightboxIndex(idx); setLightboxOpen(true); }}
              />
            )}

            {/* Content */}
            <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6">
              <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
            </div>

            {/* Back link */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => router.push("/news")}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0b52a7] dark:text-blue-400 hover:underline cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                กลับหน้าข่าวสารทั้งหมด
              </button>
            </div>
          </article>
        )}
      </main>

      <Footer />
      <ContactFab />

      <Lightbox
        isOpen={lightboxOpen}
        images={imageUrls}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}

function PostImagesCollage({
  images,
  onImageClick,
}: {
  images: NewsImage[];
  onImageClick: (idx: number) => void;
}) {
  const count = images.length;

  if (count === 1) {
    return (
      <div
        onClick={() => onImageClick(0)}
        className="relative w-full overflow-hidden cursor-pointer border border-slate-200 dark:border-zinc-800 max-h-[480px] flex items-center justify-center bg-slate-100 dark:bg-zinc-900"
      >
        <img
          src={`/api/news-images/${images[0].storedName}`}
          alt="ภาพประกอบ"
          className="w-full h-auto max-h-[480px] object-contain hover:opacity-95 transition-opacity"
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1.5 overflow-hidden border border-slate-200 dark:border-zinc-800 aspect-[2/1]">
        {images.map((img, idx) => (
          <div
            key={img.storedName}
            onClick={() => onImageClick(idx)}
            className="cursor-pointer bg-slate-100 dark:bg-zinc-900 overflow-hidden"
          >
            <img
              src={`/api/news-images/${img.storedName}`}
              alt="ภาพประกอบ"
              className="object-cover w-full h-full hover:opacity-95 transition-opacity"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 overflow-hidden border border-slate-200 dark:border-zinc-800 aspect-[3/2]">
      <div onClick={() => onImageClick(0)} className="col-span-2 cursor-pointer bg-slate-100 dark:bg-zinc-900 overflow-hidden">
        <img src={`/api/news-images/${images[0].storedName}`} alt="ภาพประกอบ" className="object-cover w-full h-full hover:opacity-95 transition-opacity" />
      </div>
      <div className="col-span-1 grid grid-rows-2 gap-1.5">
        <div onClick={() => onImageClick(1)} className="cursor-pointer bg-slate-100 dark:bg-zinc-900 overflow-hidden">
          <img src={`/api/news-images/${images[1].storedName}`} alt="ภาพประกอบ" className="object-cover w-full h-full hover:opacity-95 transition-opacity" />
        </div>
        <div onClick={() => onImageClick(2)} className="relative cursor-pointer bg-slate-100 dark:bg-zinc-900 overflow-hidden">
          <img src={`/api/news-images/${images[2].storedName}`} alt="ภาพประกอบ" className="object-cover w-full h-full hover:opacity-95 transition-opacity" />
          {count > 3 && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white font-bold text-sm font-prompt">
              +{count - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Lightbox({
  isOpen, images, currentIndex, onClose, onPrev, onNext,
}: {
  isOpen: boolean; images: string[]; currentIndex: number;
  onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center cursor-zoom-out">
      <div onClick={(e) => e.stopPropagation()} className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-10 bg-gradient-to-b from-black/50 to-transparent">
        <span className="text-xs font-semibold font-prompt">{currentIndex + 1} / {images.length}</span>
        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-all">
          <X className="h-5 w-5" />
        </button>
      </div>
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white cursor-pointer z-10 transition-all">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white cursor-pointer z-10 transition-all">
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      <div onClick={(e) => e.stopPropagation()} className="max-w-4xl max-h-[80vh] px-4 flex items-center justify-center overflow-hidden cursor-default">
        <img src={images[currentIndex]} alt={`ภาพที่ ${currentIndex + 1}`} className="object-contain max-w-full max-h-[80vh] select-none" />
      </div>
    </div>
  );
}
