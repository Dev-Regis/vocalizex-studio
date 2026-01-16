import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, RefreshCw, Video, Loader2, Download, Play } from "lucide-react";
import { toast } from "sonner";

export default function VideoClipPreview() {
  const navigate = useNavigate();
  const [videoClip, setVideoClip] = useState(null);
  const [manSceneUrl, setManSceneUrl] = useState(null);
  const [womanSceneUrl, setWomanSceneUrl] = useState(null);
  const [bothSceneUrl, setBothSceneUrl] = useState(null);
  const [isGeneratingScenes, setIsGeneratingScenes] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isRegeneratingMan, setIsRegeneratingMan] = useState(false);
  const [isRegeneratingWoman, setIsRegeneratingWoman] = useState(false);
  const [isRegeneratingBoth, setIsRegeneratingBoth] = useState(false);

  useEffect(() => {
    loadVideoClip();
  }, []);

  const loadVideoClip = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!id) {
      toast.error("ID do videoclipe não encontrado");
      navigate(createPageUrl("VideoClipForm"));
      return;
    }

    try {
      const clips = await base44.entities.VideoClip.filter({ id });
      if (clips.length === 0) {
        toast.error("Videoclipe não encontrado");
        navigate(createPageUrl("VideoClipForm"));
        return;
      }

      const clip = clips[0];
      setVideoClip(clip);

      if (!clip.photoMan && !clip.photoWoman && !clip.photoBoth) {
        toast.error("Nenhuma foto encontrada");
        return;
      }

      // Gerar cenas automaticamente
      await generateScenes(clip);
    } catch (error) {
      toast.error("Erro ao carregar videoclipe");
      console.error(error);
    }
  };

  const generateScenes = async (clip = videoClip) => {
    setIsGeneratingScenes(true);
    try {
      // Criar prompt que MANTÉM A IDENTIDADE mas VARIA pose/posição/expressão
      const scenePrompt = `Cenário de videoclipe profissional: ${clip.sceneDescription || 'palco de show moderno com luzes e efeitos'}. Baseado na letra: ${clip.lyrics.substring(0, 200)}. Iluminação de palco profissional, alta qualidade, 8K, cinematográfico.`;

      // Gerar cena para homem
      if (clip.photoMan && !manSceneUrl) {
        const manResponse = await base44.integrations.Core.GenerateImage({
          prompt: `${scenePrompt} Mostre o MESMO homem da foto de referência (mesma identidade, mesmo rosto, mesmas características físicas) em uma NOVA POSE dinâmica para videoclipe - cantando, dançando, ou pose expressiva. Ângulo e posição diferentes da foto original. Corpo completo ou meio corpo, expressão artística para show.`,
          existing_image_urls: [clip.photoMan]
        });
        const manUrl = manResponse.url || manResponse.file_url || manResponse;
        setManSceneUrl(manUrl);
      }

      // Gerar cena para mulher
      if (clip.photoWoman && !womanSceneUrl) {
        const womanResponse = await base44.integrations.Core.GenerateImage({
          prompt: `${scenePrompt} Mostre a MESMA mulher da foto de referência (mesma identidade, mesmo rosto, mesmas características físicas) em uma NOVA POSE dinâmica para videoclipe - cantando, dançando, ou pose expressiva. Ângulo e posição diferentes da foto original. Corpo completo ou meio corpo, expressão artística para show.`,
          existing_image_urls: [clip.photoWoman]
        });
        const womanUrl = womanResponse.url || womanResponse.file_url || womanResponse;
        setWomanSceneUrl(womanUrl);
      }

      // Gerar cena para ambos
      if (clip.photoBoth && !bothSceneUrl) {
        const bothResponse = await base44.integrations.Core.GenerateImage({
          prompt: `${scenePrompt} Mostre as MESMAS pessoas da foto de referência (mesmas identidades, mesmos rostos, mesmas características físicas) em NOVAS POSES dinâmicas para videoclipe - cantando juntos, dançando, ou poses expressivas. Ângulos e posições diferentes da foto original. Interação entre as pessoas, clima de show/performance.`,
          existing_image_urls: [clip.photoBoth]
        });
        const bothUrl = bothResponse.url || bothResponse.file_url || bothResponse;
        setBothSceneUrl(bothUrl);
      }

      toast.success("Cenas geradas com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar cenas");
      console.error(error);
    } finally {
      setIsGeneratingScenes(false);
    }
  };

  const regenerateScene = async (type) => {
    if (type === "man") {
      setIsRegeneratingMan(true);
    } else if (type === "woman") {
      setIsRegeneratingWoman(true);
    } else {
      setIsRegeneratingBoth(true);
    }

    try {
      const scenePrompt = `Cenário de videoclipe profissional: ${videoClip.sceneDescription || 'palco de show moderno com luzes e efeitos'}. Baseado na letra: ${videoClip.lyrics.substring(0, 200)}. Iluminação de palco profissional, alta qualidade, 8K, cinematográfico. VARIAÇÃO DIFERENTE da anterior.`;

      if (type === "man") {
        const response = await base44.integrations.Core.GenerateImage({
          prompt: `${scenePrompt} Mostre o MESMO homem da foto de referência (mesma identidade, mesmo rosto) em uma NOVA POSE diferente - cantando, dançando, ou pose expressiva diferente. Ângulo e posição VARIADOS.`,
          existing_image_urls: [videoClip.photoMan]
        });
        const url = response.url || response.file_url || response;
        setManSceneUrl(url);
        toast.success("Cena do homem regenerada!");
      } else if (type === "woman") {
        const response = await base44.integrations.Core.GenerateImage({
          prompt: `${scenePrompt} Mostre a MESMA mulher da foto de referência (mesma identidade, mesmo rosto) em uma NOVA POSE diferente - cantando, dançando, ou pose expressiva diferente. Ângulo e posição VARIADOS.`,
          existing_image_urls: [videoClip.photoWoman]
        });
        const url = response.url || response.file_url || response;
        setWomanSceneUrl(url);
        toast.success("Cena da mulher regenerada!");
      } else {
        const response = await base44.integrations.Core.GenerateImage({
          prompt: `${scenePrompt} Mostre as MESMAS pessoas da foto de referência (mesmas identidades, mesmos rostos) em NOVAS POSES diferentes - cantando juntos, dançando, ou poses expressivas variadas. Ângulos e posições VARIADOS.`,
          existing_image_urls: [videoClip.photoBoth]
        });
        const url = response.url || response.file_url || response;
        setBothSceneUrl(url);
        toast.success("Cena regenerada!");
      }
    } catch (error) {
      toast.error("Erro ao regenerar cena");
      console.error(error);
    } finally {
      if (type === "man") {
        setIsRegeneratingMan(false);
      } else if (type === "woman") {
        setIsRegeneratingWoman(false);
      } else {
        setIsRegeneratingBoth(false);
      }
    }
  };

  const generateVideo = async () => {
    setIsGeneratingVideo(true);
    
    try {
      toast.loading("Gerando videoclipe profissional...", { id: "video" });

      // NOTA: Esta é uma simulação. Na prática, você precisaria de uma API especializada
      // como Runway ML, Pika Labs, D-ID, Synthesia, etc. para:
      // 1. Sincronização labial (lip-sync) com a música
      // 2. Geração de vídeo a partir das imagens
      // 3. Processamento de áudio e legendas
      // 4. Aplicação de marca d'água
      
      // Simulação de processamento
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Aqui você chamaria a API real de geração de vídeo
      // Por enquanto, vamos apenas salvar o status
      await base44.entities.VideoClip.update(videoClip.id, {
        status: "completed",
        videoUrl: "https://example.com/video.mp4" // URL fictícia
      });

      toast.success("Videoclipe gerado! (Demo - requer integração com API de vídeo)", { id: "video" });
      
      // Informar o usuário sobre a necessidade de integração
      toast.info("⚠️ Para geração real de vídeo, é necessário integrar com APIs como Runway ML, D-ID ou Synthesia", { 
        duration: 8000 
      });

    } catch (error) {
      toast.error("Erro ao gerar vídeo", { id: "video" });
      console.error(error);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  if (!videoClip) {
    return (
      <div className="min-h-screen bg-[#050506] text-white flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-red-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <Link 
            to={createPageUrl("VideoClipForm")} 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-black mb-2">Preview do Videoclipe</h1>
            <p className="text-gray-400">Revise as cenas antes de gerar o vídeo final</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Cena do Homem */}
          {videoClip.photoMan && (
            <Card className="bg-[#121214] border-[#27272a]">
              <CardContent className="p-6">
                <Label className="text-sm font-bold uppercase text-white mb-4 block">
                  Cena do Homem
                </Label>

                {isGeneratingScenes && !manSceneUrl ? (
                  <div className="flex items-center justify-center h-64 bg-[#18181b] rounded-lg">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                  </div>
                ) : manSceneUrl ? (
                  <div className="relative">
                    <img
                      src={manSceneUrl}
                      alt="Cena do homem"
                      className="w-full h-64 object-contain bg-[#18181b] rounded-lg"
                    />
                    <Button
                      onClick={() => regenerateScene("man")}
                      disabled={isRegeneratingMan}
                      size="sm"
                      className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-500"
                    >
                      {isRegeneratingMan ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Cena da Mulher */}
          {videoClip.photoWoman && (
            <Card className="bg-[#121214] border-[#27272a]">
              <CardContent className="p-6">
                <Label className="text-sm font-bold uppercase text-white mb-4 block">
                  Cena da Mulher
                </Label>

                {isGeneratingScenes && !womanSceneUrl ? (
                  <div className="flex items-center justify-center h-64 bg-[#18181b] rounded-lg">
                    <Loader2 className="w-12 h-12 animate-spin text-pink-500" />
                  </div>
                ) : womanSceneUrl ? (
                  <div className="relative">
                    <img
                      src={womanSceneUrl}
                      alt="Cena da mulher"
                      className="w-full h-64 object-contain bg-[#18181b] rounded-lg"
                    />
                    <Button
                      onClick={() => regenerateScene("woman")}
                      disabled={isRegeneratingWoman}
                      size="sm"
                      className="absolute bottom-2 right-2 bg-pink-600 hover:bg-pink-500"
                    >
                      {isRegeneratingWoman ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Cena Ambos */}
          {videoClip.photoBoth && (
            <Card className="bg-[#121214] border-[#27272a]">
              <CardContent className="p-6">
                <Label className="text-sm font-bold uppercase text-white mb-4 block">
                  Cena Ambos
                </Label>

                {isGeneratingScenes && !bothSceneUrl ? (
                  <div className="flex items-center justify-center h-64 bg-[#18181b] rounded-lg">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                  </div>
                ) : bothSceneUrl ? (
                  <div className="relative">
                    <img
                      src={bothSceneUrl}
                      alt="Cena ambos"
                      className="w-full h-64 object-contain bg-[#18181b] rounded-lg"
                    />
                    <Button
                      onClick={() => regenerateScene("both")}
                      disabled={isRegeneratingBoth}
                      size="sm"
                      className="absolute bottom-2 right-2 bg-purple-600 hover:bg-purple-500"
                    >
                      {isRegeneratingBoth ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Música */}
        <Card className="bg-[#121214] border-[#27272a] mb-6">
          <CardContent className="p-6">
            <Label className="text-sm font-bold uppercase text-white mb-4 block">
              Música
            </Label>
            <audio src={videoClip.musicUrl} controls className="w-full" />
          </CardContent>
        </Card>

        {/* Letra */}
        <Card className="bg-[#121214] border-[#27272a] mb-6">
          <CardContent className="p-6">
            <Label className="text-sm font-bold uppercase text-white mb-4 block">
              Letra da Música
            </Label>
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {videoClip.lyrics}
              </pre>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 [Ele] = Homem canta | [Ela] = Mulher canta | [Ambos] = Dueto
            </p>
          </CardContent>
        </Card>

        {/* Informações */}
        <Card className="bg-[#121214] border-[#27272a] mb-6">
          <CardContent className="p-6">
            <Label className="text-sm font-bold uppercase text-white mb-4 block">
              Configurações
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Tipo</p>
                <p className="font-semibold text-white capitalize">{videoClip.type}</p>
              </div>
              <div>
                <p className="text-gray-400">Orientação</p>
                <p className="font-semibold text-white capitalize">{videoClip.orientation}</p>
              </div>
              <div>
                <p className="text-gray-400">Idioma</p>
                <p className="font-semibold text-white">{videoClip.language}</p>
              </div>
              <div>
                <p className="text-gray-400">Duração</p>
                <p className="font-semibold text-white">{videoClip.duration} min</p>
              </div>
              <div>
                <p className="text-gray-400">Legendas</p>
                <p className="font-semibold text-white">{videoClip.subtitlesEnabled ? "Ativadas" : "Desativadas"}</p>
              </div>
              {videoClip.watermark && (
                <div>
                  <p className="text-gray-400">Marca d'água</p>
                  <p className="font-semibold text-white">{videoClip.watermark}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botão Gerar */}
        <Button
          onClick={generateVideo}
          disabled={isGeneratingVideo || isGeneratingScenes || (!manSceneUrl && !womanSceneUrl && !bothSceneUrl)}
          className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 py-6 text-lg mb-4"
        >
          {isGeneratingVideo ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Gerando Videoclipe...
            </>
          ) : (
            <>
              <Video className="w-5 h-5 mr-2" />
              Gerar Videoclipe Final
            </>
          )}
        </Button>

        {/* Aviso sobre API */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-sm text-yellow-200">
          <p className="font-semibold mb-2">⚠️ Nota Importante:</p>
          <p>
            A geração real de videoclipes com sincronização labial requer integração com APIs especializadas como:
            <strong> Runway ML, D-ID, Synthesia, Pika Labs</strong> ou similares. 
            Esta é uma versão demo que mostra a interface e fluxo do sistema.
          </p>
        </div>

        {/* Vídeo Demo (quando disponível) */}
        {videoClip.videoUrl && videoClip.status === "completed" && (
          <Card className="bg-[#121214] border-[#27272a] mt-6">
            <CardContent className="p-6">
              <Label className="text-sm font-bold uppercase text-white mb-4 block">
                Videoclipe Gerado
              </Label>
              <video src={videoClip.videoUrl} controls className="w-full rounded-lg mb-4" />
              <Button className="w-full bg-green-600 hover:bg-green-500">
                <Download className="w-4 h-4 mr-2" />
                Baixar Videoclipe
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}