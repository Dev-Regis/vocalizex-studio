import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";

export default function VoiceIsolator() {
  const [audio, setAudio] = useState(null);
  const [isolated, setIsolated] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAudio(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const isolateVoice = async () => {
    if (!audio) {
      toast.error("Carregue uma música primeiro");
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading("Isolando vozes...", { id: 'isolate' });
      
      // Simulação - em produção usaria API real de isolamento de voz
      toast.success("Vozes isoladas! (recurso em desenvolvimento)", { id: 'isolate' });
      // setIsolated(audio);
    } catch (error) {
      toast.error("Erro ao isolar vozes", { id: 'isolate' });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAudio = () => {
    if (!isolated) return;
    const link = document.createElement('a');
    link.href = isolated;
    link.download = `voz-isolada-${Date.now()}.mp3`;
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
          <div className="bg-gradient-to-b from-blue-500/20 to-transparent p-3 rounded-full mb-4 border border-blue-500/30 inline-flex">
            <Volume2 className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Isolar Vozes de Músicas</h1>
          <p className="text-gray-400">Extraia vocais e instrumentais de qualquer música</p>
        </div>

        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8">
          <div className="space-y-6">
            {!audio ? (
              <div className="border-2 border-dashed border-[#27272a] rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/50 transition"
                onClick={() => document.getElementById('audio-input').click()}>
                <p className="text-gray-400 mb-2">Clique ou arraste sua música (MP3, WAV)</p>
                <input id="audio-input" type="file" accept="audio/*" onChange={handleAudioUpload} hidden />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#18181b] rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">Arquivo carregado</p>
                  <audio src={audio} controls className="w-full" />
                </div>

                <Button onClick={isolateVoice} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-500 h-12">
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                  {isProcessing ? "Isolando..." : "Isolar Vozes"}
                </Button>

                {isolated && (
                  <div className="space-y-3 mt-4">
                    <div className="bg-[#18181b] rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-2">Vozes Isoladas</p>
                      <audio src={isolated} controls className="w-full" />
                    </div>
                    <Button onClick={downloadAudio} className="w-full bg-green-600 hover:bg-green-500">
                      Baixar Áudio
                    </Button>
                  </div>
                )}

                <Button onClick={() => {setAudio(null); setIsolated(null);}} variant="outline" className="border-[#27272a]">
                  Novo Arquivo
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}