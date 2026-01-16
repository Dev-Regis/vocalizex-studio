import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Upload, X, Eye, Loader2, Copy, Wand2 } from "lucide-react";
import { toast } from "sonner";

export default function ImageAnalyzer() {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas");
      return;
    }

    try {
      setIsUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImage(file_url);
      setAnalysis("");
      toast.success("Imagem carregada!");
    } catch (error) {
      toast.error("Erro ao carregar imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      toast.error("Faça upload de uma imagem primeiro");
      return;
    }

    try {
      setIsAnalyzing(true);
      toast.loading("Analisando imagem...", { id: "analyze" });

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: "Analyze this image in detail. Describe what you see, including objects, people, colors, composition, mood, style, and any other relevant details. Be thorough and descriptive. Write in Portuguese (Brazil).",
        file_urls: [image],
        add_context_from_internet: false
      });

      setAnalysis(response);
      toast.success("Análise concluída!", { id: "analyze" });
    } catch (error) {
      toast.error("Erro ao analisar imagem", { id: "analyze" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis);
    toast.success("Descrição copiada!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Analisador de Imagens
          </h1>
          <p className="text-gray-400 mt-2">IA descreve o que vê nas suas imagens</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Imagem</h3>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {image ? (
                <div className="relative mb-4">
                  <img src={image} alt="Upload" className="w-full h-80 object-contain bg-[#18181b] rounded-lg" />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-12 mb-4 hover:border-cyan-500 transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-cyan-400" />
                  ) : (
                    <Upload className="w-12 h-12 mx-auto mb-3 text-cyan-400" />
                  )}
                  <p className="text-lg font-semibold">Upload de Imagem</p>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG (máx. 10MB)</p>
                </button>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={!image || isAnalyzing}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Analisar Imagem
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Análise da IA</h3>
                {analysis && (
                  <Button onClick={handleCopy} variant="ghost" size="sm" className="text-gray-400">
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {analysis ? (
                <>
                  <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 mb-4 min-h-[320px] max-h-[400px] overflow-y-auto">
                    <p className="text-gray-300 whitespace-pre-wrap">{analysis}</p>
                  </div>

                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  >
                    <Link to={createPageUrl(`ImageCreator?prompt=${encodeURIComponent(analysis)}`)}>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Criar Imagem Similar
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="w-full min-h-[360px] border-2 border-dashed border-[#27272a] rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Eye className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-500">A análise aparecerá aqui</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#121214] border-[#27272a] mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">💡 Como usar</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Faça upload de qualquer imagem e a IA descreverá em detalhes</li>
              <li>• Use a descrição para criar variações da imagem original</li>
              <li>• Ótimo para entender estilos artísticos e composições</li>
              <li>• Copie a descrição para usar como prompt em outros geradores</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}