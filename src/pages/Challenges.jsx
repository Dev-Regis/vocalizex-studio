import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trophy, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const data = await base44.entities.Challenge.filter({ is_active: true }, "-created_date");
      setChallenges(data);
    } catch (error) {
      toast.error("Erro ao carregar desafios");
    }
  };

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Desafios Criativos
          </h1>
          <p className="text-gray-400 mt-2">Participe dos desafios semanais e mostre sua criatividade</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {challenges.map((challenge) => {
            const daysRemaining = getDaysRemaining(challenge.end_date);
            return (
              <Card key={challenge.id} className="bg-[#121214] border-[#27272a] hover:border-yellow-500 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Trophy className="w-12 h-12 text-yellow-400" />
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      daysRemaining > 3 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {daysRemaining > 0 ? `${daysRemaining} dias restantes` : "Encerrado"}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{challenge.title}</h3>
                  <p className="text-gray-400 mb-4">{challenge.description}</p>

                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
                    <p className="text-xs text-purple-400 font-semibold mb-1">TEMA DO DESAFIO:</p>
                    <p className="text-white">{challenge.prompt_theme}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Início: {new Date(challenge.start_date).toLocaleDateString()}
                    </div>
                    <div>
                      Fim: {new Date(challenge.end_date).toLocaleDateString()}
                    </div>
                  </div>

                  <Button 
                    asChild
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500"
                    disabled={daysRemaining === 0}
                  >
                    <Link to={createPageUrl(`ImageCreator?prompt=${encodeURIComponent(challenge.prompt_theme)}`)}>
                      Participar do Desafio
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {challenges.length === 0 && (
          <Card className="bg-[#121214] border-[#27272a] p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Nenhum desafio ativo no momento</p>
          </Card>
        )}
      </div>
    </div>
  );
}