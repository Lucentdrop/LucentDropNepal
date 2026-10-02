"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  ClipboardList,
  MessageSquare,
  Heart,
  Newspaper,
  User,
  BarChart3,
  LogOut,
  LockKeyhole,
} from "lucide-react";
import { useAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
const links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Technical Documents", href: "/dashboard/documents", icon: FileText },
  { name: "RFQs", href: "/dashboard/quotations", icon: ClipboardList },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Saved Products", href: "/dashboard/saved-products", icon: Heart },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Latest Updates", href: "/dashboard/updates", icon: Newspaper },
  { name: "Account", href: "/dashboard/account", icon: User },
];
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { member, loading, signOut } = useAuth();
  const path = usePathname();
  const router = useRouter();
  if (loading)
    return (
      <section className="container section">
        <div
          className="skeleton image"
          role="status"
          aria-label="Loading member workspace"
        />
      </section>
    );
  if (!member)
    return (
      <section className="container section">
        <div className="login-gate">
          <span className="soft-icon">
            <LockKeyhole />
          </span>
          <h1>Welcome to your member workspace</h1>
          <p>
            Sign in to manage saved products, technical documents and quotation
            requests.
          </p>
          <Button asChild>
            <Link href={`/login?next=${encodeURIComponent(path)}`}>
              Sign In or Preview Demo
            </Link>
          </Button>
        </div>
      </section>
    );
  return (
    <div className="dashboard-shell">
      <div className="container dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="sidebar-heading">Member Workspace</div>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={path === l.href ? "active" : ""}
            >
              <l.icon size={16} />
              {l.name}
            </Link>
          ))}
          <button
            className="signout"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </aside>
        <div>
          {member.isDemo && (
            <div className="notice">
              Demo workspace · Saved products and requests stay on this device.
              Charts use local mock data.
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
export function DashboardHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { member } = useAuth();
  return (
    <div className="dashboard-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <span className="member-avatar" aria-label={member?.fullName}>
        {member?.fullName.slice(0, 1).toUpperCase()}
      </span>
    </div>
  );
}
