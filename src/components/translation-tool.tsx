"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Copy, ArrowRightLeft, Sparkles } from "lucide-react"
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-gradient-indigo-violet" />
          <h2 className="text-4xl font-bold tracking-tight text-gradient-indigo-violet">Translate Text</h2>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Enter your text below and translate it to your desired language. Join our community of translators and help bring amazing stories to readers worldwide!
        </p>
      </div>

      {/* Language Selection */}
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
            <div className="w-full sm:w-56">
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="glass-ring">
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

            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapLanguages}
              className="shrink-0 bg-transparent hover:bg-accent/50"
            >
              <ArrowRightLeft className="h-5 w-5" />
            </Button>

            <div className="w-full sm:w-56">
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="glass-ring">
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
        </CardContent>
      </Card>

      {/* Translation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="glass">
          <CardHeader className="pb-4">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium text-gradient-indigo-violet">
                {sourceLanguage}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyToClipboard(inputText)}
                disabled={!inputText}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              placeholder="Enter text to translate..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[250px] resize-none bg-background/50 border-border/50"
              maxLength={5000}
            />
            <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground">
              <span>{inputText.length}/5000 characters</span>
              <span className={inputText.length > 4500 ? "text-destructive" : ""}>
                {inputText.length > 4500 ? "Approaching limit" : "Ready to translate"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="glass">
          <CardHeader className="pb-4">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium text-gradient-indigo-violet">
                {targetLanguage}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyToClipboard(translatedText)}
                disabled={!translatedText}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="min-h-[250px] p-4 rounded-lg border border-border/50 bg-background/50 text-sm">
              {isTranslating ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-muted-foreground">Translating...</span>
                </div>
              ) : translatedText ? (
                <p className="whitespace-pre-wrap leading-relaxed">{translatedText}</p>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-2 text-muted-foreground">
                  <Sparkles className="h-6 w-6 opacity-50" />
                  <span>Translation will appear here...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Translate Button */}
      <div className="flex justify-center py-4">
        <Button
          onClick={handleTranslate}
          disabled={isTranslating || !inputText.trim()}
          size="lg"
          className="bg-gradient-to-r-indigo-violet text-white hover:opacity-90 transition-opacity px-8 text-lg"
        >
          {isTranslating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Translate Text
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
