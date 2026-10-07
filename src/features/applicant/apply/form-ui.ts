/**
 * Shared Tailwind class strings for the apply flow (formal blue + gold system).
 * Replaces the old form.module.css / apply-layout.module.css CSS Modules.
 * Exposed as `formStyles` / `layoutStyles` objects so consumers keep the same
 * `formStyles.fieldInput` call sites — only the import line changes.
 */

export const formStyles = {
  formCard:
    "border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#0b52a7] bg-white dark:bg-zinc-900 shadow-sm p-6 sm:p-10 transition-all duration-300",
  fieldGrid: "grid sm:grid-cols-2 gap-6",
  fieldGrid3: "grid sm:grid-cols-3 gap-6",
  fieldGrid4: "grid sm:grid-cols-4 gap-6",
  stepSection: "space-y-6",
  stepTitle:
    "text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white",
  fieldLabel:
    "block text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-[0.14em] mb-2",
  fieldInput:
    "w-full py-3 px-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-none focus:outline-none focus:ring-2 focus:ring-[#0b52a7]/30 focus:border-[#0b52a7]/60 transition-all duration-200",
  fieldInputError: "border-rose-300 dark:border-rose-800",
  fieldHint:
    "text-[10px] text-slate-500 dark:text-zinc-500 mt-1.5 block leading-normal",
  fieldError:
    "mt-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in duration-200",
  sectionDivider: "border-t border-slate-200 dark:border-zinc-700 my-6 pt-6",
  sectionSubtitle:
    "text-sm font-semibold text-slate-800 dark:text-zinc-300 uppercase tracking-[0.14em] mb-4",
  semesterCard:
    "border border-slate-200 dark:border-zinc-700 p-5 bg-white dark:bg-zinc-900/45 space-y-4",
  gpaDashboard:
    "w-full lg:w-72 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-yellow-400 shadow-sm p-6 self-start space-y-6 lg:sticky lg:top-24",
  uploadSlot:
    "border-2 border-dashed border-slate-300 dark:border-zinc-700 p-6 flex flex-col items-center text-center justify-between min-h-[220px] bg-white dark:bg-zinc-900/35 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-all",
  reviewCard:
    "border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#0b52a7] bg-white dark:bg-zinc-900 shadow-sm p-6 sm:p-8 space-y-6",
  consentBox:
    "bg-amber-50 dark:bg-amber-950/16 border border-l-4 border-amber-200 border-l-yellow-400 dark:border-amber-900/45 p-5 sm:p-7 text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-semibold",
  navBar:
    "flex justify-between mt-12 pt-6 border-t border-slate-200 dark:border-zinc-700",
  loginCard:
    "w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm p-8 transition-all relative overflow-hidden",
} as const;

export const layoutStyles = {
  loginPage:
    "relative min-h-screen bg-white dark:bg-zinc-950 font-prompt flex items-center justify-center p-4",
  wizardPage:
    "relative min-h-screen bg-white dark:bg-zinc-950 dark:text-zinc-100 font-prompt flex pb-24 lg:pb-0",
  sidebar:
    "hidden lg:flex flex-col w-[19rem] shrink-0 fixed inset-y-0 left-0 z-50 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 shadow-sm",
  sidebarHeader:
    "p-6 border-b border-slate-200 dark:border-zinc-800 shrink-0",
  sidebarNav: "flex-1 overflow-y-auto px-4 py-6 flex flex-col",
  sidebarFooter: "p-4 border-t border-slate-200 dark:border-zinc-800 shrink-0",
  mainArea: "flex-1 flex flex-col min-w-0 lg:ml-[19rem]",
  mobileHeader:
    "lg:hidden sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 py-3 shadow-sm",
  mobileStepper: "lg:hidden w-full px-4 pt-4 pb-2",
  mainContent:
    "flex-1 min-w-0 max-w-6xl mx-auto w-full px-4 py-8 lg:px-8",
  stepConnector:
    "absolute left-[22px] top-[24px] bottom-[24px] w-[2px] bg-slate-200 dark:bg-zinc-700",
  stepConnectorActive:
    "absolute left-[22px] top-[24px] w-[2px] bg-[#0b52a7] transition-all duration-500",
  progressBar: "h-2 bg-slate-200 dark:bg-zinc-800 overflow-hidden",
  progressFill: "h-full bg-[#0b52a7] transition-all duration-500",
} as const;
