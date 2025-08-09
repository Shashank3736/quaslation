import H1 from '@/components/typography/h1'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

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
  }
]

const AdminPage = () => {
  return (
    <div className='m-8'>
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
  )
}

export default AdminPage