"use client"

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getAdminChapters } from '@/lib/prisma/query'
import React from 'react'
import { publishMany, unpublishMany } from './actions'
import { shortifyString } from '@/lib/utils'

export const ChaptersTable = ({ chapters }:{ chapters: Awaited<ReturnType<typeof getAdminChapters>>}) => {
  return (
    <Table>
      <TableCaption>A list of recent chapters</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Novel</TableHead>
          <TableHead>Volume</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {chapters.map(chapter => (
          <TableRow key={chapter.id}>
            <TableCell>{shortifyString(chapter.novel.title, 32)}</TableCell>
            <TableCell>{chapter.volume.number}</TableCell>
            <TableCell>{shortifyString(`${chapter.number}. ${chapter.title}`, 16)}</TableCell>
            <TableCell>{chapter.publishedAt ? "PUBLISHED": "DRAFT"}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"outline"}>Action</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                  {chapter.publishedAt ? (
                    <Button onClick={() => unpublishMany(chapter.novel.id, chapter.serial)}>Unpublish</Button>
                  ):(
                    <Button onClick={() => publishMany(chapter.novel.id, chapter.serial)}>Publish</Button>
                  )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
