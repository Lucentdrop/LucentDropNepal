"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search, ArrowUpRight } from "lucide-react";
import Image from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers";
import { navigation } from "@/lib/constants/navigation";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Lucent Drop Nepal home">
      <Image
        className="brand-logo"
        src="/images/lucent-logo.png"
        alt="Lucent Drop Nepal company logo"
        width={40}
        height={61}
      />
      <span>
        <strong>Lucent Drop Nepal</strong>
        <small>One-Stop Water Solution</small>
      </span>
    </Link>
  );
}
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { member } = useAuth();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav
          className={open ? "main-nav open" : "main-nav"}
          aria-label="Main navigation"
        >
          {navigation.map(([name, href]) => (
            <Link
              key={href}
              href={href}
              className={
                (href === "/" ? path === href : path.startsWith(href))
                  ? "active"
                  : ""
              }
              onClick={() => setOpen(false)}
            >
              {name}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link
            href="/products?search=1"
            className="icon-button"
            aria-label="Search products"
          >
            <Search size={18} />
          </Link>
          {member ? (
            <Button asChild size="sm">
              <Link href="/dashboard">
                My Dashboard <ArrowUpRight size={14} />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
          <button
            className="mobile-menu icon-button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
