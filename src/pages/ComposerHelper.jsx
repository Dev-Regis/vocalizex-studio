import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Music } from "lucide-react";
import { toast } from "sonner";

export default function ComposerHelper() {
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState("");
  const [concept, setConcept] = useState("");
  const [currentLyrics, setCurrentLyrics] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const generateSuggestions = async () => {
    if (!title.trim() && !currentLyrics.trim()) {
      toast.error("Preencha o título ou cole a letra atual");
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading("Analisando composição...", { id: 'compose' });
      
      const prompt = currentLyrics 
        ? `Melhore esta letra de música:\n\nTítulo: ${title}\nEstilo: ${style}\nConceito: ${concept}\n\nLetra atual:\n${currentLyrics}\n\nSugestões:\n- Melhore a rima e métrica\n- Torne mais criativo e impactante\n- Mantenha a mensagem principal\n- Retorne a letra melhorada`
        : `Escreva uma composição para:\n\nTítulo: ${title}\nEstilo: ${style}\nConceito: ${concept}\n\nCrie uma música completa com versos, pré-refrão e refrão. Seja criativo e profissional.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt
      });

      setSuggestion(response);
      toast.success("Sugestões geradas!", { id: 'compose' });
    } catch (error) {
      toast.error("Erro ao gerar sugestões", { id: 'compose' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copySuggestion = () => {
    navigator.clipboard.writeText(suggestion);
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
          <div className="bg-gradient-to-b from-pink-500/20 to-transparent p-3 rounded-full mb-4 border border-pink-500/30 inline-flex">
            <Music className="w-8 h-8 text-pink-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Assistente de Compositor</h1>
          <p className="text-gray-400">Crie e melhore suas composições com IA</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Título da Música</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Coração Partido"
                className="bg-[#18181b] border-[#27272a] text-white h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Estilo/Gênero</label>
              <Input
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="Ex: Sertanejo, Trap, Samba..."
                className="bg-[#18181b] border-[#27272a] text-white h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Conceito/Vibe</label>
              <Input
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Ex: Amor, Tristeza, Liberdade..."
                className="bg-[#18181b] border-[#27272a] text-white h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Letra Atual (Opcional)</label>
              <Textarea
                value={currentLyrics}
                onChange={(e) => setCurrentLyrics(e.target.value)}
                placeholder="Cole sua letra para melhorias..."
                className="bg-[#18181b] border-[#27272a] text-white min-h-[180px]"
              />
            </div>

            <Button 
              onClick={generateSuggestions} 
              disabled={isProcessing}
              className="w-full bg-pink-600 hover:bg-pink-500 h-12"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Music className="w-4 h-4 mr-2" />}
              {isProcessing ? "Criando..." : "Gerar Composição"}
            </Button>
          </div>

          {/* Output */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
            <label className="block text-sm font-semibold mb-3">Sugestões da IA</label>
            {suggestion ? (
              <div className="space-y-3">
                <Textarea
                  value={suggestion}
                  readOnly
                  className="bg-[#18181b] border-[#27272a] text-white min-h-[380px]"
                />
                <Button onClick={copySuggestion} className="w-full bg-blue-600 hover:bg-blue-500">
                  Copiar Composição
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-500">
                A composição aparecerá aqui
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}