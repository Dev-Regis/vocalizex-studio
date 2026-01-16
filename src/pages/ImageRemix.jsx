import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Wand2, Download, Loader2, X, Save } from "lucide-react";
import { toast } from "sonner";

export default function ImageRemix() {
  const [originalImage, setOriginalImage] = useState(null);
  const [remixedImage, setRemixedImage] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas");
      return;
    }

    try {
      setIsUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setOriginalImage(file_url);
      setRemixedImage(null);
      toast.success("Imagem carregada!");
    } catch (error) {
      toast.error("Erro ao carregar imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemix = async () => {
    if (!originalImage || !prompt.trim()) {
      toast.error("Adicione uma imagem e descreva o remix");
      return;
    }

    try {
      setIsGenerating(true);
      toast.loading("Criando remix...", { id: "remix" });

      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Based on the reference image, create a new variation: ${prompt}. High quality, creative interpretation`,
        existing_image_urls: [originalImage]
      });

      const imageUrl = response.url || response.file_url || response;
      setRemixedImage(imageUrl);
      toast.success("Remix criado!", { id: "remix" });
    } catch (error) {
      toast.error("Erro ao criar remix", { id: "remix" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!remixedImage) return;

    try {
      await base44.entities.Creation.create({
        type: "image",
        content_url: remixedImage,
        prompt: prompt,
        is_public: false
      });
      toast.success("Salvo no histórico!");
    } catch (error) {
      toast.error("Erro ao salvar");
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(remixedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `remix-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Download concluído!");
    } catch (error) {
      toast.error("Erro ao baixar");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Remix de Imagens
          </h1>
          <p className="text-gray-400">Transforme suas imagens com descrições criativas</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6 space-y-6">
              <div>
                <Label className="text-sm font-bold uppercase text-white mb-3 block">
                  Imagem Original
                </Label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {originalImage ? (
                  <div className="relative">
                    <img src={originalImage} alt="Original" className="w-full h-64 object-contain bg-[#18181b] rounded-lg" />
                    <button onClick={() => setOriginalImage(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2 hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-12 hover:border-purple-500 transition-colors">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                    <p className="text-lg font-semibold">Upload de Imagem</p>
                  </button>
                )}
              </div>

              <div>
                <Label className="text-sm font-bold uppercase text-white mb-3 block">
                  Descreva o Remix
                </Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Transforme em estilo anime, adicione cores neon, faça parecer uma pintura a óleo..."
                  className="bg-[#18181b] border-[#27272a] text-white min-h-[120px]"
                />
              </div>

              <Button onClick={handleRemix} disabled={!originalImage || !prompt.trim() || isGenerating} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando...</> : <><Wand2 className="w-4 h-4 mr-2" />Criar Remix</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <Label className="text-sm font-bold uppercase text-white mb-3 block">
                Resultado
              </Label>

              {remixedImage ? (
                <div className="space-y-4">
                  <img src={remixedImage} alt="Remix" className="w-full h-64 object-contain bg-[#18181b] rounded-lg" />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-500">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                    <Button onClick={handleDownload} className="flex-1 bg-green-600 hover:bg-green-500">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 border-2 border-dashed border-[#27272a] rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Wand2 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-500">O remix aparecerá aqui</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}