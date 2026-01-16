import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

export default function GifGenerator() {
  const [prompt, setPrompt] = useState("");
  const [gif, setGif] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateGif = async () => {
    if (!prompt.trim()) {
      toast.error("Descreva a animação que deseja");
      return;
    }

    setIsGenerating(true);
    try {
      toast.loading("Gerando GIF animado...", { id: 'gif' });
      
      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Create an animated GIF with the following: ${prompt}. Smooth animation, loop seamless, vibrant colors, 2-3 seconds duration.`
      });

      setGif(response.url);
      toast.success("GIF gerado!", { id: 'gif' });
    } catch (error) {
      toast.error("Erro ao gerar GIF", { id: 'gif' });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadGif = async () => {
    if (!gif) return;
    const response = await fetch(gif);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `animacao-${Date.now()}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success("GIF baixado!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-b from-yellow-500/20 to-transparent p-3 rounded-full mb-4 border border-yellow-500/30 inline-flex">
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Gerar Animação GIF</h1>
          <p className="text-gray-400">Crie GIFs animados e divertidos com IA</p>
        </div>

        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3">Descreva a animação</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Um unicórnio pulando nas nuvens com arco-íris..."
                className="bg-[#18181b] border-[#27272a] text-white min-h-[100px]"
              />
            </div>

            {!gif ? (
              <Button onClick={generateGif} disabled={isGenerating} className="w-full bg-yellow-600 hover:bg-yellow-500 h-12">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                {isGenerating ? "Gerando..." : "Gerar GIF"}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="bg-black rounded-xl p-4 flex items-center justify-center">
                  <img src={gif} alt="GIF Animado" className="max-w-full h-auto rounded" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={downloadGif} className="bg-green-600 hover:bg-green-500">
                    Baixar
                  </Button>
                  <Button onClick={() => {setGif(null); setPrompt("");}} variant="outline" className="border-[#27272a]">
                    Novo GIF
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}