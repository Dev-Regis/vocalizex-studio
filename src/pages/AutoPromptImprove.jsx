import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, Copy, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function AutoPromptImprove() {
  const navigate = useNavigate();
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImprove = async () => {
    if (!originalPrompt.trim()) {
      toast.error("Digite um prompt");
      return;
    }

    setIsLoading(true);
    try {
      toast.loading("Melhorando prompt...", { id: "improve" });

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um expert em criar prompts para geração de imagens com IA. Melhore este prompt tornando-o mais detalhado, visual e específico, mantendo a essência da ideia original. Adicione detalhes sobre estilo, iluminação, composição e qualidade. Retorne APENAS o prompt melhorado, sem explicações.

Prompt original: "${originalPrompt}"`,
        add_context_from_internet: false
      });

      setImprovedPrompt(response);
      toast.success("Prompt melhorado!", { id: "improve" });
    } catch (error) {
      toast.error("Erro ao melhorar", { id: "improve" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedPrompt);
    toast.success("Copiado!");
  };

  const handleUsePrompt = () => {
    navigate(createPageUrl(`ImageCreator?prompt=${encodeURIComponent(improvedPrompt)}`));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Auto Melhorador de Prompts
          </h1>
          <p className="text-gray-400 mt-2">IA melhora automaticamente seus prompts para resultados incríveis</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Prompt Original</h3>
              <Textarea
                value={originalPrompt}
                onChange={(e) => setOriginalPrompt(e.target.value)}
                placeholder="Digite seu prompt aqui. Ex: uma garota com flores"
                className="bg-[#18181b] border-[#27272a] text-white resize-none h-40 mb-4"
                disabled={isLoading}
              />
              <Button
                onClick={handleImprove}
                disabled={isLoading || !originalPrompt.trim()}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Melhorando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Melhorar Prompt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Prompt Melhorado</h3>
              {improvedPrompt ? (
                <>
                  <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 mb-4 h-40 overflow-y-auto">
                    <p className="text-gray-100 text-sm leading-relaxed">{improvedPrompt}</p>
                  </div>
                  <div className="space-y-2">
                    <Button onClick={handleCopy} variant="outline" className="w-full border-[#27272a]">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                    <Button onClick={handleUsePrompt} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Usar em Criador
                    </Button>
                  </div>
                </>
              ) : (
                <div className="h-40 border-2 border-dashed border-[#27272a] rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Prompt melhorado aparecerá aqui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#121214] border-[#27272a] mt-6">
          <CardContent className="p-6">
            <h3 className="font-bold mb-3">💡 Dicas</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>✨ Quanto mais detalhado seu prompt, melhor o resultado</li>
              <li>🎨 Inclua estilo, iluminação e mood desejado</li>
              <li>📐 Mencione composição e proporções se necessário</li>
              <li>🌟 Use a IA para expandir ideias simples</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}