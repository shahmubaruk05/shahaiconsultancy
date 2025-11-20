
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { initializeFirebase } from "@/firebase";

const { firestore: db, auth } = initializeFirebase();

const ADMIN_EMAILS = [
  "shahmubaruk05@gmail.com",
  "shahmubaruk.ai@gmail.com",
];

type Status = "draft" | "published" | string;

interface BlogRow {
  id: string;
  title: string;
  slug: string;
  status: Status;
  createdAt: Date | null;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminBlogPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    coverImageUrl: "",
    videoUrl: "",
    content: "",
    status: "draft" as Status,
  });
  
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCheckingAuth(false);
        router.push("/login");
        return;
      }

      const email = user.email ?? "";
      const admin = ADMIN_EMAILS.includes(email);
      setIsAdmin(admin);
      setCheckingAuth(false);

      if (!admin) {
        setError("Access denied. Admin only.");
        return;
      }

      try {
        setLoading(true);
        const snap = await getDocs(collection(db, "blogPosts"));
        const rows: BlogRow[] = [];
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
            status: data.status || "draft",
            createdAt,
          });
        });
        rows.sort((a, b) => {
          const ta = a.createdAt?.getTime() ?? 0;
          const tb = b.createdAt?.getTime() ?? 0;
          return tb - ta;
        });
        setPosts(rows);
      } catch (err) {
        console.error("Failed to load blogPosts", err);
        setError("Blog posts load করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [auth, db, router]);

  const handleNew = () => {
    setEditingId(null);
    setForm({
      title: "",
      slug: "",
      description: "",
      coverImageUrl: "",
      videoUrl: "",
      content: "",
      status: "draft",
    });
  };

  const handleEdit = async (postId: string) => {
    try {
      const target = posts.find((p) => p.id === postId);
      if (!target) return;

      const snap = await getDocs(collection(db, "blogPosts"));
      const docSnap = snap.docs.find((d) => d.id === postId);
      if (!docSnap) return;

      const data = docSnap.data() as any;

      setEditingId(postId);
      setForm({
        title: data.title || "",
        slug: data.slug || "",
        description: data.description || "",
        coverImageUrl: data.coverImageUrl || "",
        videoUrl: data.videoUrl || "",
        content: data.content || "",
        status: (data.status as Status) || "draft",
      });
    } catch (err) {
      console.error("Failed to load post for editing", err);
      alert("এই পোস্টটা edit করতে সমস্যা হয়েছে।");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Title লাগবে।");
      return;
    }

    let slug = form.slug.trim();
    if (!slug) {
      slug = slugify(form.title);
    }

    if (!slug) {
      alert("Valid URL slug বানানো যাচ্ছে না। অন্য title দিন।");
      return;
    }

    try {
      const payload = {
        title: form.title.trim(),
        slug,
        description: form.description.trim(),
        coverImageUrl: form.coverImageUrl.trim() || null,
        videoUrl: form.videoUrl.trim() || null,
        content: form.content.trim(),
        status: form.status || "draft",
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "blogPosts", editingId), payload);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  title: payload.title,
                  slug: payload.slug,
                  status: payload.status as Status,
                }
              : p,
          ),
        );
      } else {
        const result = await addDoc(collection(db, "blogPosts"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setPosts((prev) => [
          {
            id: result.id,
            title: payload.title,
            slug: payload.slug,
            status: payload.status as Status,
            createdAt: new Date(),
          },
          ...prev,
        ]);
      }

      alert(
        form.status === "published"
          ? "Blog published করা হয়েছে।"
          : "Blog draft হিসেবে save হয়েছে।",
      );
    } catch (err) {
      console.error("Failed to save blog post", err);
      alert("Blog save করতে সমস্যা হয়েছে।");
    }
  };

  const publishedCount = useMemo(
    () => posts.filter((p) => p.status === "published").length,
    [posts],
  );
  const draftCount = useMemo(
    () => posts.filter((p) => p.status !== "published").length,
    [posts],
  );

  if (checkingAuth) {
    return (
      <div className="p-4 text-sm text-slate-500">
        Checking admin access...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-4 text-sm font-medium text-red-600">
        {error || "Access denied. Admin only."}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Blog Manager
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            এখানে থেকে blog লিখে draft / publish করতে পারবেন। Image URL, YouTube video URL
            দিয়ে মিডিয়া যোগ করতে পারেন।
          </p>
        </div>

        <button
          type="button"
          onClick={handleNew}
          className="rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
        >
          + New post
        </button>
      </div>

      {/* Small stats */}
      <div className="grid gap-3 text-xs sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">
            Total posts
          </div>
          <div className="text-lg font-semibold text-slate-900">
            {posts.length}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">
            Published
          </div>
          <div className="text-lg font-semibold text-emerald-700">
            {publishedCount}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">
            Draft
          </div>
          <div className="text-lg font-semibold text-slate-900">
            {draftCount}
          </div>
        </div>
      </div>

      {/* Editor form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
      >
        <div className="mb-2 flex items-center justify-between text-xs">
          <div className="font-semibold text-slate-800">
            {editingId ? "Edit blog post" : "Create new blog post"}
          </div>
          {form.slug && (
            <a
              href={`/blog/${form.slug}`}
              target="_blank"
              className="text-[11px] text-blue-600 hover:underline"
            >
              View live
            </a>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-600">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
              placeholder="e.g. কীভাবে Bangladesh থেকে USA Company গঠন করবেন"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-600">
              URL slug (optional)
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({ ...f, slug: slugify(e.target.value) }))
              }
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
              placeholder="auto-generated-from-title"
            />
            <p className="text-[10px] text-slate-400">
              ফাঁকা রাখলে title থেকে auto slug হবে।
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-600">
            Short description
          </label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            placeholder="Homepage & blog listing এ যে ছোট summary দেখাতে চান..."
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-600">
              Cover image URL
            </label>
            <input
              type="text"
              value={form.coverImageUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, coverImageUrl: e.target.value }))
              }
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
              placeholder="https://.../image.jpg"
            />
            <p className="text-[10px] text-slate-400">
              আপাতত direct URL দিন। পরে চাইলে Firebase Storage upload যোগ করা যাবে।
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-600">
              Video URL (YouTube embed or full URL)
            </label>
            <input
              type="text"
              value={form.videoUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, videoUrl: e.target.value }))
              }
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
              placeholder="https://www.youtube.com/embed/...."
            />
            <p className="text-[10px] text-slate-400">
              YouTube embed URL দিলে detail পেজে video player show হবে।
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-600">
            Content (plain text / বাংলা + English mix)
          </label>
          <textarea
            rows={10}
            value={form.content}
            onChange={(e) =>
              setForm((f) => ({ ...f, content: e.target.value }))
            }
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
            placeholder={`এখানে পুরো blog লিখুন...\n\nLine break রাখলে frontend-এ আলাদা প্যারাগ্রাফ হিসেবে show হবে।`}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600">Status:</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as Status }))
              }
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="draft">Draft (only you see in admin)</option>
              <option value="published">Published (public on blog)</option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            {editingId ? "Save changes" : "Save post"}
          </button>
        </div>
      </form>

      {/* Table of posts */}
      <div className="rounded-lg border border-slate-200">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">
                Title
              </th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">
                Slug
              </th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">
                Status
              </th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">
                Created
              </th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t last:border-b-0">
                <td className="px-3 py-2">{p.title}</td>
                <td className="px-3 py-2 font-mono text-[11px]">
                  {p.slug}
                </td>
                <td className="px-3 py-2">
                  {p.status === "published" ? (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      Published
                    </span>
                  ) : (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      Draft
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-[11px] text-slate-500">
                  {p.createdAt ? p.createdAt.toLocaleDateString() : "—"}
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(p.id)}
                    className="rounded border border-slate-300 px-2 py-0.5 text-[11px] hover:bg-slate-50"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}

            {posts.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-sm text-slate-500"
                >
                  Now no blog posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
