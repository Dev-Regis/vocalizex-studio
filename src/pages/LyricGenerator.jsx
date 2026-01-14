import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Copy, Download, Music } from "lucide-react";
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
  const [selectedVoices, setSelectedVoices] = useState([]);
  const [duration, setDuration] = useState(3);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [lyricsParts, setLyricsParts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleVoice = (voiceId) => {
    setSelectedVoices(prev =>
      prev.includes(voiceId) ? prev.filter(v => v !== voiceId) : [...prev, voiceId]
    );
  };

  const generateLyrics = async () => {
    if (!concept.trim() || !musicStyle || !vocalStyle || selectedVoices.length === 0) {
      toast.error("Preencha todos os campos e selecione pelo menos uma voz");
      return;
    }

    setLyricsParts([]);
    setTitle("");
    setDetails("");
    setIsGenerating(true);
    try {
      toast.loading("Gerando letra original...", { id: "generate" });

      const voicesTags = selectedVoices.map(v => {
        const vo = voiceOptions.find(o => o.id === v);
        return vo?.tag;
      }).join(", ");

      const prompt = `Crie uma LETRA DE MÚSICA TOTALMENTE ORIGINAL E ÚNICA que NÃO EXISTE no mundo.

CONCEITO & VIBE: ${concept}
ESTILO DE MÚSICA: ${musicStyle}
ESTILO VOCAL: ${vocalStyle}
DURAÇÃO: ${duration} minutos
VOZES/GÊNEROS: ${voicesTags}

Estrutura obrigatória (use EXATAMENTE este formato):
[Intro] [tag] 0:00-0:XX - Introdução instrumental/vocal (3-4 linhas)
[Verso 1] [tag] 0:XX-0:XX - Apresentação do tema (5-6 linhas)
[Verso 2] [tag] 0:XX-0:XX - Desenvolvimento da história (5-6 linhas)
[Pré-Refrão] [tag] 0:XX-0:XX - Ponte melódica (3-4 linhas)
[Refrão A] [tag] 0:XX-0:XX - Gancho principal, pegajoso (4-5 linhas)
[Verso 3] [tag] 0:XX-0:XX - Aprofundamento (5-6 linhas)
[Verso 4] [tag] 0:XX-0:XX - Continuação (5-6 linhas)
[Pré-Refrão 2] [tag] 0:XX-0:XX - Ponte melódica (3-4 linhas)
[Refrão B] [tag] 0:XX-0:XX - Variação do refrão (4-5 linhas)
[Ponte (call & response)] [tag] 0:XX-0:XX - Alternância vocal PROFISSIONAL (5-6 linhas)
[Break/Paradinha] [tag] 0:XX-0:XX - Momento climático (4-5 linhas)
[Verso Final] [tag] 0:XX-0:XX - Ênfase final (5-6 linhas)
[Ponte final] [tag] 0:XX-0:XX - Transição para conclusão (3-4 linhas)
[Outro] [tag] 0:XX-0:XX - Encerramento/fade out (3-4 linhas)

Requisitos CRÍTICOS:
1. A letra DEVE ser uma música INÉDITA, ORIGINAL e CRIATIVA que NÃO EXISTE
2. MÍNIMO 80-100 linhas de letra no total (MUITO DETALHADA E COMPLETA)
3. Crie um título ÚNICO e criativo
4. CADA SEÇÃO DEVE TER PELO MENOS 3-6 LINHAS DE LETRA PROFISSIONAL
5. ⚠️ PROFISSIONALISMO: NÃO MISTURE TAGS NUMA MESMA SEÇÃO:
   - Se a seção começa com [Ele], todas as linhas são [Ele]
   - Se é [Ela], todas são [Ela]
   - Se é [Ambos], pode haver interação, mas estruturada profissionalmente
   - CALL & RESPONSE: use padrão "Ele: linha 1 / Ela: linha 2 / Ele: linha 3" ETC (separado profissionalmente)
6. Distribua os timecodes para atingir aprox. ${duration} minutos no total
7. Use as tags: ${voicesTags}
8. A letra deve ser bem estruturada, fluida e profissional
9. Crie TODAS as 14 seções listadas acima
10. Retorne EXATAMENTE no formato JSON abaixo:

{
  "title": "Título da música",
  "musicStyle": "${musicStyle}",
  "vocalStyle": "${vocalStyle}",
  "duration": ${duration},
  "description": "Descrição breve sobre batida, tom e sentimento da música",
  "parts": [
    {
      "section": "Intro",
      "tag": "[tag]",
      "startTime": "0:00",
      "endTime": "0:15",
      "lyrics": "letra da intro aqui"
    }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            musicStyle: { type: "string" },
            vocalStyle: { type: "string" },
            duration: { type: "number" },
            description: { type: "string" },
            parts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section: { type: "string" },
                  tag: { type: "string" },
                  startTime: { type: "string" },
                  endTime: { type: "string" },
                  lyrics: { type: "string" },
                },
              },
            },
          },
          required: ["title", "musicStyle", "vocalStyle", "duration", "description", "parts"],
        },
      });

      setTitle(response.title);
      setLyricsParts(response.parts || []);
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
    const text = lyricsParts.map(p => `[${p.section} • ${p.startTime}]\n${p.tag}\n${p.lyrics.split(' / ').join('\n')}`).join("\n\n");
    navigator.clipboard.writeText(`${title}\n\n${text}`);
    toast.success("Letra copiada!");
  };

  const downloadLyrics = () => {
    const text = lyricsParts.map(p => `[${p.section} • ${p.startTime}]\n${p.tag}\n${p.lyrics.split(' / ').join('\n')}`).join("\n\n");
    const fullText = `${title}\n\nDuração: ${duration} minutos\n\n${text}\n\n---\n${details}`;
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(fullText)
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

            {/* Voz / Gênero */}
            <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
              <label className="block text-sm font-semibold mb-3 uppercase text-gray-300">
                Voz / Gênero
              </label>
              <div className="grid grid-cols-3 gap-2">
                {voiceOptions.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => toggleVoice(voice.id)}
                    disabled={isGenerating}
                    className={`py-3 px-3 rounded-lg font-semibold text-sm transition-all ${
                      selectedVoices.includes(voice.id)
                        ? "bg-purple-600 text-white border border-purple-400"
                        : "bg-[#18181b] border border-[#27272a] text-gray-300 hover:border-purple-500/50"
                    }`}
                  >
                    {voice.label} <span className="text-xs text-gray-400">{voice.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duração da Música */}
            <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
              <label className="block text-sm font-semibold mb-3 uppercase text-gray-300">
                Duração da Música
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  min="1"
                  max="10"
                  disabled={isGenerating}
                  className="w-16 bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-white font-semibold"
                />
                <span className="text-gray-400">minutos</span>
                <span className="text-xs text-gray-500 ml-auto">(1-10 min)</span>
              </div>
              <input
                type="range"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min="1"
                max="10"
                disabled={isGenerating}
                className="w-full mt-2"
              />
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
            {isGenerating && (
              <div className="bg-[#121214] border border-[#27272a] rounded-xl p-12 text-center h-full flex items-center justify-center">
                <div>
                  <div className="w-24 h-24 mx-auto mb-6 relative">
                    <div className="w-full h-full border-4 border-[#27272a] rounded-full animate-spin border-t-purple-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Music className="w-10 h-10 text-purple-400" />
                    </div>
                  </div>
                  <p className="text-white font-semibold mb-2">Compilando estrutura...</p>
                  <p className="text-sm text-gray-400">Verticalizando versos • Simplificando rimas</p>
                </div>
              </div>
            )}

            {!isGenerating && title && (
              <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
                <label className="block text-sm font-semibold mb-3 uppercase text-gray-300">
                  Título da Música
                </label>
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 text-white font-bold text-lg">
                  {title}
                </div>
              </div>
            )}

            {!isGenerating && details && (
               <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
                 <label className="block text-sm font-semibold mb-3 uppercase text-gray-300">
                   Estilo, Batida & Detalhes
                 </label>
                 <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 text-gray-300 text-sm leading-relaxed">
                   {details}
                 </div>
               </div>
             )}

            {!isGenerating && lyricsParts.length > 0 && (
              <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
                <label className="block text-sm font-semibold mb-3 uppercase text-gray-300">
                  Letra Gerada
                </label>
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 space-y-6 max-h-[400px] overflow-y-auto mb-4">
                  {lyricsParts.map((part, idx) => (
                    <div key={idx} className="border-l-2 border-purple-500 pl-4">
                      <div className="mb-2">
                        <div className="font-bold text-purple-400 mb-1">[{part.section} • {part.startTime}]</div>
                        <div className="text-pink-400 text-sm">{part.tag}</div>
                      </div>
                      <div className="text-gray-200 text-sm whitespace-pre-wrap">{part.lyrics.split(' / ').join('\n')}</div>
                    </div>
                  ))}
                </div>
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

            {!isGenerating && lyricsParts.length === 0 && !title && (
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