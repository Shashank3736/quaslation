"use client";

import React, { useState, useTransition } from "react";
import {
  CACHE_INVALIDATION_PRESETS,
  CACHE_TAG_DOCUMENTATION,
  PresetKey,
} from "@/lib/cache-constants";
import {
  invalidateCustomTagsAction,
  invalidatePresetAction,
  invalidateNovelBySlugAction,
  InvalidationResult,
} from "../cache/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  RotateCw,
  Zap,
  BookOpen,
  FileText,
  Radio,
  Trash2,
  Tag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  ExternalLink,
} from "lucide-react";

export function CacheManager() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Custom tag input state
  const [customTags, setCustomTags] = useState("");
  const [customPaths, setCustomPaths] = useState("");

  // Novel slug input state
  const [novelSlug, setNovelSlug] = useState("");

  // Active operation key to track which button is currently loading
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Invalidation history / latest result
  const [latestResult, setLatestResult] = useState<InvalidationResult | null>(null);

  // Cheatsheet collapsible state
  const [showDocumentation, setShowDocumentation] = useState(false);

  // Common quick-tag chips
  const quickTagChips = [
    "novel:create",
    "novel:update",
    "novel:list",
    "novel:all",
    "chapter:all",
    "chapter:update:free",
    "chapter:update:publish",
    "releases:all",
  ];

  // Helper to handle results
  const handleActionResult = (res: InvalidationResult) => {
    setLatestResult(res);
    if (res.success) {
      toast({
        title: "Cache Reset Successful",
        description: res.message,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Cache Reset Failed",
        description: res.message,
      });
    }
  };

  // 1. Reset Custom Tags
  const handleResetCustomTags = () => {
    if (!customTags.trim()) {
      toast({
        variant: "destructive",
        title: "Tag Required",
        description: "Please enter at least one cache tag to reset.",
      });
      return;
    }

    setActiveAction("custom");
    startTransition(async () => {
      try {
        const res = await invalidateCustomTagsAction({
          tags: [customTags],
          paths: customPaths ? [customPaths] : [],
        });
        handleActionResult(res);
      } catch (error) {
        handleActionResult({
          success: false,
          message: error instanceof Error ? error.message : "Failed to reset cache.",
          invalidatedTags: [],
          invalidatedPaths: [],
          timestamp: new Date().toISOString(),
        });
      } finally {
        setActiveAction(null);
      }
    });
  };

  // 2. Reset Preset
  const handleResetPreset = (presetKey: PresetKey) => {
    setActiveAction(`preset-${presetKey}`);
    startTransition(async () => {
      try {
        const res = await invalidatePresetAction(presetKey);
        handleActionResult(res);
      } catch (error) {
        handleActionResult({
          success: false,
          message: error instanceof Error ? error.message : "Failed to reset preset cache.",
          invalidatedTags: [],
          invalidatedPaths: [],
          timestamp: new Date().toISOString(),
        });
      } finally {
        setActiveAction(null);
      }
    });
  };

  // 3. Reset Novel by Slug
  const handleResetNovel = () => {
    if (!novelSlug.trim()) {
      toast({
        variant: "destructive",
        title: "Novel Slug Required",
        description: "Please enter a novel slug (e.g. lord-of-the-mysteries).",
      });
      return;
    }

    setActiveAction("novel-slug");
    startTransition(async () => {
      try {
        const res = await invalidateNovelBySlugAction(novelSlug);
        handleActionResult(res);
      } catch (error) {
        handleActionResult({
          success: false,
          message: error instanceof Error ? error.message : "Failed to reset novel cache.",
          invalidatedTags: [],
          invalidatedPaths: [],
          timestamp: new Date().toISOString(),
        });
      } finally {
        setActiveAction(null);
      }
    });
  };

  // Add a tag to the custom input
  const addTagToInput = (tag: string) => {
    if (!customTags.trim()) {
      setCustomTags(tag);
    } else {
      const existing = customTags
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      if (!existing.includes(tag)) {
        setCustomTags(`${customTags}, ${tag}`);
      }
    }
  };

  return (
    <div className="space-y-8 my-6">
      {/* Latest Result Banner */}
      {latestResult && (
        <Card
          className={`border ${
            latestResult.success
              ? "border-green-500/30 bg-green-500/5 dark:bg-green-950/10"
              : "border-red-500/30 bg-red-500/5 dark:bg-red-950/10"
          } transition-all`}
        >
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {latestResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-sm">
                  {latestResult.success ? "Cache Invalidation Complete" : "Action Failed"}
                </p>
                <p className="text-xs text-muted-foreground">{latestResult.message}</p>
                {latestResult.invalidatedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-xs text-muted-foreground mr-1">Tags:</span>
                    {latestResult.invalidatedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {latestResult.invalidatedPaths.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="text-xs text-muted-foreground mr-1">Paths:</span>
                    {latestResult.invalidatedPaths.map((path) => (
                      <Badge key={path} variant="outline" className="text-[10px] px-1.5 py-0">
                        {path}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground shrink-0 self-end sm:self-center">
              {new Date(latestResult.timestamp).toLocaleTimeString()}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Section 1: Quick Presets (1-Click Reset) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Quick Invalidation Presets
            </h3>
            <p className="text-sm text-muted-foreground">
              One-click invalidation for common scenarios when data was pushed directly to the database.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Preset: Novels */}
          <Card className="glass border border-white/15 hover:border-white/30 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  All Novels
                </CardTitle>
                <Badge variant="outline" className="text-xs">Recommended</Badge>
              </div>
              <CardDescription className="text-xs">
                {CACHE_INVALIDATION_PRESETS.novels.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 space-y-2">
              <div className="flex flex-wrap gap-1">
                {CACHE_INVALIDATION_PRESETS.novels.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-medium"
                onClick={() => handleResetPreset("novels")}
                disabled={isPending}
              >
                {activeAction === "preset-novels" ? (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                ) : (
                  <RotateCw className="w-3.5 h-3.5 mr-2 text-blue-500" />
                )}
                Reset Novels Cache
              </Button>
            </CardFooter>
          </Card>

          {/* Preset: Chapters */}
          <Card className="glass border border-white/15 hover:border-white/30 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                All Chapters
              </CardTitle>
              <CardDescription className="text-xs">
                {CACHE_INVALIDATION_PRESETS.chapters.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 space-y-2">
              <div className="flex flex-wrap gap-1">
                {CACHE_INVALIDATION_PRESETS.chapters.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-medium"
                onClick={() => handleResetPreset("chapters")}
                disabled={isPending}
              >
                {activeAction === "preset-chapters" ? (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                ) : (
                  <RotateCw className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                )}
                Reset Chapters Cache
              </Button>
            </CardFooter>
          </Card>

          {/* Preset: Releases */}
          <Card className="glass border border-white/15 hover:border-white/30 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-500" />
                Home & Releases
              </CardTitle>
              <CardDescription className="text-xs">
                {CACHE_INVALIDATION_PRESETS.releases.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 space-y-2">
              <div className="flex flex-wrap gap-1">
                {CACHE_INVALIDATION_PRESETS.releases.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-medium"
                onClick={() => handleResetPreset("releases")}
                disabled={isPending}
              >
                {activeAction === "preset-releases" ? (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                ) : (
                  <RotateCw className="w-3.5 h-3.5 mr-2 text-violet-500" />
                )}
                Reset Home & Releases
              </Button>
            </CardFooter>
          </Card>

          {/* Preset: Sitemaps & RSS */}
          <Card className="glass border border-white/15 hover:border-white/30 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-500" />
                Sitemaps & RSS
              </CardTitle>
              <CardDescription className="text-xs">
                {CACHE_INVALIDATION_PRESETS.sitemaps.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 space-y-2">
              <div className="flex flex-wrap gap-1">
                {CACHE_INVALIDATION_PRESETS.sitemaps.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-medium"
                onClick={() => handleResetPreset("sitemaps")}
                disabled={isPending}
              >
                {activeAction === "preset-sitemaps" ? (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                ) : (
                  <RotateCw className="w-3.5 h-3.5 mr-2 text-amber-500" />
                )}
                Reset Feeds & Sitemaps
              </Button>
            </CardFooter>
          </Card>

          {/* Preset: Full Reset */}
          <Card className="glass border border-red-500/30 hover:border-red-500/50 transition-all flex flex-col justify-between md:col-span-2 lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-red-500">
                  <Trash2 className="w-4 h-4" />
                  Full Cache Reset (Nuclear Option)
                </CardTitle>
                <Badge variant="destructive" className="text-xs font-bold">Global Purge</Badge>
              </div>
              <CardDescription className="text-xs">
                {CACHE_INVALIDATION_PRESETS.all.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-xs text-muted-foreground">
                Invalidates all database query caches, page route caches, RSS feeds, and sitemaps simultaneously.
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="destructive"
                size="sm"
                className="w-full text-xs font-semibold shadow-brutal-sm"
                onClick={() => handleResetPreset("all")}
                disabled={isPending}
              >
                {activeAction === "preset-all" ? (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                )}
                Reset Everything
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Section 2: Custom Tag Invalidation */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-500" />
            Reset Cache by Tag(s)
          </h3>
          <p className="text-sm text-muted-foreground">
            Invalidate any custom tag or multiple tags (comma or space separated) used in Next.js <code className="text-xs bg-muted px-1.5 py-0.5 rounded">unstable_cache</code>.
          </p>
        </div>

        <Card className="glass border border-white/15 p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cache Tags to Invalidate</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="e.g. novel:create, novel:update, chapter:update:free"
                value={customTags}
                onChange={(e) => setCustomTags(e.target.value)}
                className="font-mono text-sm"
              />
              <Button
                onClick={handleResetCustomTags}
                disabled={isPending || !customTags.trim()}
                className="bg-gradient-to-r-indigo-violet text-white shrink-0"
              >
                {activeAction === "custom" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RotateCw className="w-4 h-4 mr-2" />
                )}
                Reset Cache
              </Button>
            </div>
          </div>

          {/* Quick chip buttons */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Click to add common tags:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickTagChips.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => addTagToInput(tag)}
                  className="text-xs h-7 px-2.5 rounded-full hover:bg-accent/70 font-mono"
                >
                  + {tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Optional path revalidation */}
          <div className="pt-2 space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">
              Optional Route Paths to Revalidate (e.g. /novels, /home)
            </label>
            <Input
              placeholder="e.g. /novels, /admin/novel"
              value={customPaths}
              onChange={(e) => setCustomPaths(e.target.value)}
              className="font-mono text-xs h-9"
            />
          </div>
        </Card>
      </section>

      <Separator />

      {/* Section 3: Reset Specific Novel */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Search className="w-5 h-5 text-pink-500" />
            Reset Specific Novel Cache
          </h3>
          <p className="text-sm text-muted-foreground">
            Targeted invalidation for a single novel and its public pages by slug.
          </p>
        </div>

        <Card className="glass border border-white/15 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Novel Slug</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="e.g. lord-of-the-mysteries"
                value={novelSlug}
                onChange={(e) => setNovelSlug(e.target.value)}
                className="font-mono text-sm"
              />
              <Button
                onClick={handleResetNovel}
                disabled={isPending || !novelSlug.trim()}
                variant="outline"
                className="shrink-0"
              >
                {activeAction === "novel-slug" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RotateCw className="w-4 h-4 mr-2 text-pink-500" />
                )}
                Reset Novel Cache
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Invalidates <code className="text-[11px] bg-muted px-1 py-0.5 rounded">novel:update:{`{slug}`}</code>, catalog listings, and revalidates <code className="text-[11px] bg-muted px-1 py-0.5 rounded">/novels/{`{slug}`}</code>.
            </p>
          </div>
        </Card>
      </section>

      <Separator />

      {/* Section 4: Tag Reference & Documentation */}
      <section className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setShowDocumentation(!showDocumentation)}
          className="w-full flex items-center justify-between p-4 glass border border-white/15 hover:bg-accent/40 rounded-lg h-auto"
        >
          <div className="flex items-center gap-2 text-left">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="font-semibold block">Cache Tag Reference & Cheatsheet</span>
              <span className="text-xs text-muted-foreground block">
                Overview of all cache tags used in Quaslation and which pages/queries they invalidate.
              </span>
            </div>
          </div>
          {showDocumentation ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </Button>

        {showDocumentation && (
          <Card className="glass border border-white/15 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-muted/30">
                    <th className="p-3 font-semibold">Cache Tag</th>
                    <th className="p-3 font-semibold">Description</th>
                    <th className="p-3 font-semibold">Used In</th>
                    <th className="p-3 font-semibold">When to Invalidate</th>
                    <th className="p-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {CACHE_TAG_DOCUMENTATION.map((item) => (
                    <tr key={item.tag} className="hover:bg-accent/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-indigo-400 whitespace-nowrap">
                        {item.tag}
                      </td>
                      <td className="p-3 text-muted-foreground max-w-xs">{item.description}</td>
                      <td className="p-3 font-mono text-[11px] text-muted-foreground max-w-xs">
                        {item.usedIn.join(", ")}
                      </td>
                      <td className="p-3 text-muted-foreground">{item.recommendedFor}</td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[11px]"
                          onClick={() => {
                            addTagToInput(item.tag);
                            window.scrollTo({ top: 400, behavior: "smooth" });
                          }}
                        >
                          Use Tag
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
