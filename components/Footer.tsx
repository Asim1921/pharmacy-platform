import Link from 'next/link';
import { Package, MapPin, Shield } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200/70 bg-gradient-to-b from-white/80 via-gray-50/90 to-white dark:from-black dark:via-zinc-950 dark:to-black backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          {/* Brand + mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 via-teal-500 to-amber-500 flex items-center justify-center shadow-md shadow-rose-500/20">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-base font-semibold bg-gradient-to-r from-rose-500 via-teal-500 to-amber-500 bg-clip-text text-transparent">
                  PharmaHub
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Community Pharmacies Online Ordering Platform
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
              Connect with trusted community pharmacies, discover medications instantly,
              and manage your health with confidence — all in one modern platform.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100/70 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/30 text-rose-700 dark:text-rose-300">
                <Shield className="w-3 h-3" />
                Secure & private
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-100/70 dark:bg-teal-500/10 border border-teal-200/80 dark:border-teal-500/30 text-teal-700 dark:text-teal-300">
                <MapPin className="w-3 h-3" />
                Nearby pharmacies
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Platform
            </h3>
            <nav className="space-y-2 text-gray-600 dark:text-gray-400">
              <FooterLink href="/products">Browse products</FooterLink>
              <FooterLink href="/map">Find a pharmacy</FooterLink>
            </nav>
          </div>

          {/* Support / legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Support & Info
            </h3>
            <nav className="space-y-2 text-gray-600 dark:text-gray-400">
              <FooterLink href="/login">Sign in</FooterLink>
              <FooterLink href="/register">Create account</FooterLink>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200/70 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-500">
          <p>
            &copy; {year} PharmaHub. All rights reserved. Built for educational and demo purposes.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <span>Next.js • Firebase • Leaflet • Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 cursor-pointer hover:text-rose-600 dark:hover:text-rose-400 hover:underline underline-offset-4 transition-colors"
    >
      {children}
    </Link>
  );
}

