import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function LyricChecker() {
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [result, setResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const checkLyrics = async () => {
    if (!lyrics.trim()) {
      toast.error("Cole a letra para verificar");
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading("Verificando direitos...", { id: 'check' });
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Verifique se a letra tem proteção de direitos autorais:\n\nMúsica: ${songTitle || "Desconhecida"}\nArtista: ${artist || "Desconhecido"}\n\nLetra:\n${lyrics}\n\nResponda se é protegida por copyright, recomendações de uso e avisos necessários.`
      });

      setResult(response);
      toast.success("Verificação completa!", { id: 'check' });
    } catch (error) {
      toast.error("Erro na verificação", { id: 'check' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-b from-red-500/20 to-transparent p-3 rounded-full mb-4 border border-red-500/30 inline-flex">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Verificador de Direitos</h1>
          <p className="text-gray-400">Verifique proteção de copyright em letras</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Título da Música</label>
              <Input
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                placeholder="Ex: Bohemian Rhapsody"
                className="bg-[#18181b] border-[#27272a] text-white h-10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Artista</label>
              <Input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Ex: Queen"
                className="bg-[#18181b] border-[#27272a] text-white h-10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Letra</label>
              <Textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Cole a letra aqui..."
                className="bg-[#18181b] border-[#27272a] text-white min-h-[200px]"
              />
            </div>

            <Button onClick={checkLyrics} disabled={isProcessing} className="w-full bg-red-600 hover:bg-red-500 h-12">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
              {isProcessing ? "Verificando..." : "Verificar Direitos"}
            </Button>
          </div>

          {/* Result */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
            <label className="block text-sm font-semibold mb-3">Resultado</label>
            {result ? (
              <div className="bg-[#18181b] rounded-lg p-4 text-sm text-gray-300 max-h-[400px] overflow-y-auto">
                {result}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                O resultado aparecerá aqui
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}