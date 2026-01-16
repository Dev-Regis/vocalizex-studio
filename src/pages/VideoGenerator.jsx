import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, X, Video, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VideoGenerator() {
  const [image, setImage] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [duration, setDuration] = useState(5);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Apenas imagens");
      return;
    }

    try {
      setIsUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImage(file_url);
      setVideoUrl(null);
      toast.success("Imagem carregada!");
    } catch (error) {
      toast.error("Erro");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;

    try {
      setIsGenerating(true);
      toast.loading("Gerando vídeo (pode levar 1-2 min)...", { id: "video" });

      // Simulação - em produção usar API real de vídeo
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success("Vídeo gerado! (Feature em desenvolvimento)", { id: "video" });
    } catch (error) {
      toast.error("Erro", { id: "video" });
    } finally {
      setIsGenerating(false);
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
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Geração de Vídeo Curto
          </h1>
          <p className="text-gray-400 mt-2">Anime imagens estáticas em vídeos de 3-10 segundos</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6 space-y-4">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {image ? (
                <div className="relative">
                  <img src={image} className="w-full h-64 object-contain bg-[#18181b] rounded-lg" />
                  <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-12">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-red-400" />
                  <p>Upload de Imagem</p>
                </button>
              )}

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Duração: {duration}s</label>
                <input type="range" min="3" max="10" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full" />
              </div>

              <Button onClick={handleGenerate} disabled={!image || isGenerating} className="w-full bg-gradient-to-r from-red-600 to-pink-600">
                {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando...</> : <><Video className="w-4 h-4 mr-2" />Gerar Vídeo</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Vídeo Gerado</h3>
              <div className="w-full h-64 border-2 border-dashed border-[#27272a] rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Em breve disponível</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}