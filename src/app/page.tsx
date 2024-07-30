import { getLatestPosts } from "@/lib/actions";
import PostList from "./_components/post-list";

export default async function Home() {
  const posts = await getLatestPosts({})
  return (
    <main>
      <h1>Latest Chapters</h1>
      <PostList posts={posts} />
    </main>
  );
}
