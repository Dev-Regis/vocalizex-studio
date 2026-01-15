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
  const [isGeneratingScenes, setIsGeneratingScenes] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isRegeneratingMan, setIsRegeneratingMan] = useState(false);
  const [isRegeneratingWoman, setIsRegeneratingWoman] = useState(false);

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

      if (!clip.photoMan && !clip.photoWoman) {
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
      // Criar prompt baseado na letra
      const scenePrompt = `Cenário fotorrealista profissional para videoclipe. ${clip.sceneDescription || 'Cenário moderno e cinematográfico'}. Baseado na letra: ${clip.lyrics.substring(0, 200)}. Iluminação profissional, alta qualidade, 8K, cinematográfico.`;

      // Gerar cena para homem
      if (clip.photoMan && !manSceneUrl) {
        const manResponse = await base44.integrations.Core.GenerateImage({
          prompt: `${scenePrompt} Homem em destaque, corpo completo, expressão profissional.`,
          existing_image_urls: [clip.photoMan]
        });
        const manUrl = manResponse.url || manResponse.file_url || manResponse;
        setManSceneUrl(manUrl);
      }

      // Gerar cena para mulher
      if (clip.photoWoman && !womanSceneUrl) {
        const womanResponse = await base44.integrations.Core.GenerateImage({
          prompt: `${scenePrompt} Mulher em destaque, corpo completo, expressão profissional.`,
          existing_image_urls: [clip.photoWoman]
        });
        const womanUrl = womanResponse.url || womanResponse.file_url || womanResponse;
        setWomanSceneUrl(womanUrl);
      }

      toast.success("Cenas geradas com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar cenas");
      console.error(error);
    } finally {
      setIsGeneratingScenes(false);
    }
  };

  const regenerateScene = async (gender) => {
    if (gender === "man") {
      setIsRegeneratingMan(true);
    } else {
      setIsRegeneratingWoman(true);
    }

    try {
      const scenePrompt = `Cenário fotorrealista profissional para videoclipe. ${videoClip.sceneDescription || 'Cenário moderno e cinematográfico'}. Baseado na letra: ${videoClip.lyrics.substring(0, 200)}. Iluminação profissional, alta qualidade, 8K, cinematográfico. VARIAÇÃO ÚNICA E DIFERENTE.`;

      if (gender === "man") {
        const response = await base44.integrations.Core.GenerateImage({
          prompt: `${scenePrompt} Homem em destaque, corpo completo, expressão profissional.`,
          existing_image_urls: [videoClip.photoMan]
        });
        const url = response.url || response.file_url || response;
        setManSceneUrl(url);
        toast.success("Cena do homem regenerada!");
      } else {
        const response = await base44.integrations.Core.GenerateImage({
          prompt: `${scenePrompt} Mulher em destaque, corpo completo, expressão profissional.`,
          existing_image_urls: [videoClip.photoWoman]
        });
        const url = response.url || response.file_url || response;
        setWomanSceneUrl(url);
        toast.success("Cena da mulher regenerada!");
      }
    } catch (error) {
      toast.error("Erro ao regenerar cena");
      console.error(error);
    } finally {
      if (gender === "man") {
        setIsRegeneratingMan(false);
      } else {
        setIsRegeneratingWoman(false);
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

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Cena do Homem */}
          {videoClip.photoMan && (
            <Card className="bg-[#121214] border-[#27272a]">
              <CardContent className="p-6">
                <Label className="text-sm font-bold uppercase text-gray-400 mb-4 block">
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
                      className="w-full h-64 object-cover rounded-lg"
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
                <Label className="text-sm font-bold uppercase text-gray-400 mb-4 block">
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
                      className="w-full h-64 object-cover rounded-lg"
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
        </div>

        {/* Música */}
        <Card className="bg-[#121214] border-[#27272a] mb-6">
          <CardContent className="p-6">
            <Label className="text-sm font-bold uppercase text-gray-400 mb-4 block">
              Música
            </Label>
            <audio src={videoClip.musicUrl} controls className="w-full" />
          </CardContent>
        </Card>

        {/* Letra */}
        <Card className="bg-[#121214] border-[#27272a] mb-6">
          <CardContent className="p-6">
            <Label className="text-sm font-bold uppercase text-gray-400 mb-4 block">
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
            <Label className="text-sm font-bold uppercase text-gray-400 mb-4 block">
              Configurações
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Tipo</p>
                <p className="font-semibold capitalize">{videoClip.type}</p>
              </div>
              <div>
                <p className="text-gray-500">Orientação</p>
                <p className="font-semibold capitalize">{videoClip.orientation}</p>
              </div>
              <div>
                <p className="text-gray-500">Idioma</p>
                <p className="font-semibold">{videoClip.language}</p>
              </div>
              <div>
                <p className="text-gray-500">Duração</p>
                <p className="font-semibold">{videoClip.duration} min</p>
              </div>
              <div>
                <p className="text-gray-500">Legendas</p>
                <p className="font-semibold">{videoClip.subtitlesEnabled ? "Ativadas" : "Desativadas"}</p>
              </div>
              {videoClip.watermark && (
                <div>
                  <p className="text-gray-500">Marca d'água</p>
                  <p className="font-semibold">{videoClip.watermark}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botão Gerar */}
        <Button
          onClick={generateVideo}
          disabled={isGeneratingVideo || isGeneratingScenes || !manSceneUrl && !womanSceneUrl}
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
              <Label className="text-sm font-bold uppercase text-gray-400 mb-4 block">
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