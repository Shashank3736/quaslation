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
    <Link href={`/novels/${novel.slug}`} className="block">
      <Card className="glass hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
        <CardHeader className="pb-4">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg mb-4">
            <Image
              src={novel.thumbnail || "/dummy/NoImageFound_light_400x600.png"}
              alt={novel.title}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              width={400}
              height={600}
            />
          </div>
          <CardTitle className="text-xl text-center text-gradient-indigo-violet">
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
