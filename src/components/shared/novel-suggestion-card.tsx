import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { truncateText } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface NovelSuggestionCardProps {
  novel: {
    slug: string
    title: string
    thumbnail: string | null
    description: string
  }
}

export default function NovelSuggestionCard({ novel }: NovelSuggestionCardProps) {
  return (
    <Link href={`/novels/${novel.slug}`} className="block group">
      <Card className="border-brutal border-black shadow-brutal-lg hover:shadow-brutal-xl hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-200 h-full relative overflow-hidden bg-background">
        {/* Colorful accent corner - top-right triangle */}
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[60px] border-l-transparent border-t-[60px] border-t-brutal-cyan z-10" />
        
        <CardHeader className="pb-4">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg mb-4 border-brutal border-black shadow-brutal-sm">
            <Image
              src={novel.thumbnail || "/dummy/NoImageFound_light_400x600.png"}
              alt={novel.title}
              className="object-cover w-full h-full"
              width={400}
              height={600}
            />
          </div>
          <CardTitle className="text-xl text-center font-bold">
            {novel.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground text-center">
            {truncateText(novel.description, 150)}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
