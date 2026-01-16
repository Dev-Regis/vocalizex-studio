import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mic, Square, Copy, Wand2 } from "lucide-react";
import { toast } from "sonner";

export default function VoiceToText() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Seu navegador não suporta reconhecimento de voz");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      toast.error("Erro ao reconhecer voz");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    toast.success("Gravação iniciada!");
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast.success("Gravação parada!");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    toast.success("Texto copiado!");
  };

  const handleClear = () => {
    setTranscript("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Voz para Texto
          </h1>
          <p className="text-gray-400 mt-2">Grave sua voz e converta em texto para prompts</p>
        </div>

        <Card className="bg-[#121214] border-[#27272a] mb-6">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                size="lg"
                className={`w-32 h-32 rounded-full ${
                  isRecording 
                    ? "bg-red-600 hover:bg-red-500 animate-pulse" 
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
                }`}
              >
                {isRecording ? (
                  <Square className="w-12 h-12" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </Button>
              <p className="text-sm text-gray-400 mt-4">
                {isRecording ? "Gravando... Clique para parar" : "Clique para começar a gravar"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121214] border-[#27272a]">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Transcrição</h3>
              <div className="flex gap-2">
                <Button onClick={handleClear} variant="outline" size="sm" className="border-[#27272a] text-gray-400">
                  Limpar
                </Button>
                <Button onClick={handleCopy} variant="outline" size="sm" className="border-[#27272a] text-gray-400">
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </div>

            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="A transcrição aparecerá aqui..."
              className="bg-[#18181b] border-[#27272a] text-white min-h-[300px]"
            />

            <Button
              asChild
              disabled={!transcript.trim()}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              <Link to={createPageUrl(`ImageCreator?prompt=${encodeURIComponent(transcript)}`)}>
                <Wand2 className="w-4 h-4 mr-2" />
                Usar como Prompt
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#121214] border-[#27272a] mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">💡 Dicas</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Fale de forma clara e pausada para melhor reconhecimento</li>
              <li>• Funciona melhor em ambientes silenciosos</li>
              <li>• Descreva a imagem que deseja criar com detalhes</li>
              <li>• Você pode editar o texto após a gravação</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}