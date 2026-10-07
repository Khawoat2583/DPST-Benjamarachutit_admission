import type { Metadata } from "next";
import NewsDetailPage from "@/features/news-detail/news-detail-page";
import { getNewsPostById } from "@/features/news/actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const res = await getNewsPostById(Number(id));
  if (!res.success || !res.post) {
    return { title: "ไม่พบข่าวสาร", robots: { index: false } };
  }

  const post = res.post;
  const description = (post.content || "").replace(/\s+/g, " ").trim().slice(0, 155);
  const firstImage = post.images?.[0]?.storedName;
  const image = firstImage ? `/api/news-images/${firstImage}` : "/dpst-OG.png";

  return {
    title: post.title,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NewsDetailPage id={Number(id)} />;
}
