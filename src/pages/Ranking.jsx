import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";

export default function Ranking() {
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = async () => {
    try {
      const creations = await base44.entities.Creation.list();
      
      const userStats = {};
      creations.forEach(c => {
        if (!userStats[c.created_by]) {
          userStats[c.created_by] = { likes: 0, creations: 0 };
        }
        userStats[c.created_by].likes += c.likes_count || 0;
        userStats[c.created_by].creations += 1;
      });

      const ranking = Object.entries(userStats)
        .map(([email, stats]) => ({ email, ...stats }))
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 10);

      setCreators(ranking);
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (position) => {
    if (position === 0) return <Trophy className="w-8 h-8 text-yellow-400" />;
    if (position === 1) return <Medal className="w-8 h-8 text-gray-400" />;
    if (position === 2) return <Award className="w-8 h-8 text-orange-400" />;
    return <div className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold">{position + 1}</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Ranking Semanal
          </h1>
          <p className="text-gray-400 mt-2">Top criadores por likes e engajamento</p>
        </div>

        <div className="space-y-4">
          {creators.map((creator, idx) => (
            <Card key={idx} className={`bg-[#121214] border-[#27272a] ${idx < 3 ? "border-yellow-500/50" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {getIcon(idx)}
                  <div className="flex-1">
                    <p className="font-bold text-lg">{creator.email}</p>
                    <p className="text-sm text-gray-400">{creator.creations} criações</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-yellow-400">{creator.likes}</p>
                    <p className="text-xs text-gray-500">likes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}