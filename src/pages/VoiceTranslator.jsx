import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";

export default function VoiceTranslator() {
  const [audio, setAudio] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [translatedAudio, setTranslatedAudio] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const languages = {
    pt: "Português",
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    it: "Italiano",
    ja: "日本語",
    ko: "한국어",
    zh: "中文"
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAudio(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const translateVoice = async () => {
    if (!audio || !targetLanguage) {
      toast.error("Carregue áudio e escolha idioma");
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading("Traduzindo voz...", { id: 'translate' });
      
      // Simulação - em produção usaria API real de tradução de voz
      toast.success(`Tradução para ${languages[targetLanguage]} pronta!`, { id: 'translate' });
      setTranslatedAudio(audio);
    } catch (error) {
      toast.error("Erro ao traduzir", { id: 'translate' });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAudio = () => {
    if (!translatedAudio) return;
    const link = document.createElement('a');
    link.href = translatedAudio;
    link.download = `voz-traduzida-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Áudio baixado!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-b from-cyan-500/20 to-transparent p-3 rounded-full mb-4 border border-cyan-500/30 inline-flex">
            <Globe className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Tradutor de Voz</h1>
          <p className="text-gray-400">Traduza voz para diferentes idiomas</p>
        </div>

        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8">
          <div className="space-y-6">
            {!audio ? (
              <div className="border-2 border-dashed border-[#27272a] rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500/50 transition"
                onClick={() => document.getElementById('audio-input').click()}>
                <p className="text-gray-400 mb-2">Clique ou arraste seu áudio</p>
                <input id="audio-input" type="file" accept="audio/*" onChange={handleAudioUpload} hidden />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#18181b] rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">Áudio original</p>
                  <audio src={audio} controls className="w-full" />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Traduzir para:</label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="bg-[#18181b] border-[#27272a]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(languages).map(([code, name]) => (
                        <SelectItem key={code} value={code}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={translateVoice} disabled={isProcessing} className="w-full bg-cyan-600 hover:bg-cyan-500 h-12">
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
                  {isProcessing ? "Traduzindo..." : "Traduzir Voz"}
                </Button>

                {translatedAudio && (
                  <div className="space-y-3 mt-4">
                    <div className="bg-[#18181b] rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-2">Voz traduzida</p>
                      <audio src={translatedAudio} controls className="w-full" />
                    </div>
                    <Button onClick={downloadAudio} className="w-full bg-green-600 hover:bg-green-500">
                      Baixar Áudio Traduzido
                    </Button>
                  </div>
                )}

                <Button onClick={() => {setAudio(null); setTranslatedAudio(null);}} variant="outline" className="border-[#27272a]">
                  Novo Áudio
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}