import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function GrammarImprover() {
  const [originalText, setOriginalText] = useState("");
  const [improvedText, setImprovedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const improveGrammar = async () => {
    if (!originalText.trim()) {
      toast.error("Digite um texto para melhorar");
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading("Analisando texto...", { id: 'grammar' });
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Improve the following Portuguese text. Fix grammar, spelling, punctuation, and make it more clear and professional while keeping the original meaning. Return ONLY the corrected text without explanations:\n\n${originalText}`
      });

      setImprovedText(response);
      toast.success("Texto melhorado!", { id: 'grammar' });
    } catch (error) {
      toast.error("Erro ao melhorar texto", { id: 'grammar' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(improvedText);
    toast.success("Copiado!");
  };

  const swapTexts = () => {
    setOriginalText(improvedText);
    setImprovedText("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-b from-emerald-500/20 to-transparent p-3 rounded-full mb-4 border border-emerald-500/30 inline-flex">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Melhorador de Gramática</h1>
          <p className="text-gray-400">Melhore sua escrita com IA</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Text */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
            <label className="block text-sm font-semibold mb-3">Texto Original</label>
            <Textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Cole seu texto aqui..."
              className="bg-[#18181b] border-[#27272a] text-white min-h-[250px] mb-4"
              disabled={isProcessing}
            />
            <Button
              onClick={improveGrammar}
              disabled={isProcessing || !originalText.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 h-12"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              {isProcessing ? "Melhorando..." : "Melhorar Texto"}
            </Button>
          </div>

          {/* Improved Text */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
            <label className="block text-sm font-semibold mb-3">Texto Melhorado</label>
            {improvedText ? (
              <>
                <Textarea
                  value={improvedText}
                  readOnly
                  className="bg-[#18181b] border-[#27272a] text-white min-h-[250px] mb-4"
                />
                <div className="space-y-3">
                  <Button
                    onClick={copyText}
                    className="w-full bg-blue-600 hover:bg-blue-500"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                  <Button
                    onClick={swapTexts}
                    variant="outline"
                    className="w-full border-[#27272a]"
                  >
                    Melhorar Novamente
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                O texto melhorado aparecerá aqui
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}