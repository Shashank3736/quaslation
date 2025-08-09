import { getNovelList } from "@/lib/db/query"
import Link from "next/link"

const AdminChapters = async () => {
  const novels = await getNovelList()
  return (
    <div className='m-4 flex flex-col space-y-2'>
      {novels.map(novel => (
        <Link key={novel.id} href={`/admin/chapters/${novel.id}`} className="glass p-4 rounded-lg border border-white/15 hover:bg-accent/50 transition-colors block">
          <span className="font-medium">{novel.title}</span>
        </Link>
      ))}
      <Link href={"/admin/chapters/all"} className="glass p-4 rounded-lg border border-white/15 hover:bg-accent/50 transition-colors block">
        <span className="font-medium">All Chapters</span>
      </Link>
    </div>
  )
}

export default AdminChapters