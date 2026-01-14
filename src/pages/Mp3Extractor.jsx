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
  const [manualLyrics, setManualLyrics] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
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
      toast.loading("Enviando arquivo de áudio...", { id: 'upload' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      toast.success("Arquivo enviado!", { id: 'upload' });

      toast.loading("Analisando e transcrevendo áudio... Isso pode levar alguns minutos.", { id: 'extract' });
      
      const prompt = `Você recebeu um arquivo de áudio MP3. Sua tarefa é transcrever TODA a letra da música cantada neste áudio.

IMPORTANTE: Ouça com atenção e transcreva CADA palavra cantada.

FORMATO:
[Intro]
(transcreva se houver letra cantada)

[Verse 1]
linha 1
linha 2
linha 3

[Chorus]
refrão linha 1
refrão linha 2

[Verse 2]
...

Continue transcrevendo TODA a música até o final.

REGRAS:
- Transcreva palavra por palavra o que é cantado
- Use [Instrumental] apenas se não houver voz
- Mantenha a estrutura original da música
- Se a música for em outro idioma, transcreva no idioma original

Agora transcreva COMPLETAMENTE a letra:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [file_url],
        add_context_from_internet: false
      });

      if (!response || response.trim().length < 20) {
        setShowManualInput(true);
        toast.error("Não foi possível extrair automaticamente. Use a opção manual abaixo.", { id: 'extract' });
        return;
      }

      setLyrics(response.trim());
      toast.success("Letra extraída com sucesso!", { id: 'extract' });
    } catch (error) {
      console.error("Erro na extração:", error);
      setShowManualInput(true);
      toast.error("Erro ao extrair letra. Use a opção manual abaixo.", { id: 'extract' });
    } finally {
      setIsExtracting(false);
    }
  };

  const saveManualLyrics = () => {
    if (!manualLyrics.trim()) {
      toast.error("Digite a letra da música");
      return;
    }
    setLyrics(manualLyrics.trim());
    setShowManualInput(false);
    toast.success("Letra salva!");
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

        {/* Manual Input Option */}
        {showManualInput && !lyrics && (
          <Card className="bg-[#121214] border-[#27272a] mb-6 border-orange-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Music className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold mb-1">Cole a Letra Manualmente</h2>
                  <p className="text-sm text-gray-400">A extração automática não funcionou. Cole a letra manualmente abaixo:</p>
                </div>
              </div>
              
              <Textarea
                value={manualLyrics}
                onChange={(e) => setManualLyrics(e.target.value)}
                placeholder="Cole a letra completa da música aqui..."
                className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[200px] mb-4"
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={saveManualLyrics}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  Salvar Letra
                </Button>
                <Button
                  onClick={() => setShowManualInput(false)}
                  variant="outline"
                  className="border-[#27272a]"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lyrics Output */}
        {lyrics && (
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Letra da Música</h2>
                <div className="flex gap-2">
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
                  <Button
                    onClick={() => {
                      setLyrics("");
                      setManualLyrics("");
                      setShowManualInput(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="border-[#27272a] text-gray-400"
                  >
                    Editar
                  </Button>
                </div>
              </div>

              <div className="bg-[#09090b] rounded-xl p-6 text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {lyrics}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}