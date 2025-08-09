import PostList from "../../_components/post-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MoveRightIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="p-4">
      {/* Latest Releases Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gradient-indigo-violet mb-4">Latest Releases</h2>
            <p className="text-lg text-muted-foreground">
              Stay up to date with our most recent translations. New chapters added regularly!
            </p>
          </div>
          
          <Tabs defaultValue="free" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="free">Latest</TabsTrigger>
              <TabsTrigger value="premium">Upcoming</TabsTrigger>
            </TabsList>
            <TabsContent value="free">
              <PostList />
            </TabsContent>
            <TabsContent value="premium">
              <PostList premium />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}

export const fetchCache = "force-no-store"