"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { ContactFab } from "@/components/shared/contact-fab";
import { Footer } from "@/components/shared/footer";
import { PageBanner } from "@/components/shared/page-banner";
import { getNewsPosts, type NewsPost } from "@/features/news/actions";
import { NEWS_TYPES } from "@/features/news/constants";
import { Loader2, Newspaper } from "lucide-react";

const ALL_CATEGORIES = ["ทั้งหมด", ...NEWS_TYPES] as const;

export default function NewsFeedPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ทั้งหมด");

  useEffect(() => {
    getNewsPosts()
      .then((res) => { if (res.success && res.posts) setPosts(res.posts); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pinnedPost = posts.find((p) => p.isPinned);
  const regularPosts = posts.filter((p) => !p.isPinned);
  const filteredPosts =
    activeTab === "ทั้งหมด"
      ? regularPosts
      : regularPosts.filter((p) => p.newsType === activeTab);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 font-prompt">
      <Navbar />

      <PageBanner
        title="ข่าวสารและประชาสัมพันธ์"
        subtitle="ข่าวสารอัปเดต ประกาศ และกิจกรรมจากศูนย์โครงการ พสวท."
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 pb-24">
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="h-7 w-7 animate-spin text-[#0b52a7]" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pinned highlight */}
            {pinnedPost && (
              <Link href={`/news/${pinnedPost.id}`} className="block">
                <NewsPreviewCard post={pinnedPost} large />
              </Link>
            )}

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-7 py-2.5 text-lg font-semibold transition-colors cursor-pointer font-prompt border ${
                    activeTab === cat
                      ? "bg-[#0b52a7] text-white border-[#0b52a7]"
                      : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-[#0b52a7] hover:text-[#0b52a7]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* News grid */}
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <Link key={post.id} href={`/news/${post.id}`} className="block">
                    <NewsPreviewCard post={post} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 gap-3">
                <div className="p-3 bg-slate-100 dark:bg-zinc-800 text-slate-400">
                  <Newspaper className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">ไม่พบข่าวสารในหมวดนี้</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
      <ContactFab />
    </div>
  );
}

function NewsPreviewCard({ post, large = false }: { post: NewsPost; large?: boolean }) {
  const firstImage = post.images?.[0];
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (large) {
    return (
      <div className="border border-slate-200 dark:border-zinc-700 border-l-4 border-l-yellow-400 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow flex h-[220px]">
        <div className="w-64 sm:w-80 shrink-0 bg-[#0b52a7] flex items-center justify-center">
          {firstImage ? (
            <img
              src={`/api/news-images/${firstImage.storedName}`}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Newspaper className="h-14 w-14 text-white/60" />
          )}
        </div>
        <div className="p-7 flex flex-col justify-center gap-3">
          <span className="inline-block bg-[#0b52a7] text-white text-xs font-bold px-3 py-1 w-fit uppercase tracking-wide">
            {post.newsType}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-snug">{post.title}</h2>
          <p className="text-sm text-slate-400 dark:text-zinc-500">{formattedDate}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-zinc-700 border-l-4 border-l-[#0b52a7] overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow flex h-40">
      <div className="w-40 shrink-0 bg-[#0b52a7] flex items-center justify-center">
        {firstImage ? (
          <img
            src={`/api/news-images/${firstImage.storedName}`}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Newspaper className="h-10 w-10 text-white/60" />
        )}
      </div>
      <div className="p-4 flex flex-col justify-center gap-2 min-w-0">
        <span className="inline-block bg-[#0b52a7] text-white text-[10px] font-bold px-2 py-0.5 w-fit uppercase tracking-wide">
          {post.newsType}
        </span>
        <p className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">{post.title}</p>
        <p className="text-sm text-slate-400 dark:text-zinc-500">{formattedDate}</p>
      </div>
    </div>
  );
}
