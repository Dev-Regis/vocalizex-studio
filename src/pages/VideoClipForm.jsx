import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X, Video, Music as MusicIcon, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function VideoClipForm() {
  const navigate = useNavigate();
  const [photoMan, setPhotoMan] = useState(null);
  const [photoWoman, setPhotoWoman] = useState(null);
  const [photoBoth, setPhotoBoth] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [type, setType] = useState("videoclipe");
  const [orientation, setOrientation] = useState("vertical");
  const [language, setLanguage] = useState("pt-BR");
  const [lyrics, setLyrics] = useState("");
  const [sceneDescription, setSceneDescription] = useState("");
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [watermark, setWatermark] = useState("");
  const [duration, setDuration] = useState(3);
  const [isUploading, setIsUploading] = useState(false);

  const manInputRef = useRef(null);
  const womanInputRef = useRef(null);
  const bothInputRef = useRef(null);
  const musicInputRef = useRef(null);

  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Foto não pode exceder 20MB");
      return;
    }

    try {
      setIsUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (type === "man") {
        setPhotoMan({ url: file_url, name: file.name });
        toast.success("Foto do homem enviada!");
      } else if (type === "woman") {
        setPhotoWoman({ url: file_url, name: file.name });
        toast.success("Foto da mulher enviada!");
      } else {
        setPhotoBoth({ url: file_url, name: file.name });
        toast.success("Foto enviada!");
      }
    } catch (error) {
      toast.error("Erro ao enviar foto");
    } finally {
      setIsUploading(false);
    }
  };

  const handleMusicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      toast.error("Apenas arquivos de áudio são permitidos");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Música não pode exceder 50MB");
      return;
    }

    try {
      setIsUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setMusicFile({ url: file_url, name: file.name });
      toast.success("Música enviada!");
    } catch (error) {
      toast.error("Erro ao enviar música");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!photoMan && !photoWoman && !photoBoth) {
      toast.error("Adicione pelo menos uma foto");
      return;
    }

    if (!musicFile) {
      toast.error("Adicione uma música");
      return;
    }

    if (!lyrics.trim()) {
      toast.error("Digite a letra da música");
      return;
    }

    if (watermark && watermark.length > 12) {
      toast.error("Marca d'água deve ter no máximo 12 caracteres");
      return;
    }

    try {
      const data = {
        photoMan: photoMan?.url,
        photoWoman: photoWoman?.url,
        photoBoth: photoBoth?.url,
        musicUrl: musicFile.url,
        type,
        orientation,
        language,
        lyrics,
        sceneDescription,
        subtitlesEnabled,
        watermark,
        duration,
        status: "draft"
      };

      const videoClip = await base44.entities.VideoClip.create(data);
      toast.success("Configurações salvas!");
      navigate(createPageUrl(`VideoClipPreview?id=${videoClip.id}`));
    } catch (error) {
      toast.error("Erro ao salvar configurações");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-red-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <Link 
            to={createPageUrl("Home")} 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-black mb-2">Criar Videoclipe ou Short</h1>
            <p className="text-gray-400">Configure seu videoclipe profissional com sincronização labial</p>
          </div>
        </header>

        <div className="space-y-6">
          {/* Fotos */}
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <Label className="text-sm font-bold uppercase text-white mb-4 block">
                Fotos (Obrigatório: Escolha pelo menos uma opção)
              </Label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Foto do Homem */}
                <div>
                  <input
                    ref={manInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, "man")}
                    className="hidden"
                  />

                  {photoMan ? (
                    <div className="relative">
                      <img
                        src={photoMan.url}
                        alt="Homem"
                        className="w-full h-48 object-contain bg-[#18181b] rounded-lg border-2 border-blue-500"
                      />
                      <button
                        onClick={() => setPhotoMan(null)}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs">
                        Homem
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => manInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-8 hover:border-blue-500 transition-colors"
                    >
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                      <p className="text-sm font-semibold">Foto do Homem</p>
                      <p className="text-xs text-gray-500 mt-1">Clique para adicionar</p>
                    </button>
                  )}
                </div>

                {/* Foto da Mulher */}
                <div>
                  <input
                    ref={womanInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, "woman")}
                    className="hidden"
                  />

                  {photoWoman ? (
                    <div className="relative">
                      <img
                        src={photoWoman.url}
                        alt="Mulher"
                        className="w-full h-48 object-contain bg-[#18181b] rounded-lg border-2 border-pink-500"
                      />
                      <button
                        onClick={() => setPhotoWoman(null)}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs">
                        Mulher
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => womanInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-8 hover:border-pink-500 transition-colors"
                    >
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                      <p className="text-sm font-semibold">Foto da Mulher</p>
                      <p className="text-xs text-gray-500 mt-1">Clique para adicionar</p>
                    </button>
                  )}
                </div>

                {/* Foto Ambos */}
                <div>
                  <input
                    ref={bothInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, "both")}
                    className="hidden"
                  />

                  {photoBoth ? (
                    <div className="relative">
                      <img
                        src={photoBoth.url}
                        alt="Ambos"
                        className="w-full h-48 object-contain bg-[#18181b] rounded-lg border-2 border-purple-500"
                      />
                      <button
                        onClick={() => setPhotoBoth(null)}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs">
                        Ambos
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => bothInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-8 hover:border-purple-500 transition-colors"
                    >
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                      <p className="text-sm font-semibold">Foto Ambos</p>
                      <p className="text-xs text-gray-500 mt-1">Múltiplas pessoas</p>
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Música */}
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <Label className="text-sm font-bold uppercase text-white mb-4 block">
                Música (MP3) *
              </Label>

              <input
                ref={musicInputRef}
                type="file"
                accept="audio/mp3,audio/mpeg"
                onChange={handleMusicUpload}
                className="hidden"
              />

              {musicFile ? (
                <div className="flex items-center gap-3 bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                  <MusicIcon className="w-6 h-6 text-red-400" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{musicFile.name}</p>
                    <audio src={musicFile.url} controls className="w-full mt-2" />
                  </div>
                  <button
                    onClick={() => setMusicFile(null)}
                    className="bg-red-500 rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => musicInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-8 hover:border-red-500 transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <p className="text-sm font-semibold">Importar Música</p>
                  <p className="text-xs text-gray-500 mt-1">Formato: MP3</p>
                </button>
              )}
            </CardContent>
          </Card>

          {/* Tipo e Orientação */}
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-bold uppercase text-white mb-3 block">
                  Tipo de Vídeo
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="bg-[#18181b] border-[#27272a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121214] border-[#27272a]">
                    <SelectItem value="videoclipe" className="text-white">Videoclipe</SelectItem>
                    <SelectItem value="short" className="text-white">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-bold uppercase text-white mb-3 block">
                  Orientação
                </Label>
                <Select value={orientation} onValueChange={setOrientation}>
                  <SelectTrigger className="bg-[#18181b] border-[#27272a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121214] border-[#27272a]">
                    <SelectItem value="vertical" className="text-white">Vertical (9:16)</SelectItem>
                    <SelectItem value="horizontal" className="text-white">Horizontal (16:9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-bold uppercase text-white mb-3 block">
                  Idioma
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-[#18181b] border-[#27272a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121214] border-[#27272a]">
                    <SelectItem value="pt-BR" className="text-white">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US" className="text-white">English (US)</SelectItem>
                    <SelectItem value="es-ES" className="text-white">Español</SelectItem>
                    <SelectItem value="fr-FR" className="text-white">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Letra */}
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <Label className="text-sm font-bold uppercase text-white mb-3 block">
                Letra da Música *
              </Label>
              <Textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Cole a letra aqui. Use [Ele] para partes do homem, [Ela] para mulher, [Ambos] para dueto..."
                className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[200px]"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Use [Verso 1 • 0:15] para marcar o tempo, [Ele]/[Ela]/[Ambos] para quem canta
              </p>
            </CardContent>
          </Card>

          {/* Cenário */}
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <Label className="text-sm font-bold uppercase text-white mb-3 block">
                Descrição do Cenário (Opcional)
              </Label>
              <Textarea
                value={sceneDescription}
                onChange={(e) => setSceneDescription(e.target.value)}
                placeholder="Descreva o cenário, estilo visual, iluminação, etc..."
                className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Legendas e Marca d'água */}
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold uppercase text-white">Legendas</Label>
                  <p className="text-xs text-gray-500 mt-1">Mostrar letra no rodapé do vídeo</p>
                </div>
                <Switch checked={subtitlesEnabled} onCheckedChange={setSubtitlesEnabled} />
              </div>

              <div>
                <Label className="text-sm font-bold uppercase text-white mb-3 block">
                  Marca d'água (Opcional - Máx. 12 caracteres)
                </Label>
                <Input
                  value={watermark}
                  onChange={(e) => setWatermark(e.target.value.slice(0, 12))}
                  maxLength={12}
                  placeholder="Seu texto aqui"
                  className="bg-[#18181b] border-[#27272a] text-white"
                />
                <p className="text-xs text-gray-500 mt-2">{watermark.length}/12 caracteres</p>
              </div>
            </CardContent>
          </Card>

          {/* Duração */}
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <Label className="text-sm font-bold uppercase text-white mb-3 block">
                Duração do Vídeo: {duration} minuto{duration !== 1 ? 's' : ''}
              </Label>
              <input
                type="range"
                min="1"
                max="8"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1 min</span>
                <span>4 min</span>
                <span>8 min</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">⏱️ Máximo: 8 minutos</p>
            </CardContent>
          </Card>

          {/* Botão */}
          <Button
            onClick={handleSubmit}
            disabled={isUploading || (!photoMan && !photoWoman && !photoBoth) || !musicFile || !lyrics.trim()}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 py-6 text-lg"
          >
            <Video className="w-5 h-5 mr-2" />
            Continuar para Preview
          </Button>
        </div>
      </div>
    </div>
  );
}