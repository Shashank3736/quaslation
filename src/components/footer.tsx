import { DISCORD_INVITE_URL } from "@/lib/config"
import Link from "next/link"

const footerLinks = [
  {
    name: "Discord",
    href: DISCORD_INVITE_URL,
  },
  {
    name: "About Us",
    href: "/about",
  },
  {
    name: "Privacy Policy",
    href: "/privacy",
  },
  {
    name: "Terms of Service",
    href: "/terms-of-service",
  },
  {
    name: "Comment Policy",
    href: "/comment-policy"
  }
];

export function FooterComponent() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Quaslation. All rights reserved.
          </p>
        </div>
        <nav className="grid grid-cols-2 md:grid-cols-3 lg:flex gap-4 sm:gap-6">
          {footerLinks.map((link) => (
            <Link className="text-sm font-medium link" key={link.href} href={link.href}>
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}