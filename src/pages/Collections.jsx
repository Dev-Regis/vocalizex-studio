import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Folder, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Collections() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [newCollection, setNewCollection] = useState({ name: "", description: "" });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const data = await base44.entities.Collection.list("-created_date");
      setCollections(data);
    } catch (error) {
      toast.error("Erro ao carregar coleções");
    }
  };

  const handleCreate = async () => {
    if (!newCollection.name.trim()) {
      toast.error("Digite um nome para a coleção");
      return;
    }

    try {
      await base44.entities.Collection.create(newCollection);
      setNewCollection({ name: "", description: "" });
      setIsOpen(false);
      loadCollections();
      toast.success("Coleção criada!");
    } catch (error) {
      toast.error("Erro ao criar coleção");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir esta coleção?")) return;

    try {
      await base44.entities.Collection.delete(id);
      setCollections(collections.filter(c => c.id !== id));
      toast.success("Coleção excluída!");
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  };

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
              Minhas Coleções
            </h1>
            <p className="text-gray-400 mt-2">Organize suas criações em coleções</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-500">
                <Plus className="w-4 h-4 mr-2" />
                Nova Coleção
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121214] border-[#27272a] text-white">
              <DialogHeader>
                <DialogTitle>Criar Nova Coleção</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                  placeholder="Nome da coleção"
                  className="bg-[#18181b] border-[#27272a] text-white"
                />
                <Textarea
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                  placeholder="Descrição (opcional)"
                  className="bg-[#18181b] border-[#27272a] text-white"
                />
                <Button onClick={handleCreate} className="w-full bg-purple-600 hover:bg-purple-500">
                  Criar Coleção
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card key={collection.id} className="bg-[#121214] border-[#27272a] hover:border-purple-500 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Folder className="w-12 h-12 text-purple-400" />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(collection.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{collection.name}</h3>
                <p className="text-sm text-gray-400">{collection.description || "Sem descrição"}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {collections.length === 0 && (
          <Card className="bg-[#121214] border-[#27272a] p-12 text-center">
            <Folder className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-4">Você ainda não criou nenhuma coleção</p>
            <Button onClick={() => setIsOpen(true)} className="bg-purple-600 hover:bg-purple-500">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Coleção
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}