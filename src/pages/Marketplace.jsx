import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ShoppingBag, Search, Star } from "lucide-react";
import { toast } from "sonner";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await base44.entities.MarketplaceItem.list("-sales_count");
      setItems(data);
    } catch (error) {
      toast.error("Erro ao carregar");
    }
  };

  const handleBuy = async (item) => {
    try {
      await base44.entities.MarketplaceItem.update(item.id, {
        sales_count: (item.sales_count || 0) + 1
      });
      toast.success("Comprado com sucesso!");
      loadItems();
    } catch (error) {
      toast.error("Erro ao comprar");
    }
  };

  const filteredItems = items.filter(item => {
    const matchFilter = filter === "all" || item.type === filter;
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Marketplace
          </h1>
          <p className="text-gray-400 mt-2">Compre e venda prompts, templates e criações</p>
        </div>

        <div className="flex gap-4 mb-6">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="flex-1 bg-[#121214] border-[#27272a] text-white" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48 bg-[#121214] border-[#27272a] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#121214] border-[#27272a]">
              <SelectItem value="all" className="text-white">Todos</SelectItem>
              <SelectItem value="prompt" className="text-white">Prompts</SelectItem>
              <SelectItem value="template" className="text-white">Templates</SelectItem>
              <SelectItem value="creation" className="text-white">Criações</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-[#121214] border-[#27272a] hover:border-green-500 transition-all">
              <CardContent className="p-6">
                {item.preview_url && (
                  <img src={item.preview_url} className="w-full h-40 object-cover rounded-lg mb-4" />
                )}
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-green-400">{item.price} créditos</div>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <ShoppingBag className="w-4 h-4" />
                    {item.sales_count || 0} vendas
                  </div>
                </div>
                <Button onClick={() => handleBuy(item)} className="w-full bg-green-600 hover:bg-green-500">
                  Comprar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card className="bg-[#121214] border-[#27272a] p-12 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Nenhum item encontrado</p>
          </Card>
        )}
      </div>
    </div>
  );
}