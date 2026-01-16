import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Mic, Copy } from "lucide-react";
import { toast } from "sonner";

export default function AudioTranscription() {
  const [audio, setAudio] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudio(file);
    setIsProcessing(true);
    try {
      toast.loading("Transcrevendo áudio...", { id: 'transcribe' });
      
      // Upload de arquivo
      const uploadResponse = await base44.integrations.Core.UploadFile({ file });
      
      // Transcrição via IA
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Transcrever completamente o áudio fornecido. Incluir pontuação correta e timestamps se possível.`,
        file_urls: [uploadResponse.file_url]
      });

      setTranscript(response);
      toast.success("Áudio transcrito!", { id: 'transcribe' });
    } catch (error) {
      toast.error("Erro ao transcrever", { id: 'transcribe' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(transcript);
    toast.success("Copiado!");
  };

  const downloadTranscript = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(transcript));
    element.setAttribute('download', `transcricao-${Date.now()}.txt`);
    element.click();
    toast.success("Transcrito baixado!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-b from-green-500/20 to-transparent p-3 rounded-full mb-4 border border-green-500/30 inline-flex">
            <Mic className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Transcrição Automática</h1>
          <p className="text-gray-400">Converta áudio em texto com precisão</p>
        </div>

        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8">
          <div className="space-y-6">
            {!transcript ? (
              <div className="border-2 border-dashed border-[#27272a] rounded-xl p-8 text-center cursor-pointer hover:border-green-500/50 transition"
                onClick={() => document.getElementById('audio-input').click()}>
                <p className="text-gray-400 mb-2">Clique ou arraste seu áudio (MP3, WAV, M4A)</p>
                <input id="audio-input" type="file" accept="audio/*" onChange={handleAudioUpload} hidden />
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  value={transcript}
                  readOnly
                  className="bg-[#18181b] border-[#27272a] text-white min-h-[200px]"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={copyText} className="bg-purple-600 hover:bg-purple-500">
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                  <Button onClick={downloadTranscript} className="bg-blue-600 hover:bg-blue-500">
                    Baixar
                  </Button>
                </div>

                <Button onClick={() => {setAudio(null); setTranscript("");}} variant="outline" className="border-[#27272a] w-full">
                  Novo Áudio
                </Button>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}