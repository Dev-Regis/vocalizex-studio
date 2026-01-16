import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Globe, Copy } from "lucide-react";
import { toast } from "sonner";

export default function TextTranslator() {
  const [text, setText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [translated, setTranslated] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const languages = {
    pt: "Português",
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    it: "Italiano",
    ja: "日本語",
    ko: "한국어",
    zh: "中文",
    ar: "العربية"
  };

  const translate = async () => {
    if (!text.trim()) {
      toast.error("Digite o texto a traduzir");
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading("Traduzindo...", { id: 'translate' });
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following text to ${languages[targetLanguage]}. Return ONLY the translated text:\n\n${text}`
      });

      setTranslated(response);
      toast.success("Tradução completa!", { id: 'translate' });
    } catch (error) {
      toast.error("Erro na tradução", { id: 'translate' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(translated);
    toast.success("Copiado!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-b from-blue-500/20 to-transparent p-3 rounded-full mb-4 border border-blue-500/30 inline-flex">
            <Globe className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Tradutor de Texto</h1>
          <p className="text-gray-400">Traduza para vários idiomas instantaneamente</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Text */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
            <label className="block text-sm font-semibold mb-3">Texto Original</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cole seu texto aqui..."
              className="bg-[#18181b] border-[#27272a] text-white min-h-[280px] mb-4"
              disabled={isProcessing}
            />
          </div>

          {/* Translation */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Traduzir para:</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="bg-[#18181b] border-[#27272a]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languages).map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {translated && (
              <Textarea
                value={translated}
                readOnly
                className="bg-[#18181b] border-[#27272a] text-white min-h-[228px]"
              />
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-center">
          <Button onClick={translate} disabled={isProcessing || !text.trim()} className="bg-blue-600 hover:bg-blue-500 px-8 h-12">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
            {isProcessing ? "Traduzindo..." : "Traduzir"}
          </Button>
          {translated && (
            <Button onClick={copyText} variant="outline" className="border-[#27272a]">
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}