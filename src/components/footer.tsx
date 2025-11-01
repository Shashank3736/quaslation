import { DISCORD_INVITE_URL } from "@/lib/config"
import Link from "next/link"
import { MessageCircle } from "lucide-react"

const footerLinks = [
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

const socialLinks = [
  {
    name: "Discord",
    href: DISCORD_INVITE_URL,
    icon: MessageCircle,
  }
];

export function FooterComponent() {
  return (
    <footer className="w-full bg-brutal-purple/10 dark:bg-brutal-purple/5 border-t-brutal-lg border-black dark:border-white">
      <div className="container flex flex-col items-center justify-between gap-6 py-10 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
          {/* Copyright Section */}
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0 md:border-r-brutal border-black dark:border-white md:pr-8">
            <p className="text-center text-sm font-bold leading-loose text-foreground md:text-left">
              &copy; {new Date().getFullYear()} Quaslation. All rights reserved.
            </p>
          </div>
          
          {/* Navigation Links Section */}
          <nav className="grid grid-cols-2 md:grid-cols-3 lg:flex gap-4 sm:gap-6 md:border-r-brutal border-black dark:border-white md:pr-8">
            {footerLinks.map((link) => (
              <Link 
                className="text-sm font-medium text-foreground hover:bg-brutal-yellow hover:shadow-brutal-sm dark:hover:bg-brutal-yellow/90 px-3 py-1.5 border-2 border-transparent hover:border-black dark:hover:border-white transition-all rounded-sm" 
                key={link.href} 
                href={link.href}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Social Icons Section */}
          <div className="flex gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-background border-brutal border-black dark:border-white rounded-sm shadow-brutal hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  aria-label={social.name}
                >
                  <Icon className="w-5 h-5 text-foreground" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}