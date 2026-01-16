import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Search, Music } from "lucide-react";
import { toast } from "sonner";

export default function LyricIdentifier() {
  const [lyrics, setLyrics] = useState("");
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const identifyLyrics = async () => {
    if (!lyrics.trim()) {
      toast.error("Cole a letra ou parte da letra");
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading("Buscando na internet...", { id: 'identify' });
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Identifique se esta letra pertence a uma música já existente:\n\n"${lyrics}"\n\nResponda em JSON com este formato:\n{\n  "found": true/false,\n  "songTitle": "Título da música (ou null)",\n  "artist": "Nome do artista (ou null)",\n  "socialMedia": {\n    "instagram": "@handle (ou null)",\n    "spotify": "link (ou null)",\n    "youtube": "link (ou null)",\n    "twitter": "@handle (ou null)"\n  },\n  "similarity": "percentual de certeza"\n}\n\nSe não encontrar, use "found": false.`,
        add_context_from_internet: true
      });

      try {
        const parsed = JSON.parse(response);
        setResult(parsed);
        if (parsed.found) {
          toast.success("Música encontrada!", { id: 'identify' });
        } else {
          toast.info("Nenhuma música encontrada", { id: 'identify' });
        }
      } catch {
        toast.error("Erro ao processar resultado", { id: 'identify' });
      }
    } catch (error) {
      toast.error("Erro na busca", { id: 'identify' });
    } finally {
      setIsProcessing(false);
    }
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
            <Search className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Identificador de Letras</h1>
          <p className="text-gray-400">Descubra se a letra já existe e quem a criou</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
            <label className="block text-sm font-semibold mb-3">Cole a Letra ou Parte Dela</label>
            <Textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Cole a letra ou um trecho dela..."
              className="bg-[#18181b] border-[#27272a] text-white min-h-[300px] mb-4"
              disabled={isProcessing}
            />

            <Button 
              onClick={identifyLyrics} 
              disabled={isProcessing || !lyrics.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 h-12"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              {isProcessing ? "Buscando..." : "Identificar Música"}
            </Button>
          </div>

          {/* Result */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
            <label className="block text-sm font-semibold mb-3">Resultado</label>
            
            {result ? (
              result.found ? (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-semibold">Música Encontrada!</span>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-400">Título</p>
                        <p className="text-white font-semibold">{result.songTitle}</p>
                      </div>

                      <div>
                        <p className="text-gray-400">Artista</p>
                        <p className="text-white font-semibold">{result.artist}</p>
                      </div>

                      <div>
                        <p className="text-gray-400">Certeza</p>
                        <p className="text-white font-semibold">{result.similarity}</p>
                      </div>

                      {result.socialMedia && (
                        <div>
                          <p className="text-gray-400 mb-2">Redes Sociais</p>
                          <div className="flex flex-wrap gap-2">
                            {result.socialMedia.instagram && (
                              <a href={`https://instagram.com/${result.socialMedia.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="bg-pink-600/20 hover:bg-pink-600/40 text-pink-300 px-3 py-1 rounded text-xs transition">
                                Instagram
                              </a>
                            )}
                            {result.socialMedia.spotify && (
                              <a href={result.socialMedia.spotify} target="_blank" rel="noopener noreferrer" className="bg-green-600/20 hover:bg-green-600/40 text-green-300 px-3 py-1 rounded text-xs transition">
                                Spotify
                              </a>
                            )}
                            {result.socialMedia.youtube && (
                              <a href={result.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="bg-red-600/20 hover:bg-red-600/40 text-red-300 px-3 py-1 rounded text-xs transition">
                                YouTube
                              </a>
                            )}
                            {result.socialMedia.twitter && (
                              <a href={`https://twitter.com/${result.socialMedia.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-3 py-1 rounded text-xs transition">
                                Twitter
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4 h-[280px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-400 font-semibold mb-2">❌ Artista Não Encontrado</p>
                    <p className="text-gray-500 text-sm">Não foi possível identificar o artista que pertence a esta letra</p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                O resultado aparecerá aqui
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}