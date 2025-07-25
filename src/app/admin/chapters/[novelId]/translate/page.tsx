import { getNovel } from "@/lib/db/query";
import { notFound } from "next/navigation";
import { TranslateChaptersForm } from "./translate-form";

export default async function TranslateChaptersPage({
  params
}: {
  params: Promise<{ novelId: string }>
}) {
  const paramsResolved = await params;
  const novelId = parseInt(paramsResolved.novelId);
  if (isNaN(novelId)) notFound();

  const novel = await getNovel(novelId);
  if (!novel) notFound();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        Translate Chapters: {novel.title}
      </h1>
      <TranslateChaptersForm novelId={novelId} />
    </div>
  );
}