import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Eye, Heart, Image as ImageIcon } from "lucide-react";

export default function Analytics() {
  const [stats, setStats] = useState({
    totalCreations: 0,
    totalViews: 0,
    totalLikes: 0,
    avgLikesPerCreation: 0,
    topCreation: null
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const creations = await base44.entities.Creation.list();
      
      const totalViews = creations.reduce((sum, c) => sum + (c.views_count || 0), 0);
      const totalLikes = creations.reduce((sum, c) => sum + (c.likes_count || 0), 0);
      const topCreation = creations.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))[0];

      setStats({
        totalCreations: creations.length,
        totalViews,
        totalLikes,
        avgLikesPerCreation: creations.length > 0 ? (totalLikes / creations.length).toFixed(1) : 0,
        topCreation
      });
    } catch (error) {
      console.error(error);
    }
  };

  const statCards = [
    { label: "Total de Criações", value: stats.totalCreations, icon: ImageIcon, color: "text-blue-400" },
    { label: "Visualizações", value: stats.totalViews, icon: Eye, color: "text-green-400" },
    { label: "Total de Likes", value: stats.totalLikes, icon: Heart, color: "text-red-400" },
    { label: "Média de Likes", value: stats.avgLikesPerCreation, icon: TrendingUp, color: "text-purple-400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Dashboard de Analytics
          </h1>
          <p className="text-gray-400 mt-2">Acompanhe suas estatísticas e engajamento</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <Card key={idx} className="bg-[#121214] border-[#27272a]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <p className="text-3xl font-black mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {stats.topCreation && (
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">🏆 Criação Mais Popular</h3>
              <div className="flex gap-4">
                <img src={stats.topCreation.content_url} className="w-32 h-32 object-cover rounded-lg" />
                <div className="flex-1">
                  <p className="text-gray-300 mb-2">{stats.topCreation.prompt}</p>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-400" />
                      {stats.topCreation.likes_count || 0} likes
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-green-400" />
                      {stats.topCreation.views_count || 0} views
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}