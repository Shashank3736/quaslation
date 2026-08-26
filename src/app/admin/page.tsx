import H1 from '@/components/typography/h1'
import H2 from '@/components/typography/h2'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { CacheManager } from './_components/cache-manager'

const links = [
  {
    tag: "Back to Main",
    href: "/"
  }, {
    tag: "Chapters",
    href: "/admin/chapters"
  }, {
    tag: "Novel",
    href: "/admin/novel"
  }, {
    tag: "Comments",
    href: "/admin/comments"
  }, {
    tag: "Cache Reset",
    href: "#cache-management"
  }
]

const AdminPage = () => {
  return (
    <div className='m-8 space-y-8'>
      <div>
        <H1 className="text-gradient-indigo-violet">Admin Page</H1>
        <Separator className='my-4' />
        <div className='flex flex-wrap gap-4'>
        {links.map(link => (
          <Link key={link.tag} href={link.href} className='glass py-4 px-8 m-2 rounded-lg border border-white/15 hover:bg-accent/50 transition-colors block text-center min-w-[150px]'>
            <span className="font-medium">{link.tag}</span>
          </Link>
        ))}
        </div>
      </div>

      <div id="cache-management" className="pt-4 scroll-mt-6">
        <H2 className="text-gradient-indigo-violet">Cache Management & Tag Invalidation</H2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Reset unstable_cache entries when new novels or chapters are pushed directly to the database.
        </p>
        <Separator className='my-4' />
        <CacheManager />
      </div>
    </div>
  )
}

export default AdminPage