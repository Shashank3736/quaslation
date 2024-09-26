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
    tag: "Create Novel",
    href: "/admin/novel/create"
  }
]

const AdminPage = () => {
  return (
    <div className='m-8'>
      <H1>Admin Page</H1>
      <Separator className='my-4' />
      <div className='flex flex-wrap'>
      {links.map(link => (
        <Link key={link.tag} href={link.href} className='py-4 px-8 m-2 border rounded-lg hover:bg-secondary'>{link.tag}</Link>
      ))}
      </div>
    </div>
  )
}

export default AdminPage