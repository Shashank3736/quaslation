"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Copy, ArrowRightLeft } from "lucide-react"
import { useToast } from "./ui/use-toast"
import { translateText } from "@/app/(main)/translate/translate"

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Japanese",
  "Korean",
  "Chinese"
]

export function TranslationTool() {
  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [sourceLanguage, setSourceLanguage] = useState("English")
  const [targetLanguage, setTargetLanguage] = useState("Spanish")
  const [isTranslating, setIsTranslating] = useState(false)
  const { toast } = useToast()

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to translate.",
        variant: "destructive",
      })
      return
    }

    if (sourceLanguage === targetLanguage) {
      toast({
        title: "Error",
        description: "Source and target languages cannot be the same.",
        variant: "destructive",
      })
      return
    }

    setIsTranslating(true)
    try {
      const result = await translateText(inputText, sourceLanguage, targetLanguage)
      setTranslatedText(result.translatedText)
      toast({
        title: "Success",
        description: "Text translated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to translate text. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSwapLanguages = () => {
    // Capture current values before swapping
    const currentSource = sourceLanguage;
    const currentTarget = targetLanguage;
    const currentInput = inputText;
    const currentTranslated = translatedText;

    // Swap languages and text
    setSourceLanguage(currentTarget);
    setTargetLanguage(currentSource);
    setInputText(currentTranslated);
    setTranslatedText(currentInput);
  }

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Text copied to clipboard!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Translate Text</h2>
        <p className="text-muted-foreground">Enter your text below and translate it to your desired language</p>
      </div>

      {/* Language Selection */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
        <div className="w-full sm:w-48">
          <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="icon" onClick={handleSwapLanguages} className="shrink-0 bg-transparent">
          <ArrowRightLeft className="h-4 w-4" />
        </Button>

        <div className="w-full sm:w-48">
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Translation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {sourceLanguage}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => handleCopyToClipboard(inputText)} disabled={!inputText}>
              <Copy className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter text to translate..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] resize-none"
              maxLength={5000}
            />
            <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
              <span>{inputText.length}/5000</span>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {targetLanguage}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyToClipboard(translatedText)}
              disabled={!translatedText}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] p-3 rounded-md border bg-muted/50 text-sm">
              {isTranslating ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Translating...</span>
                </div>
              ) : translatedText ? (
                <p className="whitespace-pre-wrap">{translatedText}</p>
              ) : (
                <p className="text-muted-foreground">Translation will appear here...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Translate Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleTranslate}
          disabled={isTranslating || !inputText.trim()}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isTranslating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Translating...
            </>
          ) : (
            "Translate"
          )}
        </Button>
      </div>
    </div>
  )
}
