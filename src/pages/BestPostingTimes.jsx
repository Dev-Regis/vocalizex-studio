import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";

export default function BestPostingTimes() {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today);
  }, []);

  const getNextDay = (offset) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + offset);
    return date;
  };

  const bestTimes = {
    instagram: [
      { time: "6:00 - 8:00", label: "Madrugada", engagement: "Criadores noturnos" },
      { time: "11:00 - 13:00", label: "Almoço", engagement: "Maior pico 📱" },
      { time: "17:00 - 19:00", label: "Tarde", engagement: "Volta do trabalho" },
      { time: "21:00 - 23:00", label: "Noite", engagement: "Tempo livre 🌙" }
    ],
    tiktok: [
      { time: "6:00 - 10:00", label: "Manhã", engagement: "Ritual matinal" },
      { time: "12:00 - 14:00", label: "Meio-dia", engagement: "Pausa do trabalho" },
      { time: "19:00 - 23:00", label: "Noite", engagement: "Maior pico 🔥" },
    ],
    youtube: [
      { time: "15:00 - 17:00", label: "Tarde", engagement: "Saída da escola/trabalho" },
      { time: "20:00 - 22:00", label: "Noite", engagement: "Tempo livre (maior)" },
      { time: "10:00 - 12:00", label: "Manhã", engagement: "Meio de semana" }
    ],
    linkedin: [
      { time: "7:00 - 9:00", label: "Manhã", engagement: "Início do expediente" },
      { time: "12:00 - 13:00", label: "Almoço", engagement: "Break profissional" },
      { time: "17:00 - 18:00", label: "Fim do dia", engagement: "Fim do expediente" }
    ],
    twitter: [
      { time: "8:00 - 10:00", label: "Manhã", engagement: "Trabalho/Aula" },
      { time: "12:00 - 14:00", label: "Almoço", engagement: "Pausa" },
      { time: "18:00 - 20:00", label: "Noite", engagement: "Pico de tweets 📈" }
    ]
  };

  const platforms = {
    instagram: "📸 Instagram",
    tiktok: "🎵 TikTok",
    youtube: "🎬 YouTube",
    linkedin: "💼 LinkedIn",
    twitter: "𝕏 Twitter"
  };

  const dayName = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-b from-yellow-500/20 to-transparent p-3 rounded-full mb-4 border border-yellow-500/30 inline-flex">
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Melhores Horários para Postar</h1>
          <p className="text-gray-400">Otimize sua estratégia de conteúdo</p>
        </div>

        {/* Days Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 justify-center">
          {[0, 1, 2].map((offset) => (
            <button
              key={offset}
              onClick={() => setCurrentDate(getNextDay(offset))}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                offset === 0
                  ? "bg-yellow-600 text-white"
                  : "bg-[#121214] border border-[#27272a] text-gray-400 hover:border-yellow-500/50"
              }`}
            >
              {offset === 0 ? "Hoje" : `${dayName(getNextDay(offset))}`}
            </button>
          ))}
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(platforms).map(([key, name]) => (
            <div key={key} className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-yellow-400">{name}</h3>
              <div className="space-y-3">
                {bestTimes[key].map((slot, idx) => (
                  <div key={idx} className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm">{slot.time}</span>
                      <span className="text-xs bg-yellow-600/30 text-yellow-300 px-2 py-1 rounded">
                        {slot.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{slot.engagement}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 mt-8">
          <h3 className="text-2xl font-bold mb-4">💡 Dicas Importantes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>✓ Poste 3-4 vezes por semana no mínimo</div>
            <div>✓ Consistência é mais importante que quantidade</div>
            <div>✓ Teste e ajuste conforme seu público</div>
            <div>✓ Use agendador para picos de horário</div>
            <div>✓ Observe seu analytics para horários reais</div>
            <div>✓ Adapte para seu fuso horário</div>
          </div>
        </div>
      </div>
    </div>
  );
}