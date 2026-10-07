"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getApplicationStatus } from "@/features/applicant/actions";
import { isValidNationalId } from "@/lib/national-id";

type StatusSearchContextValue = {
  nationalId: string;
  setNationalId: (id: string) => void;
  loading: boolean;
  errorMsg: string | null;
  application: Record<string, unknown> | null;
  searched: boolean;
  isValidId: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

const StatusSearchContext = createContext<StatusSearchContextValue | null>(null);

export function StatusSearchProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("nationalId") || "";

  const [nationalId, setNationalId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [application, setApplication] = useState<Record<string, unknown> | null>(null);
  const [searched, setSearched] = useState(false);

  const isValidId = useMemo(() => isValidNationalId(nationalId), [nationalId]);

  const handleSearch = useCallback(async (idToSearch: string) => {
    if (!isValidNationalId(idToSearch)) {
      setErrorMsg("กรุณากรอกเลขประจำตัวประชาชน 13 หลักให้ถูกต้อง");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSearched(true);
    try {
      const res = await getApplicationStatus(idToSearch);
      if (!res.success) {
        setErrorMsg(res.error || "ไม่พบข้อมูลการสมัครสำหรับเลขบัตรประชาชนนี้");
        setApplication(null);
      } else {
        setApplication(res as Record<string, unknown>);
      }
    } catch {
      setErrorMsg("ไม่สามารถดึงข้อมูลได้สำเร็จในขณะนี้ กรุณาลองใหม่อีกครั้ง");
      setApplication(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialId || !isValidNationalId(initialId)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void handleSearch(initialId);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [initialId, handleSearch]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(nationalId);
  };

  const value: StatusSearchContextValue = {
    nationalId,
    setNationalId,
    loading,
    errorMsg,
    application,
    searched,
    isValidId,
    onSubmit,
  };

  return (
    <StatusSearchContext.Provider value={value}>{children}</StatusSearchContext.Provider>
  );
}

export function useStatusSearch() {
  const ctx = useContext(StatusSearchContext);
  if (!ctx) {
    throw new Error("useStatusSearch must be used within StatusSearchProvider");
  }
  return ctx;
}
