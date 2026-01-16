import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Trash2, Image as ImageIcon, Music, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function CreationHistory() {
  const [creations, setCreations] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadCreations();
  }, []);

  const loadCreations = async () => {
    try {
      const data = await base44.entities.Creation.list("-created_date");
      setCreations(data);
    } catch (error) {
      toast.error("Erro ao carregar histórico");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deseja mesmo excluir esta criação?")) return;

    try {
      await base44.entities.Creation.delete(id);
      setCreations(creations.filter(c => c.id !== id));
      toast.success("Criação excluída!");
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  };

  const handleTogglePublic = async (creation) => {
    try {
      await base44.entities.Creation.update(creation.id, {
        is_public: !creation.is_public
      });
      setCreations(creations.map(c => 
        c.id === creation.id ? { ...c, is_public: !c.is_public } : c
      ));
      toast.success(creation.is_public ? "Removido do feed" : "Publicado no feed!");
    } catch (error) {
      toast.error("Erro ao atualizar");
    }
  };

  const handleDownload = async (url, type) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `creation-${Date.now()}.${type === 'image' ? 'png' : 'txt'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      a.remove();
      toast.success("Download concluído!");
    } catch (error) {
      toast.error("Erro ao baixar");
    }
  };

  const filteredCreations = filter === "all" 
    ? creations 
    : creations.filter(c => c.type === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Histórico de Criações
            </h1>
            <p className="text-gray-400 mt-2">{filteredCreations.length} criações salvas</p>
          </div>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48 bg-[#121214] border-[#27272a] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#121214] border-[#27272a]">
              <SelectItem value="all" className="text-white">Todas</SelectItem>
              <SelectItem value="image" className="text-white">Imagens</SelectItem>
              <SelectItem value="lyrics" className="text-white">Letras</SelectItem>
              <SelectItem value="edited_image" className="text-white">Editadas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreations.map((creation) => (
            <Card key={creation.id} className="bg-[#121214] border-[#27272a] hover:border-purple-500 transition-all">
              <CardContent className="p-6">
                {creation.type === "image" || creation.type === "edited_image" ? (
                  <img src={creation.content_url} alt="Creation" className="w-full h-48 object-cover rounded-lg mb-4" />
                ) : (
                  <div className="w-full h-48 bg-[#18181b] rounded-lg mb-4 flex items-center justify-center">
                    <Music className="w-12 h-12 text-purple-400" />
                  </div>
                )}

                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{creation.prompt || "Sem descrição"}</p>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleTogglePublic(creation)}
                    variant="outline" 
                    size="sm"
                    className="border-[#27272a] text-gray-300"
                  >
                    {creation.is_public ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button 
                    onClick={() => handleDownload(creation.content_url, creation.type)}
                    variant="outline" 
                    size="sm"
                    className="flex-1 border-[#27272a] text-gray-300"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={() => handleDelete(creation.id)}
                    variant="outline" 
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCreations.length === 0 && (
          <Card className="bg-[#121214] border-[#27272a] p-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Nenhuma criação encontrada</p>
          </Card>
        )}
      </div>
    </div>
  );
}