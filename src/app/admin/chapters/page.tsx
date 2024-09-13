import { Button } from "@/components/ui/button"
import { getNovelList } from "@/lib/db/query"
import Link from "next/link"

const AdminChapters = async () => {
  const novels = await getNovelList()
  return (
    <div className='m-4 flex flex-col'>
      {novels.map(novel => (
        <Link key={novel.id} href={`/admin/chapters/${novel.id}`} className="hover:underline p-2">{novel.title}</Link>
      ))}
      <Link href={"/admin/chapters/all"} className="p-2 hover:underline">All Chapters</Link>
      <Button asChild><Link className="w-fit p-2" href={"novels/create"}>Create Novel +</Link></Button>
    </div>
  )
}

export default AdminChapters