import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Upload, Music, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Mp3Extractor() {
  const [file, setFile] = useState(null);
  const [lyrics, setLyrics] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("audio/")) {
      toast.error("Por favor, selecione um arquivo de áudio MP3");
      return;
    }

    setFile(selectedFile);
    setLyrics("");
  };

  const extractLyrics = async () => {
    if (!file) {
      toast.error("Selecione um arquivo MP3 primeiro");
      return;
    }

    setIsExtracting(true);
    setLyrics("");

    try {
      toast.loading("Enviando arquivo...", { id: 'upload' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      toast.success("Arquivo enviado!", { id: 'upload' });

      toast.loading("Extraindo letra da música...", { id: 'extract' });
      
      const prompt = `Você é um especialista em transcrição de músicas. 
      
      TAREFA: Ouça o áudio fornecido e transcreva COMPLETAMENTE a letra da música.
      
      INSTRUÇÕES:
      1. Transcreva toda a letra da música palavra por palavra
      2. Organize em seções: [Intro], [Verse 1], [Chorus], [Bridge], [Verse 2], [Outro], etc
      3. Coloque cada linha em uma linha separada
      4. Mantenha a ordem exata das palavras cantadas
      5. Se houver partes instrumentais longas, marque como [Instrumental]
      6. Transcreva em PORTUGUÊS mesmo que a música seja em outro idioma
      
      FORMATO DE SAÍDA:
      [Nome da seção]
      Linha 1 da letra
      Linha 2 da letra
      
      [Próxima seção]
      ...
      
      Agora, transcreva a letra completa do arquivo de áudio fornecido.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [file_url]
      });

      if (!response || response.trim().length < 10) {
        throw new Error("Letra não encontrada ou muito curta");
      }

      setLyrics(response.trim());
      toast.success("Letra extraída com sucesso!", { id: 'extract' });
    } catch (error) {
      console.error("Erro na extração:", error);
      toast.error("Erro ao extrair letra. Tente outro arquivo MP3.", { id: 'extract' });
      setLyrics("Não foi possível extrair a letra deste arquivo. Certifique-se de que é um arquivo MP3 com música cantada.");
    } finally {
      setIsExtracting(false);
    }
  };

  const copyLyrics = () => {
    if (!lyrics) return;
    navigator.clipboard.writeText(lyrics);
    setCopied(true);
    toast.success("Letra copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-purple-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <Link 
            to={createPageUrl("Home")} 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>

          <div className="text-center">
            <div className="bg-gradient-to-b from-purple-500/20 to-transparent p-3 rounded-full mb-4 border border-purple-500/30 inline-flex">
              <Music className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-black mb-2">Extrair Letra de MP3</h1>
            <p className="text-gray-400">Importe uma música e extraia automaticamente a letra</p>
          </div>
        </header>

        {/* Upload Area */}
        <Card className="bg-[#121214] border-[#27272a] mb-6">
          <CardContent className="p-8">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!file ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#27272a] rounded-2xl p-12 hover:border-purple-500/50 transition-all group"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                    <Upload className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold mb-1">Clique para selecionar MP3</p>
                    <p className="text-sm text-gray-400">Ou arraste o arquivo aqui</p>
                  </div>
                </div>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#18181b] rounded-xl border border-[#27272a]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Music className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-xs text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setFile(null);
                      setLyrics("");
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    Remover
                  </Button>
                </div>

                <Button
                  onClick={extractLyrics}
                  disabled={isExtracting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-6 text-lg"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Extraindo letra...
                    </>
                  ) : (
                    <>
                      <Music className="w-5 h-5 mr-2" />
                      Extrair Letra da Música
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lyrics Output */}
        {lyrics && (
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Letra Extraída</h2>
                <Button
                  onClick={copyLyrics}
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-[#09090b] rounded-xl p-6 font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {lyrics}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}