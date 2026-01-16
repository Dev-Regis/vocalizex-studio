import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, Copy, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PromptTranslator() {
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [isImproving, setIsImproving] = useState(false);

  const handleImprove = async () => {
    if (!originalPrompt.trim()) {
      toast.error("Digite um prompt primeiro");
      return;
    }

    try {
      setIsImproving(true);
      toast.loading("Melhorando prompt...", { id: "improve" });

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert at creating prompts for AI image generation. Take the following user prompt and improve it to be more detailed, descriptive, and effective for generating high-quality images. Add details about lighting, style, composition, quality, and artistic elements. Keep it natural and coherent.

User prompt: "${originalPrompt}"

Improved prompt (in the same language as the user prompt):`,
        add_context_from_internet: false
      });

      setImprovedPrompt(response.trim());
      toast.success("Prompt melhorado!", { id: "improve" });
    } catch (error) {
      toast.error("Erro ao melhorar prompt", { id: "improve" });
    } finally {
      setIsImproving(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Melhorador de Prompts
          </h1>
          <p className="text-gray-400 mt-2">Transforme prompts simples em descrições detalhadas</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Prompt Original</h3>
                <Button onClick={() => handleCopy(originalPrompt)} variant="ghost" size="sm" className="text-gray-400">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <Textarea
                value={originalPrompt}
                onChange={(e) => setOriginalPrompt(e.target.value)}
                placeholder="Digite seu prompt simples aqui...&#10;&#10;Ex: Um gato no espaço"
                className="bg-[#18181b] border-[#27272a] text-white min-h-[300px] mb-4"
              />

              <Button 
                onClick={handleImprove}
                disabled={!originalPrompt.trim() || isImproving}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
              >
                {isImproving ? (
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Prompt Melhorado</h3>
                {improvedPrompt && (
                  <Button onClick={() => handleCopy(improvedPrompt)} variant="ghost" size="sm" className="text-gray-400">
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {improvedPrompt ? (
                <>
                  <Textarea
                    value={improvedPrompt}
                    onChange={(e) => setImprovedPrompt(e.target.value)}
                    className="bg-[#18181b] border-[#27272a] text-white min-h-[300px] mb-4"
                  />

                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  >
                    <Link to={createPageUrl(`ImageCreator?prompt=${encodeURIComponent(improvedPrompt)}`)}>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Gerar Imagem
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="w-full min-h-[340px] border-2 border-dashed border-[#27272a] rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-500">O prompt melhorado aparecerá aqui</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#121214] border-[#27272a] mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">✨ Exemplos de Melhorias</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-[#18181b] rounded-lg p-4">
                <p className="text-gray-500 mb-2">Original:</p>
                <p className="text-gray-300 mb-3">"Um cachorro"</p>
                <p className="text-gray-500 mb-2">Melhorado:</p>
                <p className="text-green-400">"Um cachorro golden retriever fotorealista, pelagem dourada brilhante, olhos expressivos, fundo desfocado com bokeh, iluminação natural suave, fotografia profissional, alta resolução"</p>
              </div>
              <div className="bg-[#18181b] rounded-lg p-4">
                <p className="text-gray-500 mb-2">Original:</p>
                <p className="text-gray-300 mb-3">"Paisagem"</p>
                <p className="text-gray-500 mb-2">Melhorado:</p>
                <p className="text-green-400">"Paisagem montanhosa épica ao pôr do sol, céu dramático em tons de laranja e roxo, lago cristalino refletindo as montanhas, pinheiros em primeiro plano, raios de luz atravessando nuvens, estilo cinematográfico"</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}