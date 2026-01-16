import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Wand2, Download, Loader2, X, Eraser, Palette, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function ImageEditor() {
  const [originalImage, setOriginalImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [editType, setEditType] = useState("remove_background");
  const [prompt, setPrompt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const editTypes = [
    { value: "remove_background", label: "Remover Fundo", icon: Eraser },
    { value: "change_colors", label: "Alterar Cores", icon: Palette },
    { value: "add_elements", label: "Adicionar Elementos", icon: Sparkles },
    { value: "style_transfer", label: "Transferir Estilo", icon: Wand2 }
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem não pode exceder 10MB");
      return;
    }

    try {
      setIsUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setOriginalImage(file_url);
      setEditedImage(null);
      toast.success("Imagem carregada!");
    } catch (error) {
      toast.error("Erro ao carregar imagem");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const getEditPrompt = () => {
    switch (editType) {
      case "remove_background":
        return "Remove the background completely, keep only the main subject, transparent background, clean edges, professional cutout, high quality";
      case "change_colors":
        return prompt || "Change the colors to vibrant and modern tones, maintain composition and style";
      case "add_elements":
        return prompt || "Add creative elements to enhance the image while maintaining the original subject";
      case "style_transfer":
        return prompt || "Apply an artistic style transformation, high quality, professional look";
      default:
        return prompt;
    }
  };

  const handleEdit = async () => {
    if (!originalImage) {
      toast.error("Faça upload de uma imagem primeiro");
      return;
    }

    if ((editType === "change_colors" || editType === "add_elements" || editType === "style_transfer") && !prompt.trim()) {
      toast.error("Descreva a edição que deseja fazer");
      return;
    }

    try {
      setIsGenerating(true);
      toast.loading("Editando imagem...", { id: "edit" });

      const editPrompt = getEditPrompt();
      
      const response = await base44.integrations.Core.GenerateImage({
        prompt: editPrompt,
        existing_image_urls: [originalImage]
      });

      const imageUrl = response.url || response.file_url || response;
      setEditedImage(imageUrl);
      toast.success("Imagem editada com sucesso!", { id: "edit" });
    } catch (error) {
      toast.error("Erro ao editar imagem", { id: "edit" });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Imagem baixada!");
    } catch (error) {
      toast.error("Erro ao baixar imagem");
      console.error(error);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setPrompt("");
    setEditType("remove_background");
  };

  const selectedType = editTypes.find(t => t.value === editType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <Link 
            to={createPageUrl("Home")} 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Editor de Imagens IA
            </h1>
            <p className="text-gray-400">Edite suas imagens com inteligência artificial</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Upload e Controles */}
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6 space-y-6">
              {/* Upload */}
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
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full h-64 object-contain bg-[#18181b] rounded-lg border-2 border-purple-500"
                    />
                    <button
                      onClick={() => setOriginalImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-12 hover:border-purple-500 transition-colors"
                  >
                    {isUploading ? (
                      <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-purple-400" />
                    ) : (
                      <Upload className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                    )}
                    <p className="text-lg font-semibold">Clique para fazer upload</p>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG (máx. 10MB)</p>
                  </button>
                )}
              </div>

              {/* Tipo de Edição */}
              <div>
                <Label className="text-sm font-bold uppercase text-white mb-3 block">
                  Tipo de Edição
                </Label>
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger className="bg-[#18181b] border-[#27272a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121214] border-[#27272a]">
                    {editTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value} className="text-white">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt (não obrigatório para remover fundo) */}
              {editType !== "remove_background" && (
                <div>
                  <Label className="text-sm font-bold uppercase text-white mb-3 block">
                    Descreva a Edição {editType === "remove_background" ? "(Opcional)" : ""}
                  </Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      editType === "change_colors" 
                        ? "Ex: Tornar as cores mais vibrantes e quentes..."
                        : editType === "add_elements"
                        ? "Ex: Adicionar flores coloridas ao redor..."
                        : "Ex: Transformar em estilo aquarela..."
                    }
                    className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[100px]"
                  />
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3">
                <Button
                  onClick={handleEdit}
                  disabled={!originalImage || isGenerating}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Editando...
                    </>
                  ) : (
                    <>
                      {selectedType && <selectedType.icon className="w-4 h-4 mr-2" />}
                      Aplicar Edição
                    </>
                  )}
                </Button>

                {(originalImage || editedImage) && (
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-[#27272a] text-gray-400 hover:bg-[#27272a]"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Editado */}
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <Label className="text-sm font-bold uppercase text-white mb-3 block">
                Imagem Editada
              </Label>

              {editedImage ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={editedImage}
                      alt="Editada"
                      className="w-full h-64 object-contain bg-[#18181b] rounded-lg border-2 border-green-500"
                    />
                  </div>
                  
                  <Button
                    onClick={() => handleDownload(editedImage)}
                    className="w-full bg-green-600 hover:bg-green-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Imagem Editada
                  </Button>
                </div>
              ) : (
                <div className="w-full h-64 border-2 border-dashed border-[#27272a] rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Wand2 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-500">A imagem editada aparecerá aqui</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dicas */}
        <Card className="bg-[#121214] border-[#27272a]">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">💡 Dicas de Uso</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
              <div>
                <p className="font-semibold text-purple-400 mb-1">🎯 Remover Fundo</p>
                <p>Remove automaticamente o fundo da imagem, mantendo apenas o objeto principal</p>
              </div>
              <div>
                <p className="font-semibold text-pink-400 mb-1">🎨 Alterar Cores</p>
                <p>Descreva como quer as cores: "mais vibrantes", "tons pastéis", "preto e branco"</p>
              </div>
              <div>
                <p className="font-semibold text-blue-400 mb-1">✨ Adicionar Elementos</p>
                <p>Adicione objetos, efeitos ou decorações: "adicionar flores", "efeito de luz"</p>
              </div>
              <div>
                <p className="font-semibold text-green-400 mb-1">🖼️ Transferir Estilo</p>
                <p>Aplique estilos artísticos: "estilo aquarela", "arte digital", "vintage"</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}