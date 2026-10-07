"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  RotateCw,
  RotateCcw,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Expand,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Attachment } from "../../types";

interface AttachmentViewerProps {
  attachments: Attachment[];
}

type ViewerItem = { att: Attachment; label: string };

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 6;
const DOC_ORDER: Record<string, number> = { photo: 0, id_card: 1, transcript: 2 };

export function AttachmentViewer({ attachments }: AttachmentViewerProps) {
  // Build the single ordered list: photo → id card → ปพ.1 (front, back, …)
  const items = useMemo<ViewerItem[]>(() => {
    const sorted = [...attachments].sort((a, b) => {
      const da = DOC_ORDER[a.documentType] ?? 99;
      const db = DOC_ORDER[b.documentType] ?? 99;
      if (da !== db) return da - db;
      return a.id - b.id; // upload order → ปพ.1 front before back
    });

    const transcripts = sorted.filter((a) => a.documentType === "transcript");
    return sorted.map((att) => {
      let label: string;
      if (att.documentType === "photo") label = "รูปถ่ายนักเรียน";
      else if (att.documentType === "id_card") label = "บัตรประชาชน";
      else {
        const n = transcripts.indexOf(att) + 1;
        label = n === 1 ? "ปพ.1 หน้าแรก" : n === 2 ? "ปพ.1 หน้าหลัง" : `ปพ.1 หน้า ${n}`;
      }
      return { att, label };
    });
  }, [attachments]);

  // Rotation is shared between preview and focus (single source of truth per id).
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const rotate = useCallback((id: number, dir: "left" | "right") => {
    setRotations((prev) => ({ ...prev, [id]: (prev[id] || 0) + (dir === "left" ? -90 : 90) }));
  }, []);

  // Focused (full-screen) viewing state
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [lbZoom, setLbZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const count = items.length;

  const goTo = useCallback(
    (idx: number) => {
      if (count === 0) return;
      const clamped = ((idx % count) + count) % count;
      setFocusIndex(clamped);
      setLbZoom(1);
      setOffset({ x: 0, y: 0 });
    },
    [count]
  );

  const close = useCallback(() => setFocusIndex(null), []);
  const zoomIn = useCallback(() => setLbZoom((z) => Math.min(+(z * 1.25).toFixed(3), MAX_ZOOM)), []);
  const zoomOut = useCallback(() => setLbZoom((z) => Math.max(+(z / 1.25).toFixed(3), MIN_ZOOM)), []);
  const resetView = useCallback(() => {
    setLbZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const focused = focusIndex !== null ? items[focusIndex] : null;
  const focusedId = focused?.att.id;

  // Keyboard shortcuts while focused
  useEffect(() => {
    if (focusIndex === null || focusedId === undefined) return;
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape": close(); break;
        case "+": case "=": zoomIn(); break;
        case "-": case "_": zoomOut(); break;
        case "0": resetView(); break;
        case "[": rotate(focusedId, "left"); break;
        case "]": rotate(focusedId, "right"); break;
        case "ArrowRight": goTo(focusIndex + 1); break;
        case "ArrowLeft": goTo(focusIndex - 1); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusIndex, focusedId, close, zoomIn, zoomOut, resetView, rotate, goTo]);

  const onWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (lbZoom <= 1) return;
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    setDragging(true);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setOffset({
      x: dragRef.current.ox + (e.clientX - dragRef.current.x),
      y: dragRef.current.oy + (e.clientY - dragRef.current.y),
    });
  };
  const onPointerUp = () => {
    dragRef.current = null;
    setDragging(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-slate-950/40 relative">
      {count > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
          {items.map(({ att, label }, idx) => {
            const rotation = rotations[att.id] || 0;
            return (
              <div
                key={att.id}
                className="w-full bg-slate-900 border border-white/5 overflow-hidden shadow-2xl relative group"
              >
                {/* Header: label + filename + rotate controls */}
                <div className="bg-slate-950 px-4 py-2 border-b border-white/5 flex items-center justify-between gap-2 text-[10px] font-bold">
                  <div className="min-w-0">
                    <p className="text-[#0b52a7] dark:text-blue-400 text-xs font-extrabold truncate">{label}</p>
                    <p className="text-slate-500 truncate" title={att.originalName}>
                      {att.originalName} ({Math.round(att.fileSize / 1024)} KB)
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => rotate(att.id, "left")}
                      title="หมุนซ้าย"
                      className="p-1.5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => rotate(att.id, "right")}
                      title="หมุนขวา"
                      className="p-1.5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => goTo(idx)}
                      title="ดูเต็มจอ"
                      className="flex items-center gap-1 p-1.5 bg-[#0b52a7]/40 hover:bg-[#0b52a7] text-white transition-all cursor-pointer"
                    >
                      <Expand className="h-3.5 w-3.5" />
                      <span>ขยาย</span>
                    </button>
                  </div>
                </div>

                {/* Click the image to open the focused viewer */}
                <div
                  onClick={() => goTo(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      goTo(idx);
                    }
                  }}
                  title="คลิกเพื่อดูเต็มจอและซูม"
                  className="w-full h-[320px] bg-slate-950/30 overflow-hidden relative cursor-zoom-in group/stage flex items-center justify-center p-4 outline-none focus-visible:ring-2 focus-visible:ring-[#0b52a7]"
                >
                  {/* Plain <img> so the preview uses the file's real aspect ratio
                      (next/image forces a ratio from width/height props). */}
                  <img
                    src={`/api/upload/${att.storedName}`}
                    alt={label}
                    draggable={false}
                    style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "center center" }}
                    className="max-w-full max-h-full object-contain transition-transform duration-200 select-none pointer-events-none"
                  />
                  <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white text-[10px] font-bold px-2 py-1 opacity-0 group-hover/stage:opacity-100 transition-opacity">
                    <ZoomIn className="h-3 w-3" /> คลิกเพื่อดูเต็มจอ
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 py-16">
          <ImageIcon className="h-10 w-10 text-slate-700 mb-3" />
          <p className="text-sm font-semibold">ยังไม่มีไฟล์หลักฐานที่อัปโหลด</p>
          <p className="text-xs text-slate-600 mt-1">ผู้สมัครยังไม่ได้แนบเอกสารเข้ามาในระบบ</p>
        </div>
      )}

      {/* ===== Focused full-screen viewer ===== */}
      {focused && focusIndex !== null && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex flex-col select-none animate-in fade-in duration-150">
          {/* Toolbar */}
          <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 bg-black/50 text-white border-b border-white/10">
            <div className="min-w-0">
              <p className="text-xs font-bold truncate max-w-[40vw]">
                <span className="text-blue-300">{focused.label}</span>
                <span className="text-slate-400 font-normal"> · {focused.att.originalName}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {focusIndex + 1} / {count} · {Math.round(focused.att.fileSize / 1024)} KB
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => rotate(focused.att.id, "left")} title="หมุนซ้าย ([)" className="p-2 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button onClick={() => rotate(focused.att.id, "right")} title="หมุนขวา (])" className="p-2 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                <RotateCw className="h-4 w-4" />
              </button>
              <span className="w-px h-5 bg-white/20 mx-1" />
              <button onClick={zoomOut} title="ซูมออก (−)" className="p-2 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-bold font-mono w-12 text-center tabular-nums">{Math.round(lbZoom * 100)}%</span>
              <button onClick={zoomIn} title="ซูมเข้า (+)" className="p-2 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                <ZoomIn className="h-4 w-4" />
              </button>
              <button onClick={resetView} title="พอดีหน้าจอ (0)" className="p-2 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                <Maximize2 className="h-4 w-4" />
              </button>
              <button onClick={close} title="ปิด (Esc)" className="p-2 bg-rose-500/30 hover:bg-rose-500/70 text-white transition-colors cursor-pointer ml-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stage */}
          <div
            className="flex-1 relative overflow-hidden flex items-center justify-center"
            style={{ cursor: lbZoom > 1 ? (dragging ? "grabbing" : "grab") : "default" }}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onDoubleClick={() => (lbZoom > 1 ? resetView() : zoomIn())}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                close();
              }
            }}
          >
            <img
              key={focused.att.id}
              src={`/api/upload/${focused.att.storedName}`}
              alt={focused.label}
              draggable={false}
              style={{
                // Pan only applies when zoomed in; otherwise stay centred.
                transform: `translate(${lbZoom > 1 ? offset.x : 0}px, ${lbZoom > 1 ? offset.y : 0}px) scale(${lbZoom}) rotate(${rotations[focused.att.id] || 0}deg)`,
                transformOrigin: "center center",
              }}
              className="max-h-[86vh] max-w-[92vw] w-auto h-auto object-contain transition-transform duration-100 pointer-events-auto"
            />

            {count > 1 && (
              <>
                <button
                  onClick={() => goTo(focusIndex - 1)}
                  title="ก่อนหน้า (←)"
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => goTo(focusIndex + 1)}
                  title="ถัดไป (→)"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Shortcut hint */}
          <div className="shrink-0 text-center text-[10px] text-slate-400 py-2 bg-black/40">
            สกอลล์เพื่อซูม · ลากเพื่อเลื่อนภาพ · ดับเบิลคลิกสลับซูม · ปุ่มลัด: +/− ซูม, 0 พอดีจอ, [ ] หมุนซ้าย/ขวา, ←/→ เปลี่ยนรูป, Esc ปิด
          </div>
        </div>
      )}
    </div>
  );
}
