import H1 from "@/components/typography/h1";
import { Separator } from "@/components/ui/separator";
import { CacheManager } from "../_components/cache-manager";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AdminCachePage() {
  return (
    <div className="m-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-gradient-indigo-violet">Cache Management</H1>
          <p className="text-sm text-muted-foreground mt-1">
            Reset Next.js unstable_cache entries, invalidate tags, and purge static route caches.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <Separator />
      <CacheManager />
    </div>
  );
}
