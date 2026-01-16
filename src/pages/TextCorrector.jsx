import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function TextCorrector() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("pt");
  const [corrected, setCorrected] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const languages = {
    pt: "Português",
    en: "English",
    es: "Español"
  };

  const correctText = async () => {
    if (!text.trim()) {
      toast.error("Digite um texto para corrigir");
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading("Corrigindo texto...", { id: 'correct' });
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Correct the following ${languages[language]} text. Fix grammar, spelling, punctuation and make it more professional. Keep the original meaning. Return ONLY the corrected text:\n\n${text}`
      });

      setCorrected(response);
      toast.success("Texto corrigido!", { id: 'correct' });
    } catch (error) {
      toast.error("Erro ao corrigir", { id: 'correct' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(corrected);
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
          <div className="bg-gradient-to-b from-green-500/20 to-transparent p-3 rounded-full mb-4 border border-green-500/30 inline-flex">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Corretor de Texto</h1>
          <p className="text-gray-400">Corrija gramática em PT, EN e ES</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
            <label className="block text-sm font-semibold mb-3">Texto Original</label>
            <div className="mb-3">
              <Select value={language} onValueChange={setLanguage}>
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
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cole seu texto..."
              className="bg-[#18181b] border-[#27272a] text-white min-h-[280px]"
              disabled={isProcessing}
            />
          </div>

          {/* Corrected */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
            <label className="block text-sm font-semibold mb-3">Texto Corrigido</label>
            {corrected && (
              <Textarea
                value={corrected}
                readOnly
                className="bg-[#18181b] border-[#27272a] text-white min-h-[280px]"
              />
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-center">
          <Button onClick={correctText} disabled={isProcessing || !text.trim()} className="bg-green-600 hover:bg-green-500 px-8 h-12">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            {isProcessing ? "Corrigindo..." : "Corrigir"}
          </Button>
          {corrected && (
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