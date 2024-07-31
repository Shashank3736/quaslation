import { getLatestPosts } from "@/lib/actions";
import PostList from "./_components/post-list";
import H2 from "@/components/typography/h2";
import { Separator } from "@/components/ui/separator";

export default async function Home() {
  const posts = await getLatestPosts({})
  return (
    <main>
      <H2 className="text-center">Latest Chapters</H2>
      <Separator />
      <PostList posts={posts} />
    </main>
  );
}

export const fetchCache = "force-no-store"