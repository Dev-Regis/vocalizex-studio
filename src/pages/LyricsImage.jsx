import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, X, Wand2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function LyricsImage() {
  const [photos, setPhotos] = useState([]);
  const [lyricsText, setLyricsText] = useState("");
  const [additionalText, setAdditionalText] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (photos.length + selectedFiles.length > 2) {
      toast.error("Máximo de 2 fotos permitidas");
      return;
    }

    for (const file of selectedFiles) {
      if (!file.type.startsWith("image/")) {
        toast.error("Apenas imagens são permitidas");
        continue;
      }

      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setPhotos(prev => [...prev, { url: file_url, name: file.name }]);
      } catch (error) {
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const generateImage = async () => {
    if (!lyricsText.trim() && !additionalText.trim()) {
      toast.error("Digite pelo menos a letra da música ou um texto adicional");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage("");

    try {
      let prompt = `Crie uma imagem artística e visualmente impressionante que represente esta letra de música: "${lyricsText}"`;
      
      if (additionalText.trim()) {
        prompt += `\n\nInstruções adicionais de estilo/composição: ${additionalText}`;
      }

      if (photos.length > 0) {
        prompt += `\n\nA imagem deve incorporar ou ser inspirada pelas fotos de referência fornecidas.`;
        if (photos.length === 2) {
          prompt += ` Use ambas as fotos na composição de forma criativa e harmoniosa.`;
        }
      }

      prompt += `\n\nEstilo: artístico, profissional, alta qualidade, cores vibrantes, composição dinâmica.`;

      const response = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: photos.length > 0 ? photos.map(p => p.url) : undefined
      });

      const imageUrl = response.url || response.file_url || response;
      setGeneratedImage(imageUrl);
      toast.success("Imagem gerada com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar imagem");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-emerald-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
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
            <h1 className="text-4xl font-black mb-2">Imagem com Letra da Música</h1>
            <p className="text-gray-400">Combine fotos (até 2) com letras para criar visuais únicos</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Inputs */}
          <div className="space-y-6">
            {/* Photo Upload */}
            <Card className="bg-[#121214] border-[#27272a]">
              <CardContent className="p-6">
                <Label className="text-sm font-bold uppercase text-gray-400 mb-3 block">
                  Fotos (Opcional - Máx. 2)
                </Label>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {photos.length < 2 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#27272a] rounded-xl p-8 hover:border-emerald-500/50 transition-all group mb-4"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-6 h-6 text-emerald-400" />
                      <p className="text-sm font-semibold">Adicionar Foto</p>
                      <p className="text-xs text-gray-400">{photos.length}/2 fotos</p>
                    </div>
                  </button>
                )}

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Foto {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lyrics Text */}
            <Card className="bg-[#121214] border-[#27272a]">
              <CardContent className="p-6">
                <Label htmlFor="lyrics" className="text-sm font-bold uppercase text-gray-400 mb-3 block">
                  Letra da Música
                </Label>
                <Textarea
                  id="lyrics"
                  value={lyricsText}
                  onChange={(e) => setLyricsText(e.target.value)}
                  placeholder="Cole a letra da música aqui..."
                  className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[150px]"
                />
              </CardContent>
            </Card>

            {/* Additional Text */}
            <Card className="bg-[#121214] border-[#27272a]">
              <CardContent className="p-6">
                <Label htmlFor="additional" className="text-sm font-bold uppercase text-gray-400 mb-3 block">
                  Texto Adicional (Opcional)
                </Label>
                <Textarea
                  id="additional"
                  value={additionalText}
                  onChange={(e) => setAdditionalText(e.target.value)}
                  placeholder="Descreva o estilo, cores, composição que deseja..."
                  className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={generateImage}
              disabled={isGenerating || (!lyricsText.trim() && !additionalText.trim())}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-6"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando Imagem...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Gerar Imagem
                </>
              )}
            </Button>
          </div>

          {/* Right Panel - Preview */}
          <div>
            <Card className="bg-[#121214] border-[#27272a] h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <Label className="text-sm font-bold uppercase text-gray-400 mb-3">
                  Resultado
                </Label>

                <div className="flex-1 bg-[#09090b] rounded-xl flex flex-col items-center justify-center min-h-[400px] p-4">
                  {generatedImage ? (
                    <div className="w-full h-full flex flex-col">
                      <img
                        src={generatedImage}
                        alt="Imagem gerada"
                        className="w-full flex-1 object-contain rounded-xl mb-4"
                      />
                      <Button
                        onClick={async () => {
                          try {
                            const response = await fetch(generatedImage);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `imagem-letra-${Date.now()}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                            toast.success("Imagem baixada!");
                          } catch (error) {
                            toast.error("Erro ao baixar imagem");
                          }
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-500"
                      >
                        <Upload className="w-4 h-4 mr-2 rotate-180" />
                        Baixar Imagem
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-600">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-sm">A imagem gerada aparecerá aqui</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}