import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wand2, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export default function BatchImages() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateImages = async () => {
    if (!prompt.trim()) {
      toast.error("Digite uma descrição para as imagens");
      return;
    }

    setIsGenerating(true);
    setImages([]);
    setProgress(0);

    const generatedImages = [];

    try {
      for (let i = 0; i < 10; i++) {
        const enhancedPrompt = `${prompt}. Variação ${i + 1}, estilo único e criativo.`;
        
        const { file_url } = await base44.integrations.Core.GenerateImage({
          prompt: enhancedPrompt
        });

        generatedImages.push(file_url);
        setImages([...generatedImages]);
        setProgress(((i + 1) / 10) * 100);
      }

      toast.success("10 imagens geradas com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar imagens");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (url, index) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `imagem-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success(`Imagem ${index + 1} baixada!`);
    } catch (error) {
      toast.error("Erro ao baixar imagem");
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-blue-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <Link 
            to={createPageUrl("ImageCreator")} 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-black mb-2">Gerar 10 Imagens</h1>
            <p className="text-gray-400">Crie múltiplas variações de uma só vez</p>
          </div>
        </header>

        {/* Input Area */}
        <Card className="bg-[#121214] border-[#27272a] mb-8">
          <CardContent className="p-6">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva as imagens que deseja gerar... Ex: Um cachorro fofo em um parque ensolarado, estilo cartoon colorido"
              className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[120px] mb-4"
              disabled={isGenerating}
            />

            <Button
              onClick={generateImages}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando {Math.floor(progress / 10)}/10 imagens...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Gerar 10 Imagens
                </>
              )}
            </Button>

            {isGenerating && (
              <div className="mt-4">
                <div className="w-full bg-[#27272a] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">
                  {Math.floor(progress)}% completo
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((url, index) => (
              <Card key={index} className="bg-[#121214] border-[#27272a] overflow-hidden group">
                <CardContent className="p-0 relative">
                  <img
                    src={url}
                    alt={`Gerada ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      onClick={() => downloadImage(url, index)}
                      size="sm"
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    #{index + 1}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}