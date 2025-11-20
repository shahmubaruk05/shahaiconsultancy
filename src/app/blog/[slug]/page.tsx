
"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
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
  const params = usePathname();
  const router = useRouter();
  const slug = params.split("/").pop();

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (!slug) {
            setError("Blog not found.");
            setLoading(false);
            return;
        }

        const q = query(
          collection(db, "blogPosts"),
          where("slug", "==", slug)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          setError("Blog not found.");
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
        setError("Error loading blog post.");
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
        <p className="mb-3 font-medium text-slate-900">{error || "Blog not found."}</p>
        <button
          onClick={() => router.push("/blog")}
          className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
        >
          ← Back to Blog
        </button>
      </div>
    );
  }
  
  const fullUrl =
    typeof window !== "undefined"
      ? window.location.origin + params
      : `https://shahmubaruk.com${params}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Failed to copy link", e);
    }
  };

  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(post.title);


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
          <span className="mb-2 inline-block rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700">
            {post.category}
          </span>
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

      <div
        className="
          prose
          prose-sm
          max-w-none
          text-slate-800
          leading-relaxed
          whitespace-pre-line
        "
      >
        {post.content}
      </div>

       <div className="mt-10 border-t border-slate-200 pt-6">
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">
          Share this article
        </p>
        <div className="flex flex-wrap gap-2">
          {/* Copy link */}
          <button
            onClick={handleCopy}
            className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {copied ? "✅ Link copied" : "🔗 Copy link"}
          </button>

          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            👍 Share on Facebook
          </a>

          {/* LinkedIn */}
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            💼 Share on LinkedIn
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/?text=${encodedTitle}%20-%20${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            💬 Share on WhatsApp
          </a>

          {/* X / Twitter */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            🐦 Share on X
          </a>
        </div>
      </div>
    </article>
  );
}
