import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Image as ImageIcon, Download } from "lucide-react";
import { toast } from "sonner";

export default function ThumbnailGenerator() {
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const generateThumbnail = async () => {
    if (!title.trim()) {
      toast.error("Digite o título do vídeo");
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading("Gerando thumbnail...", { id: 'thumb' });
      
      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Create a professional YouTube thumbnail for a video titled "${title}". Requirements:\n- Bold, eye-catching text\n- Clear, contrasting colors\n- Professional design\n- 1280x720 resolution optimized\n- Include emoji or icon\n- Thumbnail style (YouTube optimized)`
      });

      setThumbnail(response.url);
      toast.success("Thumbnail gerada!", { id: 'thumb' });
    } catch (error) {
      toast.error("Erro ao gerar", { id: 'thumb' });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadThumbnail = async () => {
    if (!thumbnail) return;
    const response = await fetch(thumbnail);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thumbnail-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success("Thumbnail baixada!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-b from-red-500/20 to-transparent p-3 rounded-full mb-4 border border-red-500/30 inline-flex">
            <ImageIcon className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Gerador de Thumbnails</h1>
          <p className="text-gray-400">Crie thumbnails profissionais para vídeos</p>
        </div>

        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3">Título do Vídeo</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Como Ganhar Dinheiro Online em 30 Dias"
              className="bg-[#18181b] border-[#27272a] text-white h-12"
              disabled={isProcessing}
            />
          </div>

          {!thumbnail ? (
            <Button onClick={generateThumbnail} disabled={isProcessing} className="w-full bg-red-600 hover:bg-red-500 h-12">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
              {isProcessing ? "Gerando..." : "Gerar Thumbnail"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-black rounded-xl p-4 flex items-center justify-center">
                <img src={thumbnail} alt="Thumbnail" className="w-full rounded" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={downloadThumbnail} className="bg-green-600 hover:bg-green-500">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
                <Button onClick={() => {setThumbnail(null); setTitle("");}} variant="outline" className="border-[#27272a]">
                  Novo Vídeo
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}