import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApplyForm } from "../apply-form-context";

export function PreviewModal() {
  const { previewModal, setPreviewModal } = useApplyForm();
  if (!previewModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => setPreviewModal(null)}
    >
      <div
        className="relative bg-white dark:bg-zinc-900 shadow-2xl border border-slate-200/60 dark:border-zinc-800 border-t-4 border-t-[#0b52a7] max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800">
          <h3 className="text-sm font-black text-slate-800 dark:text-white truncate">
            {previewModal.label}
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setPreviewModal(null)}
            className="rounded-none"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-50/50 dark:bg-zinc-950/50">
          {previewModal.mimeType === "application/pdf" ? (
            <iframe
              src={previewModal.url}
              className="w-full h-[75vh] border border-slate-200 dark:border-zinc-700"
              title={previewModal.label}
            />
          ) : (
            <Image
              src={previewModal.url}
              alt={previewModal.label}
              width={800}
              height={600}
              unoptimized
              className="max-w-full max-h-[75vh] object-contain shadow-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
}
