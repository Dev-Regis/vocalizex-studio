import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Palette, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";

export default function SavedStyles() {
  const navigate = useNavigate();
  const [styles, setStyles] = useState([]);

  useEffect(() => {
    loadStyles();
  }, []);

  const loadStyles = async () => {
    try {
      const data = await base44.entities.UserStyle.list("-created_date");
      setStyles(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Excluir este estilo?")) return;

    try {
      await base44.entities.UserStyle.delete(id);
      setStyles(styles.filter(s => s.id !== id));
      toast.success("Estilo excluído!");
    } catch (error) {
      toast.error("Erro");
    }
  };

  const handleUse = (style) => {
    navigate(createPageUrl(`ImageCreator?prompt=${encodeURIComponent(style.prompt_template)}`));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Estilos Favoritos
          </h1>
          <p className="text-gray-400 mt-2">Seus estilos salvos para reutilizar</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {styles.map((style) => (
            <Card key={style.id} className="bg-[#121214] border-[#27272a] hover:border-pink-500 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Palette className="w-8 h-8 text-pink-400" />
                  <Button onClick={() => handleDelete(style.id)} variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="text-lg font-bold mb-2">{style.name}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">{style.prompt_template}</p>
                <Button onClick={() => handleUse(style)} className="w-full bg-gradient-to-r from-pink-600 to-purple-600">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Usar Estilo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {styles.length === 0 && (
          <Card className="bg-[#121214] border-[#27272a] p-12 text-center">
            <Palette className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Nenhum estilo salvo ainda</p>
          </Card>
        )}
      </div>
    </div>
  );
}