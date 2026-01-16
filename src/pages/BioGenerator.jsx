import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, User, Copy } from "lucide-react";
import { toast } from "sonner";

export default function BioGenerator() {
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [description, setDescription] = useState("");
  const [bios, setBios] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const networks = {
    instagram: "Instagram",
    tiktok: "TikTok",
    twitter: "Twitter/X",
    linkedin: "LinkedIn",
    spotify: "Spotify"
  };

  const generateBios = async () => {
    if (!name.trim() || !profession.trim()) {
      toast.error("Preencha nome e profissão");
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading("Gerando bios...", { id: 'bio' });
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Gere bios criativas para redes sociais para:\n\nNome: ${name}\nProfissão: ${profession}\nDescrição: ${description}\n\nRetorne em formato JSON com as redes: instagram, tiktok, twitter, linkedin, spotify. Cada bio deve ser otimizada para o máximo de caracteres da plataforma e incluir emojis relevantes.`
      });

      try {
        const parsed = JSON.parse(response);
        setBios(parsed);
        toast.success("Bios geradas!", { id: 'bio' });
      } catch {
        toast.error("Erro ao processar resposta", { id: 'bio' });
      }
    } catch (error) {
      toast.error("Erro ao gerar bios", { id: 'bio' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyBio = (platform) => {
    navigator.clipboard.writeText(bios[platform]);
    toast.success(`Bio do ${networks[platform]} copiada!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-b from-purple-500/20 to-transparent p-3 rounded-full mb-4 border border-purple-500/30 inline-flex">
            <User className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Gerador de Bio</h1>
          <p className="text-gray-400">Crie bios para todas as redes sociais</p>
        </div>

        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Nome</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="bg-[#18181b] border-[#27272a] text-white h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Profissão/Nicho</label>
              <Input
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Ex: Criador de Conteúdo IA"
                className="bg-[#18181b] border-[#27272a] text-white h-12"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Descrição Adicional (Opcional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione qualidades, hobbies, links..."
              className="bg-[#18181b] border-[#27272a] text-white min-h-[80px]"
            />
          </div>

          <Button onClick={generateBios} disabled={isProcessing} className="w-full bg-purple-600 hover:bg-purple-500 h-12">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <User className="w-4 h-4 mr-2" />}
            {isProcessing ? "Gerando..." : "Gerar Bios"}
          </Button>

          {Object.keys(bios).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {Object.entries(networks).map(([key, name]) => (
                bios[key] && (
                  <div key={key} className="bg-[#18181b] rounded-lg p-4 border border-[#27272a]">
                    <div className="text-sm font-semibold mb-2 text-purple-400">{name}</div>
                    <p className="text-sm text-gray-300 mb-3 line-clamp-3">{bios[key]}</p>
                    <Button
                      onClick={() => copyBio(key)}
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-500 h-8"
                    >
                      <Copy className="w-3 h-3 mr-2" />
                      Copiar
                    </Button>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}