import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X, Maximize, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ImageOutpainting() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [direction, setDirection] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
      setResult(null);
      toast.success("Imagem carregada!");
    } catch (error) {
      toast.error("Erro");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOutpaint = async () => {
    if (!image) return;

    try {
      setIsProcessing(true);
      toast.loading("Expandindo imagem...", { id: "outpaint" });

      const directionPrompts = {
        all: "Expand the image in all directions, extend the scene naturally, seamless continuation",
        top: "Extend the image upwards, add more content above",
        bottom: "Extend the image downwards, add more content below",
        left: "Extend the image to the left, add more content on the left side",
        right: "Extend the image to the right, add more content on the right side"
      };

      const response = await base44.integrations.Core.GenerateImage({
        prompt: `${directionPrompts[direction]}, maintain style and coherence, high quality, professional extension`,
        existing_image_urls: [image]
      });

      setResult(response.url || response.file_url || response);
      toast.success("Expansão concluída!", { id: "outpaint" });
    } catch (error) {
      toast.error("Erro", { id: "outpaint" });
    } finally {
      setIsProcessing(false);
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
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Outpainting
          </h1>
          <p className="text-gray-400 mt-2">Expanda as bordas da imagem além do original</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6 space-y-4">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {image ? (
                <div className="relative">
                  <img src={image} alt="Original" className="w-full h-64 object-contain bg-[#18181b] rounded-lg" />
                  <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-12 hover:border-blue-500">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                  <p>Upload de Imagem</p>
                </button>
              )}

              <Select value={direction} onValueChange={setDirection}>
                <SelectTrigger className="bg-[#18181b] border-[#27272a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#121214] border-[#27272a]">
                  <SelectItem value="all" className="text-white">Todas Direções</SelectItem>
                  <SelectItem value="top" className="text-white">Para Cima</SelectItem>
                  <SelectItem value="bottom" className="text-white">Para Baixo</SelectItem>
                  <SelectItem value="left" className="text-white">Para Esquerda</SelectItem>
                  <SelectItem value="right" className="text-white">Para Direita</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleOutpaint} disabled={!image || isProcessing} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600">
                {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Expandindo...</> : <><Maximize className="w-4 h-4 mr-2" />Expandir Imagem</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Resultado Expandido</h3>
              {result ? (
                <img src={result} alt="Result" className="w-full h-64 object-contain bg-[#18181b] rounded-lg" />
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