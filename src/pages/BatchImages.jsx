import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wand2, Loader2, Download, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

export default function BatchImages() {
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [photo, setPhoto] = useState(null);
  const [images, setImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Foto não pode exceder 20MB");
      return;
    }

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhoto({ url: file_url, name: file.name });
      toast.success("Foto enviada!");
    } catch (error) {
      toast.error("Erro ao enviar foto");
    }
  };

  const generateImages = async () => {
    if (!lyrics.trim()) {
      toast.error("Digite a letra da música");
      return;
    }

    setIsGenerating(true);
    setImages([]);
    setProgress(0);

    const generatedImages = [];

    try {
      for (let i = 0; i < 10; i++) {
        let enhancedPrompt = `Crie uma imagem artística e criativa baseada nesta letra de música: "${lyrics}". Variação ${i + 1}. `;
        
        if (prompt.trim()) {
          enhancedPrompt += `Estilo adicional: ${prompt}. `;
        }

        if (photo) {
          enhancedPrompt += `Use a pessoa da foto como personagem principal na cena. `;
        }

        enhancedPrompt += `Imagem de alta qualidade, cores vibrantes, composição profissional.`;
        
        const response = await base44.integrations.Core.GenerateImage({
          prompt: enhancedPrompt,
          existing_image_urls: photo ? [photo.url] : undefined
        });

        const imageUrl = response.url || response.file_url || response;
        generatedImages.push(imageUrl);
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
            to={createPageUrl("Home")} 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-black mb-2">Gerar 10 Imagens com Letra</h1>
            <p className="text-gray-400">Transforme letras de música em arte visual com sua foto</p>
          </div>
        </header>

        {/* Input Area */}
        <Card className="bg-[#121214] border-[#27272a] mb-8">
          <CardContent className="p-6 space-y-4">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sua Foto (opcional)
              </label>
              {photo ? (
                <div className="relative inline-block">
                  <img
                    src={photo.url}
                    alt="Foto selecionada"
                    className="w-32 h-32 rounded-lg object-cover border-2 border-purple-500"
                  />
                  <button
                    onClick={() => setPhoto(null)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    disabled={isGenerating}
                  />
                  <div className="border-2 border-dashed border-[#27272a] rounded-lg p-6 hover:border-purple-500 transition-colors text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-400">Clique para adicionar sua foto</p>
                    <p className="text-xs text-gray-500 mt-1">Você aparecerá nas imagens geradas</p>
                  </div>
                </label>
              )}
            </div>

            {/* Lyrics Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Letra da Música *
              </label>
              <Textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Cole aqui a letra da música... Ex: Olhos castanhos, cabelo ao vento, sorriso que ilumina meu pensamento..."
                className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[120px]"
                disabled={isGenerating}
              />
            </div>

            {/* Style Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estilo Adicional (opcional)
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: estilo anime, fotorealista, pintura a óleo, cartoon..."
                className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[80px]"
                disabled={isGenerating}
              />
            </div>

            <Button
              onClick={generateImages}
              disabled={isGenerating || !lyrics.trim()}
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
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      onClick={() => downloadImage(url, index)}
                      size="sm"
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                  <Button
                    onClick={() => downloadImage(url, index)}
                    size="icon"
                    className="absolute bottom-2 right-2 h-8 w-8 bg-white text-black hover:bg-gray-200 opacity-90"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
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