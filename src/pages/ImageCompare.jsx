import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Upload, X, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";

export default function ImageCompare() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(50);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Comparador de Imagens
          </h1>
          <p className="text-gray-400 mt-2">Compare lado a lado original vs editada</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold mb-4">Imagem 1 (Original)</h3>
              <input ref={file1Ref} type="file" accept="image/*" onChange={(e) => handleUpload(e, setImage1)} className="hidden" />
              {image1 ? (
                <div className="relative">
                  <img src={image1} className="w-full h-64 object-cover rounded-lg" />
                  <button onClick={() => setImage1(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => file1Ref.current?.click()} className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-12">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
                  <p>Upload Original</p>
                </button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold mb-4">Imagem 2 (Editada)</h3>
              <input ref={file2Ref} type="file" accept="image/*" onChange={(e) => handleUpload(e, setImage2)} className="hidden" />
              {image2 ? (
                <div className="relative">
                  <img src={image2} className="w-full h-64 object-cover rounded-lg" />
                  <button onClick={() => setImage2(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => file2Ref.current?.click()} className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-12">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-orange-400" />
                  <p>Upload Editada</p>
                </button>
              )}
            </CardContent>
          </Card>
        </div>

        {image1 && image2 && (
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5" />
                Comparação Lado a Lado
              </h3>
              <div className="relative overflow-hidden rounded-lg" style={{ height: '400px' }}>
                <div className="absolute inset-0 grid grid-cols-2">
                  <img src={image1} className="w-full h-full object-cover" />
                  <img src={image2} className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white transform -translate-x-1/2"></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}