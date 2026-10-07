"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  getNewsPosts,
  createNewsPost,
  updateNewsPost,
  deleteNewsPost,
  NewsPostImageInput,
  type NewsPost,
  type NewsImage,
} from "@/features/news/actions";
import { NEWS_TYPES } from "@/features/news/constants";
import {
  Newspaper,
  Image as ImageIcon,
  Trash2,
  Edit2,
  Plus,
  Loader2,
  GripVertical,
  X,
  Calendar,
  AlertCircle,
  CheckCircle,
  Pin,
} from "lucide-react";
import DashboardWrapper from "../dashboard-wrapper";

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  error?: string;
}

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newsType, setNewsType] = useState<string>("อื่น ๆ");
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 10));
  const [isPinned, setIsPinned] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<NewsPostImageInput[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editPostId, setEditPostId] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverSide, setDragOverSide] = useState<"left" | "right" | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg("");
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg("");
    setTimeout(() => setErrorMsg(""), 5000);
  };

  const loadPosts = async () => {
    setLoadingPosts(true);
    const res = await getNewsPosts();
    if (res.success) {
      setPosts(res.posts || []);
    } else {
      showError(res.error || "เกิดข้อผิดพลาดในการโหลดข่าวสาร");
    }
    setLoadingPosts(false);
  };

  useEffect(() => {
    let active = true;
    const fetchOnMount = async () => {
      const res = await getNewsPosts();
      if (!active) return;
      if (res.success) {
        setPosts(res.posts || []);
      } else {
        showError(res.error || "เกิดข้อผิดพลาดในการโหลดข่าวสาร");
      }
      setLoadingPosts(false);
    };
    void fetchOnMount();
    return () => { active = false; };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFileList(Array.from(files));
  };

  const uploadFileList = async (fileList: File[]) => {
    const sortedFiles = [...fileList].sort((a, b) => a.lastModified - b.lastModified);

    for (const file of sortedFiles) {
      const tempId = Math.random().toString(36).substring(7);
      setUploadingFiles((prev) => [...prev, { id: tempId, name: file.name, progress: 10 }]);

      try {
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) throw new Error("ขนาดไฟล์เกิน 5MB");

        const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) throw new Error("รองรับเฉพาะไฟล์รูปภาพเท่านั้น");

        const formData = new FormData();
        formData.append("file", file);

        const interval = setInterval(() => {
          setUploadingFiles((prev) =>
            prev.map((item) =>
              item.id === tempId ? { ...item, progress: Math.min(item.progress + 15, 80) } : item
            )
          );
        }, 100);

        const response = await fetch("/api/news/upload", { method: "POST", body: formData });
        clearInterval(interval);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "อัปโหลดไฟล์ล้มเหลว");

        setImages((prev) => [...prev, data.image as NewsPostImageInput]);
        setUploadingFiles((prev) => prev.filter((item) => item.id !== tempId));
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "อัปโหลดไฟล์ล้มเหลว";
        setUploadingFiles((prev) =>
          prev.map((item) => item.id === tempId ? { ...item, progress: 100, error: errMsg } : item)
        );
        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((item) => item.id !== tempId));
        }, 4000);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) await uploadFileList(Array.from(files));
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    const target = e.currentTarget as HTMLElement;
    if (target) e.dataTransfer.setDragImage(target, target.clientWidth / 2, target.clientHeight / 2);
    setTimeout(() => setDraggedIndex(index), 0);
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === index) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const side = (e.clientX - rect.left) < rect.width / 2 ? "left" : "right";
    if (dragOverIndex !== index || dragOverSide !== side) {
      setDragOverIndex(index);
      setDragOverSide(side);
    }
  };

  const handleDragLeaveItem = () => { setDragOverIndex(null); setDragOverSide(null); };

  const handleDropItem = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null); setDragOverIndex(null); setDragOverSide(null);
      return;
    }
    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    let insertIndex = dragOverSide === "right" ? targetIndex + 1 : targetIndex;
    if (draggedIndex < insertIndex) insertIndex -= 1;
    newImages.splice(draggedIndex, 1);
    newImages.splice(insertIndex, 0, draggedItem);
    setImages(newImages);
    setDraggedIndex(null); setDragOverIndex(null); setDragOverSide(null);
  };

  const handleDragEnd = () => { setDraggedIndex(null); setDragOverIndex(null); setDragOverSide(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { showError("กรุณากรอกหัวเรื่องข่าวสาร"); return; }
    if (!content.trim()) { showError("กรุณากรอกข้อความข่าวสาร"); return; }

    setIsSubmitting(true);
    try {
      if (editPostId) {
        const res = await updateNewsPost(editPostId, title, newsType, publishedAt, isPinned, content, images);
        if (res.success) { showSuccess("แก้ไขข่าวสารสำเร็จ"); closeComposer(); await loadPosts(); }
        else showError(res.error || "เกิดข้อผิดพลาดในการแก้ไขข่าวสาร");
      } else {
        const res = await createNewsPost(title, newsType, publishedAt, content, images);
        if (res.success) { showSuccess("เผยแพร่ข่าวสารสำเร็จ"); closeComposer(); await loadPosts(); }
        else showError(res.error || "เกิดข้อผิดพลาดในการเผยแพร่ข่าวสาร");
      }
    } catch (err) {
      showError("ไม่สามารถดำเนินการได้: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("ต้องการลบข่าวสารนี้ใช่หรือไม่? รูปภาพทั้งหมดจะถูกลบอย่างถาวร")) return;
    try {
      const res = await deleteNewsPost(postId);
      if (res.success) { showSuccess("ลบข่าวสารสำเร็จ"); await loadPosts(); if (editPostId === postId) resetForm(); }
      else showError(res.error || "เกิดข้อผิดพลาดในการลบข่าวสาร");
    } catch (err) {
      showError("ไม่สามารถลบข่าวสารได้: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleEditClick = (post: NewsPost) => {
    setEditPostId(post.id);
    setNewsType(post.newsType);
    setPublishedAt(new Date(post.publishedAt).toISOString().slice(0, 10));
    setIsPinned(post.isPinned);
    setTitle(post.title);
    setContent(post.content);
    setImages(post.images.map((img: NewsImage) => ({
      originalName: img.originalName,
      storedName: img.storedName,
      mimeType: img.mimeType,
      fileSize: img.fileSize,
    })));
    setIsComposerOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setNewsType("อื่น ๆ");
    setPublishedAt(new Date().toISOString().slice(0, 10));
    setIsPinned(false);
    setTitle("");
    setContent("");
    setImages([]);
    setUploadingFiles([]);
    setEditPostId(null);
  };

  const openComposerForNew = () => {
    resetForm();
    setIsComposerOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeComposer = () => {
    resetForm();
    setIsComposerOpen(false);
  };

  const formatThaiDate = (dateStrOrDate: string | Date) => {
    const d = new Date(dateStrOrDate);
    return d.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " น.";
  };

  return (
    <DashboardWrapper
      title="จัดการข่าวสารประชาสัมพันธ์"
      subtitle="สร้างข่าว โพสต์ประกาศ และจัดการข่าวสารพร้อมรูปภาพ"
      icon={Newspaper}
    >
      {successMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-none bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-none bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Composer */}
      {isComposerOpen && (
      <section className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#0b52a7] p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          {editPostId ? <Edit2 className="h-5 w-5 text-[#0b52a7]" /> : <Plus className="h-5 w-5 text-[#0b52a7]" />}
          {editPostId ? "แก้ไขข่าวสาร" : "เขียนข่าวสารใหม่"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row: Type + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                ประเภทข่าวสาร <span className="text-rose-500">*</span>
              </label>
              <select
                value={newsType}
                onChange={(e) => setNewsType(e.target.value)}
                className="w-full rounded-none border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 p-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0b52a7]/25 focus:border-[#0b52a7] dark:focus:border-blue-500 transition-all font-prompt"
              >
                {NEWS_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                วันที่ประกาศ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full rounded-none border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 p-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0b52a7]/25 focus:border-[#0b52a7] dark:focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Pin toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 accent-[#0b52a7]"
            />
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-zinc-300">
              <Pin className="h-4 w-4 text-[#0b52a7]" />
              ปักหมุดเป็นข่าวเด่น (แสดงในตำแหน่งหลักบนสุด)
            </span>
          </label>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              หัวเรื่องข่าวสาร <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุหัวเรื่องหรือชื่อประกาศ..."
              className="w-full rounded-none border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-[#0b52a7]/25 focus:border-[#0b52a7] dark:focus:border-blue-500 transition-all font-prompt"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              เนื้อหาข่าวสาร <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="กรอกรายละเอียดข่าวสาร... (รองรับการขึ้นบรรทัดใหม่)"
              rows={5}
              className="w-full rounded-none border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-[#0b52a7]/25 focus:border-[#0b52a7] dark:focus:border-blue-500 transition-all font-prompt"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              รูปภาพประกอบข่าว
            </label>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-[#0b52a7]/80 dark:border-zinc-800 dark:hover:border-blue-500/50 rounded-none p-8 text-center bg-slate-50/20 dark:bg-zinc-950/20 hover:bg-slate-50/60 dark:hover:bg-zinc-950/40 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />
              <div className="p-3 bg-[#0b52a7]/10 dark:bg-blue-950/30 text-[#0b52a7] dark:text-blue-400 rounded-none group-hover:scale-105 transition-transform duration-200">
                <ImageIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-zinc-300 mt-1">คลิกเพื่อเลือกไฟล์ หรือลากวางรูปภาพ</p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500">PNG, JPG, GIF, WEBP ไม่เกิน 5MB ต่อไฟล์</p>
            </div>

            {uploadingFiles.length > 0 && (
              <div className="space-y-2 p-4 bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/50 dark:border-zinc-800 rounded-none">
                <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">กำลังอัปโหลดไฟล์...</p>
                {uploadingFiles.map((file) => (
                  <div key={file.id} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-slate-700 dark:text-zinc-300 truncate max-w-[240px]">{file.name}</span>
                      {file.error ? (
                        <span className="font-bold text-rose-600 dark:text-rose-400">{file.error}</span>
                      ) : (
                        <span className="font-bold text-[#0b52a7] dark:text-blue-400">{file.progress}%</span>
                      )}
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-none overflow-hidden">
                      <div className={`h-full rounded-none transition-all duration-300 ${file.error ? "bg-rose-500" : "bg-[#0b52a7]"}`} style={{ width: `${file.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={img.storedName}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOverItem(e, idx)}
                    onDragLeave={handleDragLeaveItem}
                    onDrop={(e) => handleDropItem(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`group relative aspect-square rounded-none transition-all duration-200 cursor-grab active:cursor-grabbing ${draggedIndex === idx ? "opacity-30 scale-95" : "hover:scale-[1.01]"}`}
                  >
                    <div className={`w-full h-full border rounded-none overflow-hidden bg-slate-50 dark:bg-zinc-950 shadow-sm flex flex-col justify-between transition-all duration-200 ${dragOverIndex === idx ? "border-[#0b52a7] dark:border-blue-600 bg-[#0b52a7]/5" : "border-slate-200 dark:border-zinc-800 hover:shadow-md"}`}>
                      <div className="relative flex-1 bg-slate-900 flex items-center justify-center overflow-hidden">
                        <img src={`/api/news-images/${img.storedName}`} alt={img.originalName} className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-300" />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-none bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white tracking-wider">อันดับ {idx + 1}</div>
                        <button type="button" onClick={() => removeImage(idx)} draggable={false} onDragStart={(e) => e.stopPropagation()} className="absolute top-2 right-2 p-1.5 rounded-none bg-rose-600 text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 cursor-pointer z-10">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="p-2 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 gap-1.5 shrink-0 select-none">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <GripVertical className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-600 shrink-0" />
                          <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold truncate">{img.originalName}</span>
                        </div>
                      </div>
                    </div>
                    {dragOverIndex === idx && dragOverSide && (
                      <div className={`absolute top-1 bottom-1 w-[4px] bg-[#0b52a7] dark:bg-blue-400 z-30 animate-pulse ${dragOverSide === "left" ? "left-[-10px]" : "right-[-10px]"}`} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button type="button" onClick={closeComposer} className="px-5 py-2.5 rounded-none border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-950 font-bold text-xs cursor-pointer transition-all">
              {editPostId ? "ยกเลิกการแก้ไข" : "ยกเลิก"}
            </button>
            <button type="submit" disabled={isSubmitting || uploadingFiles.length > 0} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-none bg-[#0b52a7] hover:bg-[#08407f] disabled:bg-slate-300 dark:disabled:bg-zinc-800 text-white font-bold text-xs shadow-sm cursor-pointer disabled:cursor-not-allowed transition-all">
              {isSubmitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />กำลังบันทึก...</> : editPostId ? "บันทึกการแก้ไข" : "เผยแพร่ข่าวสาร"}
            </button>
          </div>
        </form>
      </section>
      )}

      {/* Post List */}
      {!isComposerOpen && (
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-[#0b52a7]" />
            รายการข่าวสาร ({posts.length})
          </h2>
          <button
            onClick={openComposerForNew}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0b52a7] hover:bg-[#08407f] text-white font-bold text-xs shadow-sm cursor-pointer transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            เขียนข่าวสารใหม่
          </button>
        </div>

        {loadingPosts ? (
          <div className="flex flex-col items-center justify-center p-20 border border-slate-200/50 dark:border-zinc-800 rounded-none bg-white dark:bg-zinc-900/20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#0b52a7]" />
            <p className="text-xs font-semibold mt-3 text-slate-500 dark:text-zinc-400">กำลังโหลด...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 border border-slate-200/50 dark:border-zinc-800 rounded-none bg-white dark:bg-zinc-900/20 text-center gap-2">
            <div className="p-3 bg-slate-50 dark:bg-zinc-950 text-slate-400 rounded-none"><Newspaper className="h-8 w-8" /></div>
            <p className="text-sm font-black text-slate-900 dark:text-white">ยังไม่มีข่าวสาร</p>
            <p className="text-xs text-slate-500 dark:text-zinc-500">เริ่มต้นเขียนข่าวสารใหม่ด้านบน</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article key={post.id} className="bg-white dark:bg-zinc-900/50 border border-slate-200/60 dark:border-zinc-800 rounded-none p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-5">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 dark:text-zinc-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatThaiDate(post.publishedAt)}</span>
                    <span className="inline-flex items-center rounded-none bg-[#0b52a7]/10 px-2 py-0.5 text-[10px] font-bold text-[#0b52a7] dark:text-blue-300">{post.newsType}</span>
                    {post.isPinned && <span className="inline-flex items-center gap-1 rounded-none bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300"><Pin className="h-2.5 w-2.5" />ข่าวเด่น</span>}
                    <span className="text-[10px]">ID: #{post.id}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{post.title}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 line-clamp-2">{post.content}</p>
                  {post.images && post.images.length > 0 && (
                    <div className="flex gap-2 pt-1">
                      {post.images.slice(0, 4).map((img: NewsImage) => (
                        <div key={img.storedName} className="h-12 w-12 rounded-none overflow-hidden border border-slate-100 dark:border-zinc-800 bg-slate-900 shrink-0">
                          <img src={`/api/news-images/${img.storedName}`} alt={img.originalName} className="object-cover w-full h-full" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex md:flex-col justify-end md:justify-start gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-zinc-800">
                  <button onClick={() => handleEditClick(post)} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-none bg-slate-100 hover:bg-[#0b52a7]/10 hover:text-[#0b52a7] dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs cursor-pointer transition-colors">
                    <Edit2 className="h-3.5 w-3.5" />แก้ไข
                  </button>
                  <button onClick={() => handleDeletePost(post.id)} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-none bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-300 font-bold text-xs cursor-pointer transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />ลบ
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      )}
    </DashboardWrapper>
  );
}
