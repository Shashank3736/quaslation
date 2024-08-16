import PostList from "../_components/post-list";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";

interface MyPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function Home({ searchParams }:MyPageProps) {
  const tabValue = (searchParams.tab && searchParams.tab === "premium") ? searchParams.tab : "free"
  return (
    <div className="p-4">
      <Tabs defaultValue={tabValue}>
        <TabsList className="mb-2">
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
        </TabsList>
        <TabsContent value="free">
          <PostList />
        </TabsContent>
        <TabsContent value="premium">
          <PostList premium />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const fetchCache = "force-no-store"