import H2 from '@/components/typography/h2'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getAdminChapters, getNovels, prisma } from '@/lib/prisma/query'
import { DropdownMenuContent } from '@radix-ui/react-dropdown-menu'
import Link from 'next/link'
import React from 'react'
import { ChaptersTable } from './table'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'

const AdminChapters = async ({ searchParams }: { searchParams?: { novel?: string, page?: string }}) => {
  const option: { novelId?: string, skip?: number} = {}
  let page = 1
  if(searchParams) {
    if(searchParams.novel) {
      option.novelId = searchParams.novel
    }
    if(searchParams.page) {
      page = parseInt(searchParams.page)-1;
      if(page < 1) page = 1
      option.skip = page*25
    }
  }
  const chapters = await getAdminChapters(option)
  const novels = await getNovels()
  return (
    <div className='px-4 py-8'>
      <H2 className='text-center'>Chapters</H2>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"outline"}>
            {searchParams?.novel ? 
              novels.find(novel => novel.id === searchParams.novel)?.title ?? "Choose":
              "Choose"
            }
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='flex flex-col bg-background z-10'>
          {novels.map(novel => (
            <DropdownMenuItem key={novel.id} className='p-4' asChild>
              <Link href={`?novel=${novel.id}`}>{novel.title}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ChaptersTable chapters={chapters} />
    </div>
  )
}

export default AdminChapters