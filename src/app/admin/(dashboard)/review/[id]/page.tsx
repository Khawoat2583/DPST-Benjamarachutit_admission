import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";
import ReviewCanvas from "@/features/admin-review/components/review-canvas";

export const revalidate = 0; // Disable static cache for absolute precision

type Params = Promise<{ id: string }>;

interface PageProps {
  params: Params;
}

export default async function AdminReviewDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const appId = Number(resolvedParams.id);

  if (isNaN(appId)) {
    return notFound();
  }

  // Fetch applicant, their course grades, and all associated secure documents
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, appId),
    with: {
      grades: true,
      attachments: true,
    },
  });

  if (!app) {
    return notFound();
  }

  return <ReviewCanvas application={app} />;
}
