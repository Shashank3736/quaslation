import { getSuggestedNovels } from '@/lib/db/query'
import NovelSuggestionCard from './novel-suggestion-card'

interface NovelSuggestionsProps {
  currentNovelId: number
  count?: number
}

export default async function NovelSuggestions({ 
  currentNovelId, 
  count = 3 
}: NovelSuggestionsProps) {
  const suggestions = await getSuggestedNovels({ currentNovelId, count })

  // Handle empty state by returning null if no suggestions
  if (!suggestions || suggestions.length === 0) {
    return null
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-gradient-indigo-violet mb-6">
        You May Also Like
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((novel) => (
          <NovelSuggestionCard key={novel.id} novel={novel} />
        ))}
      </div>
    </section>
  )
}
