import PostList from "./_components/post-list";
import H2 from "@/components/typography/h2";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div>
      <H2 className="text-center">Latest Chapters</H2>
      <Separator />
      <PostList />
    </div>
  );
}

export const fetchCache = "force-no-store"