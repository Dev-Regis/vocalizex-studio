import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X, Maximize2, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export default function ImageUpscaler() {
  const [image, setImage] = useState(null);
  const [upscaledImage, setUpscaledImage] = useState(null);
  const [scale, setScale] = useState("2");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas");
      return;
    }

    try {
      setIsUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImage(file_url);
      setUpscaledImage(null);
      toast.success("Imagem carregada!");
    } catch (error) {
      toast.error("Erro ao carregar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpscale = async () => {
    if (!image) return;

    try {
      setIsProcessing(true);
      toast.loading("Aumentando resolução...", { id: "upscale" });

      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Ultra high resolution, 8K quality, sharp details, enhanced clarity, professional photography, ${scale}x upscaled`,
        existing_image_urls: [image]
      });

      setUpscaledImage(response.url || response.file_url || response);
      toast.success("Upscaling concluído!", { id: "upscale" });
    } catch (error) {
      toast.error("Erro ao processar", { id: "upscale" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `upscaled-${scale}x-${Date.now()}.png`;
    link.click();
    toast.success("Download concluído!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Upscaling de Imagens
          </h1>
          <p className="text-gray-400 mt-2">Aumente a resolução e qualidade das suas imagens</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold">Imagem Original</h3>
              
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

              {image ? (
                <div className="relative">
                  <img src={image} alt="Original" className="w-full h-64 object-contain bg-[#18181b] rounded-lg" />
                  <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-12 hover:border-orange-500 transition-colors">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-orange-400" />
                  <p>Upload de Imagem</p>
                </button>
              )}

              <Select value={scale} onValueChange={setScale}>
                <SelectTrigger className="bg-[#18181b] border-[#27272a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#121214] border-[#27272a]">
                  <SelectItem value="2" className="text-white">2x (Rápido)</SelectItem>
                  <SelectItem value="4" className="text-white">4x (Alta Qualidade)</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleUpscale} disabled={!image || isProcessing} className="w-full bg-gradient-to-r from-orange-600 to-red-600">
                {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processando...</> : <><Maximize2 className="w-4 h-4 mr-2" />Aumentar Resolução</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Resultado {scale}x</h3>
              {upscaledImage ? (
                <div className="space-y-4">
                  <img src={upscaledImage} alt="Upscaled" className="w-full h-64 object-contain bg-[#18181b] rounded-lg" />
                  <Button onClick={() => handleDownload(upscaledImage)} className="w-full bg-green-600">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar {scale}x
                  </Button>
                </div>
              ) : (
                <div className="w-full h-64 border-2 border-dashed border-[#27272a] rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Resultado aparecerá aqui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}