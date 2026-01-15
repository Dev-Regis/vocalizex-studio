import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Pencil, Eye, Copy, Save, Music } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const [filterStyle, setFilterStyle] = useState("all");
  const [selectedSong, setSelectedSong] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState([]);

  const queryClient = useQueryClient();

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['songs'],
    queryFn: () => base44.entities.Song.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Song.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['songs']);
      toast.success("Letra atualizada!");
      setSelectedSong(null);
      setIsEditing(false);
    },
  });

  const filteredSongs = filterStyle === "all" 
    ? songs 
    : songs.filter(s => s.musicStyle === filterStyle);

  const uniqueStyles = [...new Set(songs.map(s => s.musicStyle))];

  const viewSong = (song) => {
    setSelectedSong(song);
    setIsEditing(false);
    setEditedLyrics(JSON.parse(song.lyrics));
  };

  const editSong = (song) => {
    setSelectedSong(song);
    setIsEditing(true);
    setEditedLyrics(JSON.parse(song.lyrics));
  };

  const saveSong = () => {
    updateMutation.mutate({
      id: selectedSong.id,
      data: { lyrics: JSON.stringify(editedLyrics) }
    });
  };

  const copyLyrics = (song) => {
    const parts = JSON.parse(song.lyrics);
    const text = parts.map(p => `[${p.section} • ${p.startTime}]\n${p.tag}\n${p.lyrics.split(' / ').join('\n')}`).join("\n\n");
    navigator.clipboard.writeText(`${song.title}\n\n${text}`);
    toast.success("Letra copiada!");
  };

  const updateLyricPart = (idx, field, value) => {
    const updated = [...editedLyrics];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditedLyrics(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <Link 
            to={createPageUrl("LyricGenerator")} 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8">Dashboard de Letras</h1>

        {/* Filter */}
        <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6 mb-6">
          <label className="block text-sm font-semibold mb-3 uppercase text-gray-300">
            Filtrar por Estilo
          </label>
          <Select value={filterStyle} onValueChange={setFilterStyle}>
            <SelectTrigger className="bg-[#18181b] border-[#27272a] max-w-xs">
              <SelectValue placeholder="Todos os estilos" />
            </SelectTrigger>
            <SelectContent className="bg-[#121214] border-[#27272a]">
              <SelectItem value="all" className="text-white">Todos os estilos</SelectItem>
              {uniqueStyles.map((style) => (
                <SelectItem key={style} value={style} className="text-white">
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Songs List */}
        {isLoading ? (
          <div className="text-center py-12">
            <Music className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-pulse" />
            <p className="text-gray-400">Carregando letras...</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Nenhuma letra salva ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSongs.map((song) => (
              <div
                key={song.id}
                className="bg-[#121214] border border-[#27272a] rounded-xl p-6 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{song.title}</h3>
                    <div className="flex gap-4 text-sm">
                      <span className="text-purple-400">
                        Estilo: {song.musicStyle}
                      </span>
                      <span className="text-gray-400">
                        Duração: {song.duration} min
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => viewSong(song)}
                      className="bg-blue-600 hover:bg-blue-500"
                      size="sm"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => editSong(song)}
                      className="bg-yellow-600 hover:bg-yellow-500"
                      size="sm"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => copyLyrics(song)}
                      className="bg-gray-600 hover:bg-gray-500"
                      size="sm"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View/Edit Dialog */}
        <Dialog open={!!selectedSong} onOpenChange={() => setSelectedSong(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#121214] border-[#27272a] text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {isEditing ? "Editar Letra" : "Visualizar Letra"}
              </DialogTitle>
            </DialogHeader>
            
            {selectedSong && (
              <div className="space-y-4">
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                  <h3 className="text-xl font-bold mb-2">{selectedSong.title}</h3>
                  <div className="text-sm text-gray-400">
                    <p>Estilo: {selectedSong.musicStyle}</p>
                    <p>Duração: {selectedSong.duration} minutos</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {editedLyrics.map((part, idx) => (
                    <div key={idx} className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                      <div className="mb-2">
                        <div className="font-bold text-purple-400 mb-1">[{part.section} • {part.startTime}]</div>
                        <div className="text-pink-400 text-sm">{part.tag}</div>
                      </div>
                      {isEditing ? (
                        <Textarea
                          value={part.lyrics}
                          onChange={(e) => updateLyricPart(idx, 'lyrics', e.target.value)}
                          className="bg-[#0a0a0b] border-[#27272a] text-white min-h-[100px]"
                        />
                      ) : (
                        <div className="text-gray-200 text-sm whitespace-pre-wrap">
                          {part.lyrics.split(' / ').join('\n')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <Button
                    onClick={saveSong}
                    className="w-full bg-green-600 hover:bg-green-500"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}