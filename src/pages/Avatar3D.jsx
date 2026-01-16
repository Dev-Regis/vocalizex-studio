import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { toast } from "sonner";

export default function Avatar3D() {
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAvatar = async () => {
    if (!description.trim()) {
      toast.error("Descreva como você quer o avatar");
      return;
    }

    setIsGenerating(true);
    try {
      toast.loading("Gerando avatar 3D...", { id: 'avatar' });
      
      const response = await base44.integrations.Core.GenerateImage({
        prompt: `Create a professional 3D avatar character with the following description: ${description}. Realistic, detailed, 3D rendered style, clean background.`
      });

      setAvatar(response.url);
      toast.success("Avatar criado!", { id: 'avatar' });
    } catch (error) {
      toast.error("Erro ao gerar avatar", { id: 'avatar' });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAvatar = async () => {
    if (!avatar) return;
    const response = await fetch(avatar);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `avatar-3d-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success("Avatar baixado!");
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
          <h1 className="text-4xl font-black mb-2">Avatar 3D Personalizado</h1>
          <p className="text-gray-400">Crie seu avatar 3D único com IA</p>
        </div>

        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3">Descreva seu avatar ideal</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Homem com cabelo azul, óculos futurista, estilo cyberpunk..."
                className="bg-[#18181b] border-[#27272a] text-white h-12"
              />
              <p className="text-xs text-gray-500 mt-2">Detalhe: idade, cabelo, estilo, roupa, acessórios...</p>
            </div>

            {!avatar ? (
              <Button onClick={generateAvatar} disabled={isGenerating} className="w-full bg-purple-600 hover:bg-purple-500 h-12">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <User className="w-4 h-4 mr-2" />}
                {isGenerating ? "Gerando..." : "Gerar Avatar"}
              </Button>
            ) : (
              <div className="space-y-4">
                <img src={avatar} alt="Avatar 3D" className="w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={downloadAvatar} className="bg-green-600 hover:bg-green-500">
                    Baixar
                  </Button>
                  <Button onClick={() => {setAvatar(null); setDescription("");}} variant="outline" className="border-[#27272a]">
                    Novo Avatar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}