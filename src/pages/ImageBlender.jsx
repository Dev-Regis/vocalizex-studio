import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, X, Blend, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ImageBlender() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [blended, setBlended] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const file1Ref = useRef(null);
  const file2Ref = useRef(null);

  const handleUpload = async (e, setImage) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImage(file_url);
      toast.success("Imagem carregada!");
    } catch (error) {
      toast.error("Erro");
    }
  };

  const handleBlend = async () => {
    if (!image1 || !image2) {
      toast.error("Adicione 2 imagens");
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading("Misturando imagens...", { id: "blend" });

      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Blend and merge these two images into one creative composition. ${prompt || 'Create a harmonious fusion, artistic blend, high quality'}`,
        existing_image_urls: [image1, image2]
      });

      setBlended(response.url || response.file_url || response);
      toast.success("Blend concluído!", { id: "blend" });
    } catch (error) {
      toast.error("Erro", { id: "blend" });
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
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Blend de Imagens
          </h1>
          <p className="text-gray-400 mt-2">Misture 2 imagens em uma composição única</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold mb-4">Imagem 1</h3>
              <input ref={file1Ref} type="file" accept="image/*" onChange={(e) => handleUpload(e, setImage1)} className="hidden" />
              {image1 ? (
                <div className="relative">
                  <img src={image1} className="w-full h-48 object-cover rounded-lg" />
                  <button onClick={() => setImage1(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button onClick={() => file1Ref.current?.click()} className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-8 hover:border-indigo-500">
                  <Upload className="w-8 h-8 mx-auto text-indigo-400" />
                </button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold mb-4">Imagem 2</h3>
              <input ref={file2Ref} type="file" accept="image/*" onChange={(e) => handleUpload(e, setImage2)} className="hidden" />
              {image2 ? (
                <div className="relative">
                  <img src={image2} className="w-full h-48 object-cover rounded-lg" />
                  <button onClick={() => setImage2(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button onClick={() => file2Ref.current?.click()} className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-8 hover:border-purple-500">
                  <Upload className="w-8 h-8 mx-auto text-purple-400" />
                </button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold mb-4">Resultado</h3>
              {blended ? (
                <img src={blended} className="w-full h-48 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-48 border-2 border-dashed border-[#27272a] rounded-lg flex items-center justify-center">
                  <Blend className="w-8 h-8 text-gray-600" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#121214] border-[#27272a]">
          <CardContent className="p-6 space-y-4">
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Descreva como quer misturar (opcional)..." className="bg-[#18181b] border-[#27272a] text-white" />
            <Button onClick={handleBlend} disabled={!image1 || !image2 || isProcessing} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600">
              {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Misturando...</> : <><Blend className="w-4 h-4 mr-2" />Criar Blend</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}