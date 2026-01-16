import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ImageInpainting() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [prompt, setPrompt] = useState("");
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

  const handleInpaint = async () => {
    if (!image || !prompt.trim()) {
      toast.error("Adicione imagem e descrição");
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading("Editando área...", { id: "inpaint" });

      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Based on this image, edit and modify the specified area: ${prompt}. Keep the rest of the image unchanged, seamless integration, high quality`,
        existing_image_urls: [image]
      });

      setResult(response.url || response.file_url || response);
      toast.success("Edição concluída!", { id: "inpaint" });
    } catch (error) {
      toast.error("Erro", { id: "inpaint" });
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
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Inpainting
          </h1>
          <p className="text-gray-400 mt-2">Edite partes específicas da imagem</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6 space-y-4">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {image ? (
                <img src={image} alt="Original" className="w-full h-64 object-contain bg-[#18181b] rounded-lg" />
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-12">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                  <p>Upload</p>
                </button>
              )}

              <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Descreva o que quer adicionar/remover/mudar..." className="bg-[#18181b] border-[#27272a] text-white min-h-[100px]" />

              <Button onClick={handleInpaint} disabled={!image || !prompt.trim() || isProcessing} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Editando...</> : <><Wand2 className="w-4 h-4 mr-2" />Aplicar Edição</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Resultado</h3>
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