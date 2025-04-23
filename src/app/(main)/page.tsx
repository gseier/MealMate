import PostEditor from "@/components/posts/editor/PostEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingFeed from "./FollowingFeed";
import ForYouFeed from "./ForYouFeed";
import TrendsSidebar from "@/components/ToFollow";

export default function Home() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      {/* Main content area */}
      <div className="w-full min-w-0 space-y-6">
        {/* Post creation */}
        <div className="rounded-2xl bg-card px-5 py-3 mb-4 text-sm font-sans">
          <PostEditor />
        </div>

        {/* Tabbed feed view */}
        <Tabs defaultValue="for-you" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="for-you">For You</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          <TabsContent value="for-you">
            <ForYouFeed />
          </TabsContent>
          <TabsContent value="following">
            <FollowingFeed />
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar */}
      <TrendsSidebar />
    </main>
  );
}
