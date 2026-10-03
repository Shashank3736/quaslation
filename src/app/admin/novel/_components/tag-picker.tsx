"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { upsertTag } from "./tag-actions";

export interface TagOption {
  id: number;
  slug: string;
  name: string;
}

/**
 * Admin tag picker for the novel create/edit forms. Existing tags toggle on/off;
 * typing a new name and pressing "Add" creates the tag through `upsertTag` and
 * selects it. The selection is mirrored into a hidden input so the server action
 * receives plain form data (`tagIds` as a comma-separated list).
 */
export function TagPicker({
  allTags,
  initialSelected,
  fieldName = "tagIds",
  onChange,
}: {
  allTags: TagOption[];
  initialSelected: number[];
  fieldName?: string;
  /**
   * When provided, the picker becomes controlled-through-callback: every toggle/add
   * reports the new selection so a react-hook-form can include it in its payload,
   * while `fieldName` is omitted (no hidden input rendered).
   */
  onChange?: (selected: number[]) => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [options, setOptions] = useState<TagOption[]>(allTags);
  const [selected, setSelected] = useState<number[]>(initialSelected);
  const [draft, setDraft] = useState("");

  function commit(next: number[]) {
    setSelected(next);
    onChange?.(next);
  }

  function toggle(tagId: number) {
    commit(
      selected.includes(tagId)
        ? selected.filter((id) => id !== tagId)
        : [...selected, tagId]
    );
  }

  function addTag() {
    const name = draft.trim();
    if (!name) return;
    startTransition(async () => {
      try {
        const tag = await upsertTag(name);
        setOptions((current) =>
          current.some((option) => option.id === tag.id)
            ? current
            : [...current, tag].sort((a, b) => a.name.localeCompare(b.name))
        );
        commit(selected.includes(tag.id) ? selected : [...selected, tag.id]);
        setDraft("");
      } catch (error) {
        toast({
          description: error instanceof Error ? error.message : "Could not create tag.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="space-y-2">
      {onChange ? null : <input type="hidden" name={fieldName} value={selected.join(",")} />}
      {options.length > 0 ? (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Novel tags">
          {options.map((option) => {
            const active = selected.includes(option.id);
            return (
              <button key={option.id} aria-pressed={active} type="button" onClick={() => toggle(option.id)}>
                <Badge variant={active ? "default" : "outline"}>
                  {active ? <X className="mr-1 h-3 w-3" aria-hidden="true" /> : null}
                  {option.name}
                </Badge>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No tags yet — create the first one below.
        </p>
      )}
      <div className="flex gap-2">
        <Input
          aria-label="New tag name"
          maxLength={40}
          placeholder="New tag, e.g. xianxia"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag();
            }
          }}
        />
        <Button disabled={isPending || !draft.trim()} type="button" variant="secondary" onClick={addTag}>
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
          Add
        </Button>
      </div>
    </div>
  );
}
