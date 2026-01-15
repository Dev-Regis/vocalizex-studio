import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wand2, Loader2, Download, Image as ImageIcon, X, StopCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function BatchImages() {
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [photoMan, setPhotoMan] = useState(null);
  const [photoWoman, setPhotoWoman] = useState(null);
  const [images, setImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [numImages, setNumImages] = useState(5);
  const [shouldStop, setShouldStop] = useState(false);

  const handlePhotoSelect = async (e, gender) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Foto não pode exceder 20MB");
      return;
    }

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (gender === 'man') {
        setPhotoMan({ url: file_url, name: file.name });
        toast.success("Foto do homem enviada!");
      } else {
        setPhotoWoman({ url: file_url, name: file.name });
        toast.success("Foto da mulher enviada!");
      }
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
    setShouldStop(false);

    const generatedImages = [];

    try {
      // Detectar tags na letra
      const hasHe = lyrics.includes('[Ele]');
      const hasShe = lyrics.includes('[Ela]');
      const hasBoth = lyrics.includes('[Ambos]');

      for (let i = 0; i < numImages; i++) {
        if (shouldStop) {
          toast.info(`Geração interrompida. ${i} de ${numImages} imagens geradas.`);
          break;
        }
        let enhancedPrompt = `FOTOGRAFIA PROFISSIONAL ULTRA REALISTA de alta qualidade. Baseado nesta letra: "${lyrics}". `;
        
        const photosToUse = [];
        
        // Determinar quais fotos usar baseado nas tags
        if (hasBoth || (hasHe && hasShe)) {
          enhancedPrompt += `Cena com um homem e uma mulher juntos. `;
          if (photoMan) photosToUse.push(photoMan.url);
          if (photoWoman) photosToUse.push(photoWoman.url);
        } else if (hasHe) {
          enhancedPrompt += `Cena focada no homem. `;
          if (photoMan) photosToUse.push(photoMan.url);
        } else if (hasShe) {
          enhancedPrompt += `Cena focada na mulher. `;
          if (photoWoman) photosToUse.push(photoWoman.url);
        } else {
          // Sem tags, usar ambas se disponíveis
          if (photoMan && photoWoman) {
            enhancedPrompt += `Cena com um homem e uma mulher. `;
            photosToUse.push(photoMan.url, photoWoman.url);
          } else if (photoMan) {
            enhancedPrompt += `Cena com o homem. `;
            photosToUse.push(photoMan.url);
          } else if (photoWoman) {
            enhancedPrompt += `Cena com a mulher. `;
            photosToUse.push(photoWoman.url);
          }
        }

        if (photosToUse.length > 0) {
          enhancedPrompt += `Use as pessoas das fotos como personagens principais. `;
        }

        if (prompt.trim()) {
          enhancedPrompt += `${prompt}. `;
        }

        enhancedPrompt += `IMPORTANTE: Fotografia real, não arte ou desenho. Lugares reais e autênticos. Iluminação natural profissional. Qualidade cinematográfica. Ultra detalhado e realista. 8K. Variação ${i + 1}.`;
        
        const response = await base44.integrations.Core.GenerateImage({
          prompt: enhancedPrompt,
          existing_image_urls: photosToUse.length > 0 ? photosToUse : undefined
        });

        const imageUrl = response.url || response.file_url || response;
        generatedImages.push(imageUrl);
        setImages([...generatedImages]);
        setProgress(((i + 1) / numImages) * 100);
      }

      if (!shouldStop) {
        toast.success(`${numImages} imagens fotorealistas geradas!`);
      }
    } catch (error) {
      toast.error("Erro ao gerar imagens");
      console.error(error);
    } finally {
      setIsGenerating(false);
      setShouldStop(false);
    }
  };

  const stopGeneration = () => {
    setShouldStop(true);
    toast.info("Parando geração...");
  };

  const clearAll = () => {
    setPrompt("");
    setLyrics("");
    setPhotoMan(null);
    setPhotoWoman(null);
    setImages([]);
    setNumImages(5);
    setProgress(0);
    toast.success("Tudo limpo!");
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
            {/* Photos Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Foto Homem */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Foto do Homem (opcional)
                </label>
                {photoMan ? (
                  <div className="relative inline-block">
                    <img
                      src={photoMan.url}
                      alt="Foto do homem"
                      className="w-full h-40 rounded-lg object-cover border-2 border-blue-500"
                    />
                    <button
                      onClick={() => setPhotoMan(null)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoSelect(e, 'man')}
                      className="hidden"
                      disabled={isGenerating}
                    />
                    <div className="border-2 border-dashed border-[#27272a] rounded-lg p-6 hover:border-blue-500 transition-colors text-center h-40 flex flex-col justify-center">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                      <p className="text-sm text-gray-400">Foto do Homem</p>
                      <p className="text-xs text-gray-500 mt-1">Para tag [Ele]</p>
                    </div>
                  </label>
                )}
              </div>

              {/* Foto Mulher */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Foto da Mulher (opcional)
                </label>
                {photoWoman ? (
                  <div className="relative inline-block">
                    <img
                      src={photoWoman.url}
                      alt="Foto da mulher"
                      className="w-full h-40 rounded-lg object-cover border-2 border-pink-500"
                    />
                    <button
                      onClick={() => setPhotoWoman(null)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoSelect(e, 'woman')}
                      className="hidden"
                      disabled={isGenerating}
                    />
                    <div className="border-2 border-dashed border-[#27272a] rounded-lg p-6 hover:border-pink-500 transition-colors text-center h-40 flex flex-col justify-center">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                      <p className="text-sm text-gray-400">Foto da Mulher</p>
                      <p className="text-xs text-gray-500 mt-1">Para tag [Ela]</p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Lyrics Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Letra da Música *
              </label>
              <Textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Cole a letra e use tags: [Ele] para cenas com homem, [Ela] para mulher, [Ambos] para os dois juntos..."
                className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[120px]"
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Dica: Use [Ele], [Ela] ou [Ambos] na letra para controlar quem aparece nas imagens
              </p>
            </div>

            {/* Style Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Detalhes Adicionais (opcional)
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: ao pôr do sol na praia, em uma cidade grande, em um parque..."
                className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[80px]"
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500 mt-2">
                📸 Todas as imagens serão fotorealistas de alta qualidade
              </p>
            </div>

            {/* Number of Images Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número de Imagens: {numImages}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={numImages}
                onChange={(e) => setNumImages(parseInt(e.target.value))}
                disabled={isGenerating}
                className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isGenerating ? (
                <Button
                  onClick={stopGeneration}
                  className="flex-1 bg-red-600 hover:bg-red-500"
                >
                  <StopCircle className="w-5 h-5 mr-2" />
                  Stop ({Math.ceil(progress / 10)}/{numImages})
                </Button>
              ) : (
                <Button
                  onClick={generateImages}
                  disabled={!lyrics.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  Gerar {numImages} Imagens
                </Button>
              )}
              
              <Button
                onClick={clearAll}
                disabled={isGenerating}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 px-6"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>

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