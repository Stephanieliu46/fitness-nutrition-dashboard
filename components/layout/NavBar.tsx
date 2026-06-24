"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/workout", label: "Workout Log" },
  { href: "/nutrition", label: "Nutrition" },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/"><span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">FitTrack</span></Link>
          <div className="flex gap-6">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} className={`text-sm font-medium transition-colors ${
                pathname === href ? "text-indigo-600 dark:text-indigo-400" : "text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
