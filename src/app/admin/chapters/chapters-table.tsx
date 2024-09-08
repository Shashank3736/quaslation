"use client";

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getChapters } from '@/lib/db/query';
import { shortifyString } from '@/lib/utils';
import React from 'react'
import { freeChapter, publish } from './actions';

const WrenchSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008Z" />
  </svg>
)

export const ChaptersTable = ({ data }:{ data: Awaited<ReturnType<typeof getChapters>> }) => {
  return (
    <Table>
      <TableCaption>List of recent chapters.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Novel</TableHead>
          <TableHead>Chapter</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(chap => (
          <TableRow key={chap.id}>
            <TableCell title={chap.novel.title}>{shortifyString(chap.novel.title, 32)}</TableCell>
            <TableCell title={chap.title}>{shortifyString(`[${chap.serial}] ${chap.title}`, 16)}</TableCell>
            <TableCell>{chap.publishedAt ? "PUBLISHED": "DRAFT"}</TableCell>
            <TableCell>{chap.premium ? "Yes":"No"}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <WrenchSVG />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className='cursor-pointer' onClick={() => freeChapter(chap.novel.id, chap.serial)}>
                    Free Chapter
                  </DropdownMenuItem>
                  <DropdownMenuItem className='cursor-pointer' onClick={() => publish({ novelId: chap.novel.id, serial: chap.serial})}>
                    Publish
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
