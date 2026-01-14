import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Download, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function ImageCreator() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Digite uma descrição da imagem");
      return;
    }

    setIsGenerating(true);
    try {
      toast.loading("Gerando imagem...", { id: 'generate' });
      
      const response = await base44.integrations.Core.GenerateImage({
        prompt: prompt + " Crie uma imagem de alta qualidade, profissional e realista."
      });

      const imageUrl = response.url || response.file_url || response;
      setImage(imageUrl);
      toast.success("Imagem gerada com sucesso!", { id: 'generate' });
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao gerar imagem", { id: 'generate' });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!image) return;
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `imagem-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Imagem baixada!");
    } catch (error) {
      toast.error("Erro ao baixar imagem");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-blue-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <Link 
            to={createPageUrl("Home")} 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>

          <div className="text-center">
            <div className="bg-gradient-to-b from-blue-500/20 to-transparent p-3 rounded-full mb-4 border border-blue-500/30 inline-flex">
              <ImageIcon className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-black mb-2">Criar Imagens</h1>
            <p className="text-gray-400">Gere imagens incríveis com IA a partir de descrições</p>
          </div>
        </header>

        {/* Input Area */}
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 mb-8">
          <label className="block text-sm font-semibold mb-3">Descreva a imagem que deseja gerar</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Uma montanha com neve ao pôr do sol, céu com cores quentes..."
            className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[120px] mb-4"
            disabled={isGenerating}
          />
          
          <Button
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 py-6 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Gerando imagem...
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5 mr-2" />
                Gerar Imagem
              </>
            )}
          </Button>
        </div>

        {/* Generated Image */}
        {image && (
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Imagem Gerada</h2>
            <div className="relative group mb-6">
              <img
                src={image}
                alt="Generated"
                className="w-full rounded-xl"
              />
              <Button
                onClick={downloadImage}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black hover:bg-gray-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </div>

            <Button
              onClick={() => {
                setImage(null);
                setPrompt("");
              }}
              variant="outline"
              className="w-full border-[#27272a]"
            >
              Gerar Outra Imagem
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}