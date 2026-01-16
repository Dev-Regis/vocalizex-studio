import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, FileText, Copy } from "lucide-react";
import { toast } from "sonner";

export default function ScriptWriter() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [script, setScript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const generateScript = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Preencha título e descrição");
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading("Escrevendo roteiro...", { id: 'script' });
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Escreva um roteiro profissional para:\n\nTítulo: ${title}\n\nDescrição: ${description}\n\nFormato: [CENA] > [DESCRIÇÃO] > [DIÁLOGO]\n\nRetorne um roteiro bem estruturado com cenas, descrições e diálogos.`
      });

      setScript(response);
      toast.success("Roteiro gerado!", { id: 'script' });
    } catch (error) {
      toast.error("Erro ao gerar roteiro", { id: 'script' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(script);
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
          <div className="bg-gradient-to-b from-orange-500/20 to-transparent p-3 rounded-full mb-4 border border-orange-500/30 inline-flex">
            <FileText className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Escritor de Roteiros</h1>
          <p className="text-gray-400">Gere roteiros profissionais com IA</p>
        </div>

        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Título do Roteiro</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Comercial de Café"
              className="bg-[#18181b] border-[#27272a] text-white h-12"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Descrição/Conceito</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que quer no roteiro..."
              className="bg-[#18181b] border-[#27272a] text-white min-h-[100px]"
            />
          </div>

          <Button onClick={generateScript} disabled={isProcessing} className="w-full bg-orange-600 hover:bg-orange-500 h-12">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
            {isProcessing ? "Gerando..." : "Gerar Roteiro"}
          </Button>

          {script && (
            <div className="space-y-3 mt-6">
              <Textarea
                value={script}
                readOnly
                className="bg-[#18181b] border-[#27272a] text-white min-h-[300px]"
              />
              <Button onClick={copyScript} className="w-full bg-blue-600 hover:bg-blue-500">
                <Copy className="w-4 h-4 mr-2" />
                Copiar Roteiro
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}