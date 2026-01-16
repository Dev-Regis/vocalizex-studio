import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { toast } from "sonner";

export default function Portfolio() {
  const [creations, setCreations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadCreations();
  }, []);

  const loadCreations = async () => {
    try {
      const data = await base44.entities.Creation.filter({ is_public: true }, "-likes_count", 12);
      setCreations(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportPDF = async () => {
    setIsGenerating(true);
    toast.loading("Gerando portfolio PDF...", { id: "pdf" });
    
    // Simulação - em produção usar jsPDF ou similar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success("Portfolio gerado! (Feature em desenvolvimento)", { id: "pdf" });
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Exportar Portfolio
            </h1>
            <p className="text-gray-400 mt-2">Suas melhores criações em PDF profissional</p>
          </div>
          <Button onClick={handleExportPDF} disabled={isGenerating} className="bg-gradient-to-r from-purple-600 to-pink-600">
            {isGenerating ? "Gerando..." : <><Download className="w-4 h-4 mr-2" />Exportar PDF</>}
          </Button>
        </div>

        <Card className="bg-[#121214] border-[#27272a] mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <FileText className="w-5 h-5" />
              <p>Seu portfolio incluirá suas {creations.length} criações públicas mais populares</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {creations.map((creation) => (
            <Card key={creation.id} className="bg-[#121214] border-[#27272a]">
              <img src={creation.content_url} className="w-full h-48 object-cover rounded-t-lg" />
              <CardContent className="p-3">
                <p className="text-xs text-gray-400 line-clamp-2">{creation.prompt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}