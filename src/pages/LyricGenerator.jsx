import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const musicStyles = {
  "Estilos Internacionais": [
    "Hip-Hop",
    "R&B",
    "Pop",
    "Rock",
    "Eletrônico",
    "Jazz",
    "Blues",
    "Soul",
    "Indie",
    "Alternativo",
  ],
  "Estilos Brasileiros": [
    "Funk Carioca",
    "Samba",
    "Forró",
    "Axé",
    "Sertanejo",
    "Bossa Nova",
    "Tropicália",
    "Samba Enredo",
    "Samba Pagode",
    "Baile Funk",
  ],
};

const vocalStyles = [
  "Voz Rouca & Emotiva",
  "Voz Clara & Poderosa",
  "Voz Suave & Melódica",
  "Voz Agressiva & Crua",
  "Voz Lírica & Poética",
  "Voz Grave & Sombria",
];

const voiceOptions = [
  { id: "homem", label: "Homem", tag: "[Ele]" },
  { id: "mulher", label: "Mulher", tag: "[Ela]" },
  { id: "ambos", label: "Ambos", tag: "[Ambos]" },
];

export default function LyricGenerator() {
  const [concept, setConcept] = useState("");
  const [musicStyle, setMusicStyle] = useState("");
  const [vocalStyle, setVocalStyle] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLyrics = async () => {
    if (!concept.trim() || !musicStyle || !vocalStyle) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsGenerating(true);
    try {
      toast.loading("Gerando letra original...", { id: "generate" });

      const prompt = `Crie uma LETRA DE MÚSICA TOTALMENTE ORIGINAL E ÚNICA que NÃO EXISTE no mundo.

CONCEITO & VIBE: ${concept}
ESTILO DE MÚSICA: ${musicStyle}
ESTILO VOCAL: ${vocalStyle}

Requisitos:
1. A letra DEVE ser uma música INÉDITA e original
2. Crie um título ÚNICO e criativo
3. Inclua verso, pré-refrão e refrão (mínimo 2 versos)
4. A letra deve ser bem estruturada e fluida
5. Retorne EXATAMENTE no formato JSON abaixo:

{
  "title": "Título da música",
  "musicStyle": "${musicStyle}",
  "vocalStyle": "${vocalStyle}",
  "lyrics": "letra aqui com quebras de linha usando \\n",
  "description": "Descrição breve sobre batida, tom e sentimento da música"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            musicStyle: { type: "string" },
            vocalStyle: { type: "string" },
            lyrics: { type: "string" },
            description: { type: "string" },
          },
          required: ["title", "musicStyle", "vocalStyle", "lyrics", "description"],
        },
      });

      setTitle(response.title);
      setLyrics(response.lyrics);
      setDetails(response.description);
      toast.success("Letra gerada com sucesso!", { id: "generate" });
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao gerar letra", { id: "generate" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLyrics = () => {
    navigator.clipboard.writeText(`${title}\n\n${lyrics}`);
    toast.success("Letra copiada!");
  };

  const downloadLyrics = () => {
    const text = `${title}\n\n${lyrics}\n\n---\n${details}`;
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, "-")}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Letra baixada!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-purple-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <Link 
          to={createPageUrl("Home")} 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controles */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold mb-8">Gerar Letra de Música</h1>

            {/* Conceito & Vibe */}
            <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
              <label className="block text-sm font-semibold mb-3 uppercase text-gray-300">
                Conceito & Vibe
              </label>
              <Textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Ex: Um trap agressivo sobre vencer na vida, com graves distorcidos e clima sombrio..."
                className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[100px]"
                disabled={isGenerating}
              />
            </div>

            {/* Estilo de Música */}
            <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
              <label className="block text-sm font-semibold mb-3 uppercase text-gray-300">
                Estilo de Música
              </label>
              <div className="space-y-3">
                {Object.entries(musicStyles).map(([category, styles]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold text-purple-400 mb-2">{category}</p>
                    <Select value={musicStyle} onValueChange={setMusicStyle} disabled={isGenerating}>
                      <SelectTrigger className="bg-[#18181b] border-[#27272a]">
                        <SelectValue placeholder="Selecione um estilo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#121214] border-[#27272a]">
                        {styles.map((style) => (
                          <SelectItem key={style} value={style} className="text-white">
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Vocal & Textura */}
            <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
              <label className="block text-sm font-semibold mb-3 uppercase text-gray-300">
                Vocal & Textura
              </label>
              <Select value={vocalStyle} onValueChange={setVocalStyle} disabled={isGenerating}>
                <SelectTrigger className="bg-[#18181b] border-[#27272a]">
                  <SelectValue placeholder="Selecione estilo vocal" />
                </SelectTrigger>
                <SelectContent className="bg-[#121214] border-[#27272a]">
                  {vocalStyles.map((style) => (
                    <SelectItem key={style} value={style} className="text-white">
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateLyrics}
              disabled={isGenerating || !concept.trim() || !musicStyle || !vocalStyle}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-6 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Criando letra viral...
                </>
              ) : (
                "Criar Letra Viral"
              )}
            </Button>
          </div>

          {/* Right Panel - Resultado */}
          <div className="space-y-4">
            {title && (
              <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
                <label className="block text-sm font-semibold mb-3 uppercase text-gray-300">
                  Título da Música
                </label>
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 text-white font-bold text-lg">
                  {title}
                </div>
              </div>
            )}

            {details && (
              <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
                <label className="block text-sm font-semibold mb-3 uppercase text-gray-300">
                  Estilo, Batida & Detalhes
                </label>
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 text-gray-300 text-sm leading-relaxed">
                  {details}
                </div>
              </div>
            )}

            {lyrics && (
              <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
                <label className="block text-sm font-semibold mb-3 uppercase text-gray-300">
                  Letra Gerada
                </label>
                <Textarea
                  value={lyrics}
                  readOnly
                  className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[300px] mb-4"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={copyLyrics}
                    variant="outline"
                    className="flex-1 border-[#27272a]"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                  <Button
                    onClick={downloadLyrics}
                    className="flex-1 bg-purple-600 hover:bg-purple-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>
            )}

            {!lyrics && !title && (
              <div className="bg-[#121214] border border-[#27272a] rounded-xl p-12 text-center h-full flex items-center justify-center">
                <div>
                  <p className="text-gray-400 mb-2">Preencha os campos à esquerda</p>
                  <p className="text-sm text-gray-500">e clique em "Criar Letra Viral"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}