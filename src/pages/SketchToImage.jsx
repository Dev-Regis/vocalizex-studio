import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Download, Wand2 } from "lucide-react";
import { toast } from "sonner";

export default function SketchToImage() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const convertToRealistic = async () => {
    if (!image || !description.trim()) {
      toast.error("Carregue um desenho e descreva");
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading("Transformando desenho em imagem realista...", { id: 'convert' });
      
      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Transform this sketch into a realistic, high-quality image. ${description}. Professional, detailed, 4K quality.`,
        existing_image_urls: [image]
      });

      setImage(response.url);
      toast.success("Desenho convertido!", { id: 'convert' });
    } catch (error) {
      toast.error("Erro ao converter", { id: 'convert' });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = async () => {
    if (!image) return;
    const response = await fetch(image);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `imagem-realista-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success("Imagem baixada!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-b from-pink-500/20 to-transparent p-3 rounded-full mb-4 border border-pink-500/30 inline-flex">
            <Wand2 className="w-8 h-8 text-pink-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Converter Desenho em Imagem</h1>
          <p className="text-gray-400">Transforme seus desenhos em imagens realistas com IA</p>
        </div>

        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 space-y-6">
          {!image ? (
            <div className="border-2 border-dashed border-[#27272a] rounded-xl p-8 text-center cursor-pointer hover:border-pink-500/50 transition"
              onClick={() => document.getElementById('file-input').click()}>
              <p className="text-gray-400 mb-2">Clique ou arraste seu desenho</p>
              <input id="file-input" type="file" accept="image/*" onChange={handleImageUpload} hidden />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <label className="block text-sm font-semibold">Descreva como a imagem deve ser</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Um castelo realista, com pedra detalhada, céu dramático..."
                  className="bg-[#18181b] border-[#27272a] text-white min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Desenho Original</p>
                  <img src={image} alt="Original" className="w-full rounded-lg" />
                </div>
                <div className="flex flex-col justify-center gap-3">
                  <Button onClick={convertToRealistic} disabled={isProcessing} className="w-full bg-pink-600 hover:bg-pink-500">
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    Converter
                  </Button>
                  <Button onClick={() => {setImage(null); setDescription("");}} variant="outline" className="border-[#27272a]">
                    Novo Desenho
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}