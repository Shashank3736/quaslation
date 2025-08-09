"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Copy, ArrowRightLeft, Search } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "./ui/use-toast"
import { translateText } from "@/app/(main)/translate/translate"

const allLanguages = [
  { code: "auto", name: "Auto Detect" },
  { code: "en", name: "English" },
  { code: "zh", name: "Chinese" },
  { code: "zh-tw", name: "Traditional Chinese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "pt", name: "Portuguese" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "he", name: "Hebrew" },
  { code: "my", name: "Burmese" },
  { code: "ta", name: "Tamil" },
  { code: "ur", name: "Urdu" },
  { code: "bn", name: "Bengali" },
  { code: "pl", name: "Polish" },
  { code: "nl", name: "Dutch" },
  { code: "ro", name: "Romanian" },
  { code: "tr", name: "Turkish" },
  { code: "km", name: "Khmer" },
  { code: "lo", name: "Lao" },
  { code: "yue", name: "Cantonese" },
  { code: "cs", name: "Czech" },
  { code: "el", name: "Greek" },
  { code: "sv", name: "Swedish" },
  { code: "hu", name: "Hungarian" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "uk", name: "Ukrainian" },
  { code: "bg", name: "Bulgarian" },
  { code: "sr", name: "Serbian" },
  { code: "te", name: "Telugu" },
  { code: "af", name: "Afrikaans" },
  { code: "hy", name: "Armenian" },
  { code: "as", name: "Assamese" },
  { code: "ast", name: "Asturian" },
  { code: "eu", name: "Basque" },
  { code: "be", name: "Belarusian" },
  { code: "bs", name: "Bosnian" },
  { code: "ca", name: "Catalan" },
  { code: "ceb", name: "Cebuano" },
  { code: "hr", name: "Croatian" },
  { code: "arz", name: "Egyptian Arabic" },
  { code: "et", name: "Estonian" },
  { code: "gl", name: "Galician" },
  { code: "ka", name: "Georgian" },
  { code: "gu", name: "Gujarati" },
  { code: "is", name: "Icelandic" },
  { code: "jv", name: "Javanese" },
  { code: "kn", name: "Kannada" },
  { code: "kk", name: "Kazakh" },
  { code: "lv", name: "Latvian" },
  { code: "lt", name: "Lithuanian" },
  { code: "lb", name: "Luxembourgish" },
  { code: "mk", name: "Macedonian" },
  { code: "mai", name: "Maithili" },
  { code: "mt", name: "Maltese" },
  { code: "mr", name: "Marathi" },
  { code: "acm", name: "Mesopotamian Arabic" },
  { code: "ary", name: "Moroccan Arabic" },
  { code: "ars", name: "Najdi Arabic" },
  { code: "ne", name: "Nepali" },
  { code: "az", name: "North Azerbaijani" },
  { code: "apc", name: "North Levantine Arabic" },
  { code: "uz", name: "Northern Uzbek" },
  { code: "nb", name: "Norwegian Bokmål" },
  { code: "nn", name: "Norwegian Nynorsk" },
  { code: "oc", name: "Occitan" },
  { code: "or", name: "Odia" },
  { code: "pag", name: "Pangasinan" },
  { code: "scn", name: "Sicilian" },
  { code: "sd", name: "Sindhi" },
  { code: "si", name: "Sinhala" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "ajp", name: "South Levantine Arabic" },
  { code: "sw", name: "Swahili" },
  { code: "tl", name: "Tagalog" },
  { code: "acq", name: "Ta'izzi-Adeni Arabic" },
  { code: "als", name: "Tosk Albanian" },
  { code: "aeb", name: "Tunisian Arabic" },
  { code: "vec", name: "Venetian" },
  { code: "war", name: "Waray" },
  { code: "cy", name: "Welsh" },
  { code: "fa", name: "Western Persian" },
]

// Source languages include Auto Detect
const sourceLanguages = allLanguages
// Target languages exclude Auto Detect
const targetLanguages = allLanguages.filter((lang) => lang.code !== "auto")

interface LanguageSelectorProps {
  value: string
  onValueChange: (value: string) => void
  languages: typeof allLanguages
  placeholder: string
}

export function LanguageSelector({ value, onValueChange, languages, placeholder }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedLanguage = languages.find((lang) => lang.code === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent"
        >
          {selectedLanguage ? selectedLanguage.name : placeholder}
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search languages..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.code}
                  value={`${language.name} ${language.code}`} // This allows searching by both name and code
                  onSelect={() => {
                    onValueChange(language.code) // Pass the actual language code
                    setOpen(false)
                  }}
                >
                  {language.name} ({language.code})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function TranslationTool() {
  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [sourceLanguageCode, setSourceLanguageCode] = useState("auto")
  const [targetLanguageCode, setTargetLanguageCode] = useState("es")
  const [sourceLanguageName, setSourceLanguageName] = useState("Auto Detect")
  const [targetLanguageName, setTargetLanguageName] = useState("Spanish")
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

    if (sourceLanguageCode === targetLanguageCode) {
      toast({
        title: "Error",
        description: "Source and target languages cannot be the same.",
        variant: "destructive",
      })
      return
    }

    setIsTranslating(true)
    try {
      // Get language names from their codes
      const sourceLang = sourceLanguages.find(lang => lang.code === sourceLanguageCode) || { name: sourceLanguageCode }
      const targetLang = targetLanguages.find(lang => lang.code === targetLanguageCode) || { name: targetLanguageCode }
      
      // Pass language names to translateText function
      const result = await translateText(inputText, sourceLang.name, targetLang.name)
      setTranslatedText(result.translatedText)
      
      // Update language name states
      setSourceLanguageName(sourceLang.name)
      setTargetLanguageName(targetLang.name)
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
    // Only swap if source is not Auto Detect
    if (sourceLanguageCode !== "auto") {
      // Swap language codes
      const newSourceCode = targetLanguageCode
      const newTargetCode = sourceLanguageCode
      setSourceLanguageCode(newSourceCode)
      setTargetLanguageCode(newTargetCode)
      
      // Swap language names
      const newSourceName = targetLanguageName
      const newTargetName = sourceLanguageName
      setSourceLanguageName(newSourceName)
      setTargetLanguageName(newTargetName)
      setInputText(translatedText)
      setTranslatedText(inputText)
    } else {
      toast({
        title: "Cannot swap",
        description: "Cannot swap when Auto Detect is selected.",
        variant: "destructive",
      })
    }
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
        <div className="w-full sm:w-64">
          <LanguageSelector
            value={sourceLanguageCode}
            onValueChange={(code) => {
              setSourceLanguageCode(code)
              const lang = sourceLanguages.find(l => l.code === code)
              if (lang) setSourceLanguageName(lang.name)
            }}
            languages={sourceLanguages}
            placeholder="Select source language"
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleSwapLanguages}
          className="shrink-0 bg-transparent"
          disabled={sourceLanguageCode === "auto"}
        >
          <ArrowRightLeft className="h-4 w-4" />
        </Button>

        <div className="w-full sm:w-64">
          <LanguageSelector
            value={targetLanguageCode}
            onValueChange={(code) => {
              setTargetLanguageCode(code)
              const lang = targetLanguages.find(l => l.code === code)
              if (lang) setTargetLanguageName(lang.name)
            }}
            languages={targetLanguages}
            placeholder="Select target language"
          />
        </div>
      </div>

      {/* Translation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {sourceLanguageName}
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
              {targetLanguageName}
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
