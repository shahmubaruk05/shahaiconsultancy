"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { initializeFirebase } from "@/firebase";

const { firestore: db } = initializeFirebase();

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImageUrl?: string | null;
  videoUrl?: string | null;
  status: "draft" | "published" | string;
  createdAt: Date | null;
  category?: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(
          collection(db, "blogPosts"),
          where("slug", "==", slug),
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          setError("Blog পাওয়া যায়নি।");
          setLoading(false);
          return;
        }

        const docSnap = snap.docs[0];
        const data = docSnap.data() as any;
        let createdAt: Date | null = null;
        if (data.createdAt && data.createdAt.toDate) {
          createdAt = data.createdAt.toDate();
        }

        setPost({
          id: docSnap.id,
          title: data.title || "Untitled",
          slug: data.slug || slug,
          description: data.description || "",
          content: data.content || "",
          coverImageUrl: data.coverImageUrl || null,
          videoUrl: data.videoUrl || null,
          status: data.status || "draft",
          createdAt,
          category: data.category || "",
        });
      } catch (err) {
        console.error("Failed to load blog post", err);
        setError("Blog load করতে সমস্যা হচ্ছে।");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      load();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-slate-500">
        Loading blog...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-slate-600">
        <p className="mb-3 font-medium text-slate-900">{error || "Blog পাওয়া যায়নি।"}</p>
        <button
          onClick={() => router.push("/blog")}
          className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
        >
          ← Back to Blog
        </button>
      </div>
    );
  }

  const content = post.content || "";

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => router.push("/blog")}
        className="mb-4 text-xs text-slate-500 hover:text-slate-700"
      >
        ← Back to Blog
      </button>

      <header className="mb-6">
        {post.category && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {post.category}
          </p>
        )}
        <h1 className="text-2xl font-semibold text-slate-900">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-2 text-sm text-slate-600">
            {post.description}
          </p>
        )}
        {post.createdAt && (
          <p className="mt-2 text-xs text-slate-400">
            Published on {post.createdAt.toLocaleDateString()}
          </p>
        )}
      </header>

      {post.coverImageUrl && (
        <div className="mb-6 overflow-hidden rounded-lg bg-slate-100">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full max-h-[380px] object-cover"
          />
        </div>
      )}

      {post.videoUrl && (
        <div className="mb-6 overflow-hidden rounded-lg border border-slate-200">
          <div className="aspect-video w-full bg-black">
            <iframe
              src={post.videoUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <div className="prose prose-sm max-w-none text-slate-800">
        <p className="whitespace-pre-line text-sm leading-relaxed">
          {content}
        </p>
      </div>
    </article>
  );
}
