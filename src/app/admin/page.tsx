
import Link from "next/link";

const quickLinks = [
  {
    href: "/admin/subscriptions",
    title: "Subscriptions",
    desc: "Pro / Premium plan, PayPal & bKash payments.",
  },
  {
    href: "/admin/intakes",
    title: "Intakes",
    desc: "Client intake form submissions দেখুন & status update করুন।",
  },
  {
    href: "/admin/payments",
    title: "Payments",
    desc: "bKash / PayPal transaction log ও manual verification.",
  },
  {
    href: "/admin/users",
    title: "Users",
    desc: "সব registered user, plan, signup তারিখ এক জায়গায় দেখুন।",
  },
  {
    href: "/admin/blog",
    title: "Blog",
    desc: "নতুন blog post publish করুন, category ও SEO manage করুন.",
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">
        Admin Panel
      </h1>
      <p className="text-sm text-slate-600 mb-6">
        এখানে শুধু Shah Mubaruk internal কাজগুলো manage করবেন — subscriptions,
        payments, intake form, blog ইত্যাদি। বাম পাশের মেনু (AdminSidebar) থেকেই সব section এ যেতে পারবেন।
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-sky-400 hover:shadow-sm transition"
          >
            <h2 className="text-sm font-semibold text-slate-900">
              {item.title}
            </h2>
            <p className="mt-1 text-xs text-slate-600">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
