import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Image, Zap, Sparkles, ArrowRight, Bot, Music, Folder, Heart, Trophy, Mic, Eye, Languages, Wand2, Video, Volume2, Globe, CheckCircle2, FileText, AlertCircle, Share2, User, Clock, ImageIcon } from "lucide-react";

export default function Home() {
  const mainFeatures = [
    {
      icon: MessageSquare,
      title: "Chat IA Completo",
      description: "Converse com IA avançada, faça perguntas e obtenha respostas inteligentes",
      link: "ImageChat",
      color: "bg-purple-500"
    },
    {
      icon: Image,
      title: "Criar Imagens",
      description: "Gere imagens incríveis com IA a partir de descrições",
      link: "ImageCreator",
      color: "bg-blue-500"
    },
    {
      icon: Sparkles,
      title: "Múltiplas Imagens",
      description: "Crie várias variações de imagens de uma só vez",
      link: "BatchImages",
      color: "bg-pink-500"
    },
    {
      icon: Bot,
      title: "Imagens com Letras",
      description: "Transforme letras de músicas em arte visual",
      link: "LyricsImage",
      color: "bg-green-500"
    },
    {
      icon: Music,
      title: "Gerar Letras",
      description: "Crie músicas originais com IA usando estilo e conceito",
      link: "LyricGenerator",
      color: "bg-pink-500"
    },
    {
      icon: Music,
      title: "Assistente de Compositor",
      description: "Crie e melhore composições com IA",
      link: "ComposerHelper",
      color: "bg-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6967e4600e0679ed371f5df6/f0c5d4c0e_ChatGPTImage16dejande202600_29_33.png" alt="VocalizeX" className="h-48 mx-auto mb-8" />

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                VocalizeX
              </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Uma plataforma completa de IA para criar imagens, conversar com assistente inteligente e transformar suas ideias em realidade
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to={createPageUrl("ImageChat")}>
              <Button size="lg" className="bg-purple-600 hover:bg-purple-500 text-lg px-8">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("ImageCreator")}>
              <Button size="lg" variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-lg px-8">
                Criar Imagens
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {mainFeatures.map((feature, index) => (
            <Link key={index} to={createPageUrl(feature.link)}>
              <Card className="bg-[#121214] border-[#27272a] hover:border-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#27272a] mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>Plataforma de IA • VocalizeX</p>
        </div>
      </footer>
    </div>
  );
}