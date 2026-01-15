import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Music, BarChart3, PieChart, TrendingUp, 
  Lightbulb, Clock, RefreshCw, ArrowLeft,
  Pencil, Eye, Copy, Save, Trash2
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartPieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [selectedSong, setSelectedSong] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState([]);

  const queryClient = useQueryClient();

  const { data: songs = [], isLoading, refetch } = useQuery({
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

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Song.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['songs']);
      toast.success("Letra excluída!");
    },
  });

  // Estatísticas
  const stats = useMemo(() => {
    const totalSongs = songs.length;
    const uniqueGenres = [...new Set(songs.map(s => s.musicStyle))].length;
    const uniqueConcepts = [...new Set(songs.map(s => s.concept?.substring(0, 50)))].length;

    return { totalSongs, uniqueGenres, uniqueConcepts };
  }, [songs]);

  // Gêneros mais populares
  const genreData = useMemo(() => {
    const genreCounts = {};
    songs.forEach(song => {
      const genre = song.musicStyle || 'Indefinido';
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
    return Object.entries(genreCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [songs]);

  // Distribuição de temas (conceitos)
  const themeData = useMemo(() => {
    const themes = {};
    songs.forEach(song => {
      const concept = song.concept?.substring(0, 30) || 'Sem tema';
      themes[concept] = (themes[concept] || 0) + 1;
    });
    return Object.entries(themes)
      .map(([name, value]) => ({ name, value }))
      .slice(0, 5);
  }, [songs]);

  // Histórico recente
  const recentSongs = songs.slice(0, 5);

  const viewSong = (song) => {
    setSelectedSong(song);
    setIsEditing(false);
    setEditedLyrics(JSON.parse(song.lyrics));
  };

  const editSong = (song) => {
    setSelectedSong(song);
    setIsEditing(true);
    const parsedLyrics = JSON.parse(song.lyrics);
    // Converter / para quebras de linha para edição
    const cleanedLyrics = parsedLyrics.map(part => ({
      ...part,
      lyrics: part.lyrics.split(' / ').join('\n')
    }));
    setEditedLyrics(cleanedLyrics);
  };

  const saveSong = () => {
    // Converter quebras de linha de volta para /
    const savedLyrics = editedLyrics.map(part => ({
      ...part,
      lyrics: part.lyrics.split('\n').filter(l => l.trim()).join(' / ')
    }));
    updateMutation.mutate({
      id: selectedSong.id,
      data: { lyrics: JSON.stringify(savedLyrics) }
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

  const handleRefresh = () => {
    refetch();
    toast.success("Dados atualizados!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1e] via-[#1a1a3e] to-[#0a0a1e] text-white">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard de Análise</h1>
              <p className="text-sm text-gray-400">Explore tendências e resultados do Gerador de Letras</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("LyricGenerator")}>
              <Button className="bg-purple-600 hover:bg-purple-500">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Gerador
              </Button>
            </Link>
            <Button onClick={handleRefresh} variant="outline" className="border-gray-600 hover:bg-gray-800">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar Dados
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1a3e] border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Music className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400 uppercase">Total de Músicas</span>
            </div>
            <div className="text-4xl font-bold text-blue-400">{stats.totalSongs}</div>
            <p className="text-xs text-gray-500 mt-1">Letras geradas nesta sessão</p>
          </div>

          <div className="bg-[#1a1a3e] border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400 uppercase">Gêneros Únicos</span>
            </div>
            <div className="text-4xl font-bold text-purple-400">{stats.uniqueGenres}</div>
            <p className="text-xs text-gray-500 mt-1">Estilos musicais diferentes</p>
          </div>

          <div className="bg-[#1a1a3e] border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-gray-400 uppercase">Temas Explorados</span>
            </div>
            <div className="text-4xl font-bold text-cyan-400">{stats.uniqueConcepts}</div>
            <p className="text-xs text-gray-500 mt-1">Conceitos distintos utilizados</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gêneros Mais Populares */}
          <div className="bg-[#1a1a3e] border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold">Gêneros Mais Populares</h3>
            </div>
            {genreData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={genreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a3e', border: '1px solid #6b21a8' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-gray-500">
                <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
                <p>Nenhum gênero registrado</p>
              </div>
            )}
          </div>

          {/* Distribuição de Temas */}
          <div className="bg-[#1a1a3e] border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-pink-400" />
              <h3 className="text-xl font-bold">Distribuição de Temas</h3>
            </div>
            {themeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartPieChart>
                  <Pie
                    data={themeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {themeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a3e', border: '1px solid #6b21a8' }}
                  />
                </RechartPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-gray-500">
                <PieChart className="w-12 h-12 mb-2 opacity-50" />
                <p>Nenhuma música gerada ainda</p>
              </div>
            )}
          </div>

          {/* Ranking de Gêneros */}
          <div className="bg-[#1a1a3e] border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="text-xl font-bold">Ranking de Gêneros</h3>
            </div>
            {genreData.length > 0 ? (
              <div className="space-y-3">
                {genreData.map((genre, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center font-bold text-purple-400">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{genre.name}</span>
                        <span className="text-sm text-gray-400">{genre.value} músicas</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${(genre.value / songs.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-gray-500">
                <TrendingUp className="w-12 h-12 mb-2 opacity-50" />
                <p>Nenhum gênero registrado</p>
              </div>
            )}
          </div>

          {/* Temas Mais Utilizados */}
          <div className="bg-[#1a1a3e] border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <h3 className="text-xl font-bold">Temas Mais Utilizados</h3>
            </div>
            {themeData.length > 0 ? (
              <div className="space-y-2">
                {themeData.map((theme, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#0a0a1e] rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">{theme.name}</span>
                    </div>
                    <span className="text-sm font-bold text-yellow-400">{theme.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-gray-500">
                <Lightbulb className="w-12 h-12 mb-2 opacity-50" />
                <p>Nenhum tema registrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Histórico Recente */}
        <div className="bg-[#1a1a3e] border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold">Histórico Recente</h3>
          </div>
          {isLoading ? (
            <div className="text-center py-12">
              <Music className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-pulse" />
              <p className="text-gray-400">Carregando letras...</p>
            </div>
          ) : recentSongs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-500 opacity-50" />
              <p className="text-gray-400">Nenhuma letra salva ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSongs.map((song) => (
                <div
                  key={song.id}
                  className="bg-[#0a0a1e] border border-gray-700 rounded-xl p-4 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-1">{song.title}</h4>
                      <div className="flex gap-4 text-sm">
                        <span className="text-purple-400">
                          {song.musicStyle}
                        </span>
                        <span className="text-gray-400">
                          {song.duration} min
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
                      <Button
                        onClick={() => {
                          if (confirm('Deseja realmente excluir esta letra?')) {
                            deleteMutation.mutate(song.id);
                          }
                        }}
                        className="bg-red-600 hover:bg-red-500"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View/Edit Dialog */}
        <Dialog open={!!selectedSong} onOpenChange={() => setSelectedSong(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#0a0a1e] border-purple-500/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {isEditing ? "Editar Letra" : "Visualizar Letra"}
              </DialogTitle>
            </DialogHeader>
            
            {selectedSong && (
              <div className="space-y-4">
                <div className="bg-[#1a1a3e] border border-purple-500/20 rounded-lg p-4">
                  <h3 className="text-xl font-bold mb-2">{selectedSong.title}</h3>
                  <div className="text-sm text-gray-400">
                    <p>Estilo: {selectedSong.musicStyle}</p>
                    <p>Duração: {selectedSong.duration} minutos</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {editedLyrics.map((part, idx) => (
                    <div key={idx} className="bg-[#1a1a3e] border border-purple-500/20 rounded-lg p-4">
                      <div className="mb-3">
                        <div className="font-bold text-purple-400 mb-1">[{part.section} • {part.startTime}]</div>
                        <div className="text-pink-400 text-sm">{part.tag}</div>
                      </div>
                      {isEditing ? (
                        <Textarea
                          value={part.lyrics}
                          onChange={(e) => updateLyricPart(idx, 'lyrics', e.target.value)}
                          className="bg-[#0a0a1e] border-gray-700 text-white min-h-[120px] font-mono"
                        />
                      ) : (
                        <div className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
                          {part.lyrics.split(' / ').join('\n')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div className="flex gap-3">
                    <Button
                      onClick={saveSong}
                      className="flex-1 bg-green-600 hover:bg-green-500"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedLyrics(JSON.parse(selectedSong.lyrics));
                      }}
                      variant="outline"
                      className="flex-1 border-gray-600"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}