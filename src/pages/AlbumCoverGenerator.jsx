import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { ArrowLeft, Upload, Download, Loader2 } from "lucide-react";

export default function AlbumCoverGenerator() {
  const [coverType, setCoverType] = useState("album");
  const [selectedPhotos, setSelectedPhotos] = useState({
    man: null,
    woman: null,
    both: null
  });
  const [photoType, setPhotoType] = useState("man");
  const [selectedFont, setSelectedFont] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [customText, setCustomText] = useState("");
  const [generatedCover, setGeneratedCover] = useState(null);
  const [loading, setLoading] = useState(false);

  const fonts = ["Arial", "Helvetica", "Times New Roman", "Courier", "Georgia", "Verdana", "Comic Sans", "Impact"];
  const colors = ["#FFFFFF", "#000000", "#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#C7CEEA", "#FF85A1"];

  const handlePhotoUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedPhotos(prev => ({
          ...prev,
          [type]: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getPhotoForCover = () => {
    if (photoType === "both" && selectedPhotos.both) return selectedPhotos.both;
    if (photoType === "man" && selectedPhotos.man) return selectedPhotos.man;
    if (photoType === "woman" && selectedPhotos.woman) return selectedPhotos.woman;
    return null;
  };

  const generateCover = async () => {
    const selectedPhoto = getPhotoForCover();
    if (!selectedPhoto) {
      toast.error("Selecione uma foto");
      return;
    }

    setLoading(true);
    try {
      const font = selectedFont || "Arial";
      const color = selectedColor || "#FFFFFF";
      const text = customText || `${coverType.charAt(0).toUpperCase() + coverType.slice(1)} Cover`;

      const prompt = `Create a professional ${coverType} cover art (3000x3000px) with the provided photo as background. 
        Add the text "${text}" in ${font} font with color ${color}. 
        The design should be modern, visually appealing, and suitable for music distribution platforms.
        Make sure the text is clearly visible and well-positioned.`;

      const response = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: [selectedPhoto]
      });

      if (response?.url) {
        setGeneratedCover(response.url);
        toast.success("Capa gerada com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao gerar capa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCover = async () => {
    try {
      const link = document.createElement("a");
      link.href = generatedCover;
      link.download = `${coverType}_cover_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Capa baixada!");
    } catch (error) {
      toast.error("Erro ao baixar: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <Link to={createPageUrl("Home")} className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <h1 className="text-4xl font-bold mb-8">Gerador de Capas</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Painel de Controles */}
          <Card className="bg-[#121214] border-[#27272a]">
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo de Capa */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Tipo de Capa</label>
                <Select value={coverType} onValueChange={setCoverType}>
                  <SelectTrigger className="bg-[#1a1a1c] border-[#27272a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1c] border-[#27272a]">
                    <SelectItem value="album">Álbum</SelectItem>
                    <SelectItem value="single">Single</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Foto */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Tipo de Foto</label>
                <Select value={photoType} onValueChange={setPhotoType}>
                  <SelectTrigger className="bg-[#1a1a1c] border-[#27272a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1c] border-[#27272a]">
                    <SelectItem value="man">Homem</SelectItem>
                    <SelectItem value="woman">Mulher</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Upload de Fotos */}
              <div className="space-y-3">
                {(photoType === "man" || photoType === "both") && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Foto do Homem</label>
                    <label className="flex items-center justify-center w-full p-3 border-2 border-dashed border-[#27272a] rounded-lg cursor-pointer hover:border-purple-500">
                      <Upload className="w-4 h-4 mr-2" />
                      <span className="text-sm">Selecionar foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, "man")}
                        className="hidden"
                      />
                    </label>
                    {selectedPhotos.man && (
                      <img src={selectedPhotos.man} alt="Homem" className="w-full h-32 object-cover rounded mt-2" />
                    )}
                  </div>
                )}

                {(photoType === "woman" || photoType === "both") && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Foto da Mulher</label>
                    <label className="flex items-center justify-center w-full p-3 border-2 border-dashed border-[#27272a] rounded-lg cursor-pointer hover:border-purple-500">
                      <Upload className="w-4 h-4 mr-2" />
                      <span className="text-sm">Selecionar foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, "woman")}
                        className="hidden"
                      />
                    </label>
                    {selectedPhotos.woman && (
                      <img src={selectedPhotos.woman} alt="Mulher" className="w-full h-32 object-cover rounded mt-2" />
                    )}
                  </div>
                )}

                {photoType === "both" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Foto com Ambos</label>
                    <label className="flex items-center justify-center w-full p-3 border-2 border-dashed border-[#27272a] rounded-lg cursor-pointer hover:border-purple-500">
                      <Upload className="w-4 h-4 mr-2" />
                      <span className="text-sm">Selecionar foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, "both")}
                        className="hidden"
                      />
                    </label>
                    {selectedPhotos.both && (
                      <img src={selectedPhotos.both} alt="Ambos" className="w-full h-32 object-cover rounded mt-2" />
                    )}
                  </div>
                )}
              </div>

              {/* Fonte */}
              <div>
                <label className="block text-sm font-medium mb-2">Fonte da Letra</label>
                <Select value={selectedFont} onValueChange={setSelectedFont}>
                  <SelectTrigger className="bg-[#1a1a1c] border-[#27272a] text-white">
                    <SelectValue placeholder="Escolher fonte" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1c] border-[#27272a]">
                    {fonts.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cor */}
              <div>
                <label className="block text-sm font-medium mb-2">Cor da Letra</label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-full h-10 rounded border-2 ${
                        selectedColor === color ? "border-purple-500" : "border-[#27272a]"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Texto Customizado */}
              <div>
                <label className="block text-sm font-medium mb-2">Texto (opcional)</label>
                <Textarea
                  placeholder="Deixe em branco para criar por padrão"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="bg-[#1a1a1c] border-[#27272a] text-white placeholder-gray-500 min-h-24"
                />
              </div>

              <Button
                onClick={generateCover}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-lg py-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  "Gerar Capa"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="bg-[#121214] border-[#27272a]">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedCover ? (
                <div className="space-y-4">
                  <img src={generatedCover} alt="Capa Gerada" className="w-full rounded-lg" />
                  <Button
                    onClick={downloadCover}
                    className="w-full bg-green-600 hover:bg-green-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Capa (3000x3000)
                  </Button>
                  <Button
                    onClick={() => setGeneratedCover(null)}
                    variant="outline"
                    className="w-full border-[#27272a]"
                  >
                    Gerar Nova
                  </Button>
                </div>
              ) : (
                <div className="h-96 bg-[#1a1a1c] rounded-lg flex items-center justify-center border-2 border-dashed border-[#27272a]">
                  <p className="text-white">A capa aparecerá aqui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}