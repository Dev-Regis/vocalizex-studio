import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Download, Image as ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";

export default function ImageCreator() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageCount, setImageCount] = useState(1);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadedImages.length >= 2) {
      toast.error("Máximo de 2 imagens permitidas");
      return;
    }

    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      setUploadedImages([...uploadedImages, response.file_url]);
      toast.success("Imagem importada!");
    } catch (error) {
      toast.error("Erro ao importar imagem");
    }
  };

  const removeUploadedImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Digite uma descrição da imagem");
      return;
    }

    setIsGenerating(true);
    try {
      toast.loading(`Gerando ${imageCount} imagem(ns)...`, { id: 'generate' });
      
      const images = [];
      for (let i = 0; i < imageCount; i++) {
        const response = await base44.integrations.Core.GenerateImage({
          prompt: prompt + " Crie uma imagem de alta qualidade, profissional e realista.",
          existing_image_urls: uploadedImages.length > 0 ? uploadedImages : undefined
        });

        const imageUrl = response.url || response.file_url || response;
        images.push(imageUrl);
      }

      setImage(images.length === 1 ? images[0] : images);
      toast.success(`${imageCount} imagem(ns) gerada(s) com sucesso!`, { id: 'generate' });
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao gerar imagem", { id: 'generate' });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl) => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `imagem-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Imagem baixada!");
    } catch (error) {
      toast.error("Erro ao baixar imagem");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-blue-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
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
            <div className="bg-gradient-to-b from-blue-500/20 to-transparent p-3 rounded-full mb-4 border border-blue-500/30 inline-flex">
              <ImageIcon className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-black mb-2">Criar Imagens</h1>
            <p className="text-gray-400">Gere imagens incríveis com IA a partir de descrições</p>
          </div>
        </header>

        {/* Input Area */}
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 mb-8">
          <label className="block text-sm font-semibold mb-3">Descreva a imagem que deseja gerar</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Uma montanha com neve ao pôr do sol, céu com cores quentes..."
            className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[120px] mb-4"
            disabled={isGenerating}
          />

          {/* Upload Imagem */}
          <div className="mb-4 p-4 bg-[#18181b] border border-[#27272a] rounded-lg">
            <label className="block text-xs font-semibold text-gray-300 mb-3 uppercase">Importar Imagens (Opcional - Máx 2)</label>
            
            {/* Upload Buttons */}
            <div className="flex gap-2 mb-4">
              {[0, 1].map((idx) => (
                <div key={idx} className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isGenerating || (uploadedImages.length >= 2 && !uploadedImages[idx])}
                    className="hidden"
                    id={`image-upload-${idx}`}
                  />
                  <label
                    htmlFor={`image-upload-${idx}`}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#27272a] border border-dashed border-[#3f3f46] rounded-lg cursor-pointer hover:border-blue-500/50 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">Foto {idx + 1}</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Imported Images Preview */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {uploadedImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={imgUrl}
                      alt={`Imported ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeUploadedImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quantidade de Imagens */}
          <div className="mb-4 p-4 bg-[#18181b] border border-[#27272a] rounded-lg">
            <label className="block text-xs font-semibold text-gray-300 mb-3 uppercase">Quantas imagens gerar?</label>
            <div className="flex gap-2">
              {[1, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => setImageCount(num)}
                  disabled={isGenerating}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                    imageCount === num
                      ? "bg-blue-600 text-white border border-blue-400"
                      : "bg-[#27272a] text-gray-300 border border-[#3f3f46] hover:border-blue-500/50"
                  }`}
                >
                  {num} Imagem{num > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>
          
          <Button
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 py-6 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Gerando imagem...
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5 mr-2" />
                Gerar Imagem
              </>
            )}
          </Button>
        </div>

        {/* Generated Image */}
        {image && (
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Imagens Geradas</h2>
            <div className={`grid gap-6 mb-6 ${Array.isArray(image) ? "grid-cols-1 md:grid-cols-2" : ""}`}>
              {Array.isArray(image) ? (
                image.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt={`Generated ${idx + 1}`}
                      className="w-full rounded-xl"
                    />
                    <Button
                      onClick={() => downloadImage(img)}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black hover:bg-gray-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                ))
              ) : (
                <div className="relative group">
                  <img
                    src={image}
                    alt="Generated"
                    className="w-full rounded-xl"
                  />
                  <Button
                    onClick={() => downloadImage(image)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black hover:bg-gray-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={() => {
                setImage(null);
                setPrompt("");
              }}
              variant="outline"
              className="w-full border-[#27272a]"
            >
              Gerar Outra Imagem
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}