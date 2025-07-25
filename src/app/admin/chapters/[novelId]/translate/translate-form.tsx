"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export function TranslateChaptersForm({ novelId }: { novelId: number }) {
  const [language, setLanguage] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsTranslating(true);
    try {
      // Call API route to handle translation
      const response = await fetch(`/api/novels/${novelId}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetLanguage: language }),
      });
      
      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
      }
      
      toast({
        title: "Translation Complete",
        description: `All chapters translated to ${language}`
      });
    } catch (error) {
      toast({
        title: "Translation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="language">Target Language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
            <SelectItem value="ja">Japanese</SelectItem>
            <SelectItem value="zh">Chinese</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button
        onClick={handleSubmit}
        disabled={isTranslating}
      >
        {isTranslating ? "Translating..." : "Start Translation"}
      </Button>
    </div>
  );
}