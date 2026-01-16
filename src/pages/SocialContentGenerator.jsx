import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Share2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function SocialContentGenerator() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const platforms = {
    instagram: "Instagram",
    twitter: "Twitter/X",
    tiktok: "TikTok",
    linkedin: "LinkedIn",
    facebook: "Facebook"
  };

  const generateContent = async () => {
    if (!topic.trim()) {
      toast.error("Digite um tema para gerar conteúdo");
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading("Gerando conteúdo...", { id: 'content' });
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Gere um post profissional para ${platforms[platform]} sobre: ${topic}\n\nRequisitos:\n- Engajador e criativo\n- Com hashtags relevantes (máximo 5)\n- Emojis apropriados\n- Tamanho ideal para ${platform}\n- Call-to-action claro`
      });

      setContent(response);
      toast.success("Conteúdo gerado!", { id: 'content' });
    } catch (error) {
      toast.error("Erro ao gerar", { id: 'content' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(content);
    toast.success("Copiado!");
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
            <Share2 className="w-8 h-8 text-pink-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Gerador de Conteúdo Social</h1>
          <p className="text-gray-400">Crie posts para todas as redes sociais</p>
        </div>

        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Tema/Assunto</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Novo produto de café"
                className="bg-[#18181b] border-[#27272a] text-white h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Rede Social</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="bg-[#18181b] border-[#27272a]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(platforms).map(([key, name]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={generateContent} disabled={isProcessing} className="w-full bg-pink-600 hover:bg-pink-500 h-12">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
            {isProcessing ? "Gerando..." : "Gerar Conteúdo"}
          </Button>

          {content && (
            <div className="space-y-3">
              <Textarea
                value={content}
                readOnly
                className="bg-[#18181b] border-[#27272a] text-white min-h-[250px]"
              />
              <Button onClick={copyContent} className="w-full bg-blue-600 hover:bg-blue-500">
                <Copy className="w-4 h-4 mr-2" />
                Copiar Conteúdo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}