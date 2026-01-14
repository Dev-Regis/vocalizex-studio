import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Image, Zap, Sparkles, ArrowRight, Bot, Music } from "lucide-react";

export default function Home() {
  const features = [
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
      icon: Zap,
      title: "Extrair Letras MP3",
      description: "Extraia letras de músicas de arquivos MP3",
      link: "Mp3Extractor",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Plataforma de IA Completa</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Crie, Converse e Imagine
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
          {features.map((feature, index) => (
            <Link key={index} to={createPageUrl(feature.link)}>
              <Button
                variant="outline"
                className="w-full h-auto flex flex-col items-start p-6 bg-[#121214] border-[#27272a] hover:border-purple-500/50 hover:bg-[#1a1a1c] transition-all duration-300 hover:scale-105"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2 text-left">{feature.title}</h3>
                <p className="text-gray-400 text-sm text-left">
                  {feature.description}
                </p>
                <ArrowRight className="w-5 h-5 text-purple-400 mt-3 ml-auto" />
              </Button>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
          <div className="p-6 bg-[#121214] border border-[#27272a] rounded-xl">
            <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-3xl font-bold mb-2">Rápido</h3>
            <p className="text-gray-400">Respostas instantâneas</p>
          </div>
          <div className="p-6 bg-[#121214] border border-[#27272a] rounded-xl">
            <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-3xl font-bold mb-2">Inteligente</h3>
            <p className="text-gray-400">IA de última geração</p>
          </div>
          <div className="p-6 bg-[#121214] border border-[#27272a] rounded-xl">
            <Bot className="w-8 h-8 text-pink-400 mx-auto mb-3" />
            <h3 className="text-3xl font-bold mb-2">Completo</h3>
            <p className="text-gray-400">Múltiplas funcionalidades</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#27272a] mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>Plataforma de IA • Criado com Base44</p>
        </div>
      </footer>
    </div>
  );
}