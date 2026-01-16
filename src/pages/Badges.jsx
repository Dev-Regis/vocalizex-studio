import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Award, Lock } from "lucide-react";

export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [userStats, setUserStats] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allBadges = await base44.entities.Badge.list();
      const myBadges = await base44.entities.UserBadge.list();
      
      const creations = await base44.entities.Creation.list();
      const stats = {
        creation_count: creations.length,
        likes_received: creations.reduce((sum, c) => sum + (c.likes_count || 0), 0)
      };

      setBadges(allBadges);
      setUserBadges(myBadges.map(b => b.badge_id));
      setUserStats(stats);
    } catch (error) {
      console.error(error);
    }
  };

  const isUnlocked = (badge) => {
    return userBadges.includes(badge.id);
  };

  const getProgress = (badge) => {
    const current = userStats[badge.type] || 0;
    return Math.min((current / badge.requirement) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Conquistas & Badges
          </h1>
          <p className="text-gray-400 mt-2">Desbloqueie badges criando e compartilhando</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => {
            const unlocked = isUnlocked(badge);
            const progress = getProgress(badge);

            return (
              <Card key={badge.id} className={`bg-[#121214] border-[#27272a] ${unlocked ? "border-purple-500" : ""}`}>
                <CardContent className="p-6 text-center">
                  <div className={`text-6xl mb-4 ${!unlocked && "grayscale opacity-50"}`}>
                    {badge.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{badge.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{badge.description}</p>
                  
                  {unlocked ? (
                    <div className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm font-bold">
                      <Award className="w-4 h-4 inline mr-2" />
                      DESBLOQUEADO
                    </div>
                  ) : (
                    <div>
                      <div className="bg-[#18181b] rounded-full h-2 mb-2 overflow-hidden">
                        <div className="bg-purple-500 h-full transition-all" style={{ width: `${progress}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {userStats[badge.type] || 0} / {badge.requirement}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}