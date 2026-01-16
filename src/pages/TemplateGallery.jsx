import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Copy, Wand2, Search } from "lucide-react";
import { toast } from "sonner";

export default function TemplateGallery() {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, category, searchTerm]);

  const loadTemplates = async () => {
    try {
      const data = await base44.entities.Template.list();
      setTemplates(data);
    } catch (error) {
      console.error(error);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;
    
    if (category !== "all") {
      filtered = filtered.filter(t => t.category === category);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.prompt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTemplates(filtered);
  };

  const handleCopyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copiado!");
  };

  const categories = [
    { value: "all", label: "Todos" },
    { value: "portrait", label: "Retrato" },
    { value: "landscape", label: "Paisagem" },
    { value: "abstract", label: "Abstrato" },
    { value: "fantasy", label: "Fantasia" },
    { value: "realistic", label: "Realista" },
    { value: "artistic", label: "Artístico" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Galeria de Templates
          </h1>
          <p className="text-gray-400">Prompts prontos para diferentes estilos</p>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar templates..."
              className="bg-[#121214] border-[#27272a] text-white"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48 bg-[#121214] border-[#27272a] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#121214] border-[#27272a]">
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value} className="text-white">
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredTemplates.length === 0 ? (
          <Card className="bg-[#121214] border-[#27272a] p-12 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Nenhum template encontrado</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="bg-[#121214] border-[#27272a] hover:border-purple-500 transition-all">
                <CardContent className="p-6">
                  {template.thumbnail && (
                    <img src={template.thumbnail} alt={template.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                  )}
                  <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{template.prompt}</p>
                  <div className="flex gap-2">
                    <Button onClick={() => handleCopyPrompt(template.prompt)} variant="outline" className="flex-1 border-[#27272a] text-gray-300">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                    <Button asChild className="flex-1 bg-purple-600 hover:bg-purple-500">
                      <Link to={createPageUrl(`ImageCreator?prompt=${encodeURIComponent(template.prompt)}`)}>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Usar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}