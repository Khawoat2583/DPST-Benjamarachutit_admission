"use server";

import { db } from "@/db";
import { newsPosts, newsImages } from "@/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { NEWS_TYPES } from "./constants";
import type { NewsType } from "./constants";
import { getAdminSession } from "@/server/auth/admin-session";
import { recordAuditLog } from "@/server/auth/security";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { env } from "@/server/env";

export interface NewsPostImageInput {
  originalName: string;
  storedName: string;
  mimeType: string;
  fileSize: number;
}

export interface NewsImage {
  id: number;
  postId: number;
  originalName: string;
  storedName: string;
  mimeType: string;
  fileSize: number;
  orderIndex: number;
  createdAt: Date;
}

export interface NewsPost {
  id: number;
  title: string;
  newsType: string;
  isPinned: boolean;
  publishedAt: Date;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  images: NewsImage[];
}

export async function getNewsPosts() {
  try {
    const posts = await db.query.newsPosts.findMany({
      orderBy: [desc(newsPosts.publishedAt)],
      with: {
        images: {
          orderBy: (newsImages, { asc }) => [asc(newsImages.orderIndex)],
        },
      },
    });
    return { success: true, posts };
  } catch (error) {
    console.error("Error fetching news posts:", error);
    return { success: false, error: "ไม่สามารถดึงข้อมูลข่าวสารได้", posts: [] };
  }
}

export async function getNewsPostById(id: number) {
  try {
    const post = await db.query.newsPosts.findFirst({
      where: eq(newsPosts.id, id),
      with: {
        images: {
          orderBy: (newsImages, { asc }) => [asc(newsImages.orderIndex)],
        },
      },
    });
    return { success: true, post: post ?? null };
  } catch (error) {
    console.error("Error fetching news post:", error);
    return { success: false, post: null, error: "ไม่สามารถดึงข้อมูลข่าวสารได้" };
  }
}

export async function createNewsPost(
  title: string,
  newsType: string,
  publishedAt: string,
  content: string,
  images: NewsPostImageInput[]
) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized access. Admin privileges required.");
  }

  if (!title.trim()) return { success: false, error: "กรุณากรอกหัวเรื่องข่าวสาร" };
  if (!content.trim()) return { success: false, error: "กรุณากรอกข้อความข่าวสาร" };

  try {
    const result = await db.transaction(async (tx) => {
      const [insertedPost] = await tx
        .insert(newsPosts)
        .values({
          title: title.trim(),
          newsType: newsType as (typeof NEWS_TYPES)[number],
          publishedAt: new Date(publishedAt),
          content: content.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (images && images.length > 0) {
        await tx.insert(newsImages).values(
          images.map((img, idx) => ({
            postId: insertedPost.id,
            originalName: img.originalName,
            storedName: img.storedName,
            mimeType: img.mimeType,
            fileSize: img.fileSize,
            orderIndex: idx,
            createdAt: new Date(),
          }))
        );
      }

      return insertedPost;
    });

    await recordAuditLog(
      "CREATE_NEWS_POST",
      `สร้างโพสต์ข่าวสาร (ID: ${result.id}) ประเภท: ${newsType}`
    );

    revalidatePath("/");
    revalidatePath("/news");
    revalidatePath("/admin/news");

    return { success: true, post: result };
  } catch (error) {
    console.error("Error creating news post:", error);
    return { success: false, error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเผยแพร่ข่าวสาร" };
  }
}

export async function updateNewsPost(
  postId: number,
  title: string,
  newsType: string,
  publishedAt: string,
  isPinned: boolean,
  content: string,
  updatedImages: NewsPostImageInput[]
) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized access. Admin privileges required.");
  }

  if (!title.trim()) return { success: false, error: "กรุณากรอกหัวเรื่องข่าวสาร" };
  if (!content.trim()) return { success: false, error: "กรุณากรอกข้อความข่าวสาร" };

  try {
    const currentImages = await db.query.newsImages.findMany({
      where: eq(newsImages.postId, postId),
    });

    const updatedStoredNames = new Set(updatedImages.map((img) => img.storedName));
    const imagesToDelete = currentImages.filter((img) => !updatedStoredNames.has(img.storedName));

    const baseUploadDir = path.isAbsolute(env.UPLOAD_ROOT)
      ? env.UPLOAD_ROOT
      : path.join(process.cwd(), env.UPLOAD_ROOT);

    await db.transaction(async (tx) => {
      // If pinning this post, unpin all others first
      if (isPinned) {
        await tx
          .update(newsPosts)
          .set({ isPinned: false })
          .where(and(eq(newsPosts.isPinned, true), ne(newsPosts.id, postId)));
      }

      await tx
        .update(newsPosts)
        .set({
          title: title.trim(),
          newsType: newsType as (typeof NEWS_TYPES)[number],
          publishedAt: new Date(publishedAt),
          isPinned,
          content: content.trim(),
          updatedAt: new Date(),
        })
        .where(eq(newsPosts.id, postId));

      await tx.delete(newsImages).where(eq(newsImages.postId, postId));

      if (updatedImages.length > 0) {
        await tx.insert(newsImages).values(
          updatedImages.map((img, idx) => ({
            postId,
            originalName: img.originalName,
            storedName: img.storedName,
            mimeType: img.mimeType,
            fileSize: img.fileSize,
            orderIndex: idx,
            createdAt: new Date(),
          }))
        );
      }
    });

    for (const img of imagesToDelete) {
      const filePath = path.join(baseUploadDir, "public-news", img.storedName);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn(`Could not delete file: ${filePath}`, err);
      }
    }

    await recordAuditLog("UPDATE_NEWS_POST", `แก้ไขข่าวสาร (ID: ${postId})`);

    revalidatePath("/");
    revalidatePath("/news");
    revalidatePath(`/news/${postId}`);
    revalidatePath("/admin/news");

    return { success: true };
  } catch (error) {
    console.error("Error updating news post:", error);
    return { success: false, error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการแก้ไขข่าวสาร" };
  }
}

export async function deleteNewsPost(postId: number) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized access. Admin privileges required.");
  }

  try {
    const associatedImages = await db.query.newsImages.findMany({
      where: eq(newsImages.postId, postId),
    });

    const baseUploadDir = path.isAbsolute(env.UPLOAD_ROOT)
      ? env.UPLOAD_ROOT
      : path.join(process.cwd(), env.UPLOAD_ROOT);

    await db.delete(newsPosts).where(eq(newsPosts.id, postId));

    for (const img of associatedImages) {
      const filePath = path.join(baseUploadDir, "public-news", img.storedName);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn(`Could not delete file: ${filePath}`, err);
      }
    }

    await recordAuditLog(
      "DELETE_NEWS_POST",
      `ลบข่าวสาร (ID: ${postId}) และรูปภาพ ${associatedImages.length} รูป`
    );

    revalidatePath("/");
    revalidatePath("/news");
    revalidatePath("/admin/news");

    return { success: true };
  } catch (error) {
    console.error("Error deleting news post:", error);
    return { success: false, error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการลบข่าวสาร" };
  }
}
