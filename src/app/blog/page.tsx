"use client";

import { useEffect, useState, useMemo } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";

const { firestore: db } = initializeFirebase();

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl?: string | null;
  status: "draft" | "published" | string;
  createdAt: Date | null;
  category?: string;
}

export default function BlogListPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          posts
            .map((p) => p.category || "Uncategorized")
            .filter(Boolean)
        )
      ),
    ],
    [posts]
  );
  
  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter(
          (p) => (p.category || "Uncategorized") === activeCategory
        );

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "blogPosts"));
        const rows: BlogPost[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          let createdAt: Date | null = null;
          if (data.createdAt && data.createdAt.toDate) {
            createdAt = data.createdAt.toDate();
          }
          rows.push({
            id: docSnap.id,
            title: data.title || "Untitled",
            slug: data.slug || docSnap.id,
            description: data.description || "",
            coverImageUrl: data.coverImageUrl || null,
            status: data.status || "draft",
            createdAt,
            category: data.category || "",
          });
        });

        // Show only published, newest first
        const publishedPosts = rows
          .filter((p) => p.status === "published")
          .sort((a, b) => {
            const ta = a.createdAt?.getTime() ?? 0;
            const tb = b.createdAt?.getTime() ?? 0;
            return tb - ta;
          });

        setPosts(publishedPosts);
      } catch (err) {
        console.error("Failed to load blog posts", err);
        setError("Blog load করতে সমস্যা হচ্ছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Blog – Shah Mubaruk, Your Startup Coach
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Startup, funding, Bangladesh/USA company formation, tax, licensing, business strategy
          – সব নিয়ে বাস্তব অভিজ্ঞতা ও গাইডলাইন।
        </p>
      </header>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === category
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-8 text-sm text-slate-500">Loading blog posts...</div>
      )}

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="py-8 text-sm text-slate-500">
          এখনো কোনো blog publish করা হয়নি।
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {filteredPosts.map((post) => (
          <a
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md"
          >
            {post.coverImageUrl && (
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col p-4">
               {post.category && (
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {post.category}
                  </p>
                )}
              <h2 className="text-sm font-semibold text-slate-900 group-hover:text-slate-950">
                {post.title}
              </h2>
              <p className="mt-1 line-clamp-3 text-xs text-slate-600">
                {post.description}
              </p>
              {post.createdAt && (
                <p className="mt-3 text-[11px] text-slate-400">
                  {post.createdAt.toLocaleDateString()}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
