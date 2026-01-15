import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Library, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12 pt-12">
                    <h1 className="text-6xl font-bold text-purple-900 mb-4 flex items-center justify-center gap-4">
                        <Music className="w-16 h-16" />
                        LyricGenerator
                    </h1>
                    <p className="text-xl text-gray-600">
                        Crie letras de músicas incríveis com inteligência artificial
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Card className="hover:shadow-xl transition-shadow border-2 border-purple-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-2xl">
                                <Sparkles className="w-8 h-8 text-purple-600" />
                                Gerar Letras
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-6">
                                Crie letras personalizadas escolhendo o estilo musical e o conceito da música. Nossa IA gerará uma letra completa e original.
                            </p>
                            <Link to={createPageUrl("GerarLetras")}>
                                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6">
                                    Começar a Criar
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-xl transition-shadow border-2 border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-2xl">
                                <Library className="w-8 h-8 text-blue-600" />
                                Minhas Letras
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-6">
                                Acesse todas as letras que você já criou. Visualize, edite ou exclua suas composições salvas.
                            </p>
                            <Link to={createPageUrl("Dashboard")}>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                                    Ver Biblioteca
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-16 text-center">
                    <div className="inline-block bg-white rounded-lg shadow-md p-8 max-w-2xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Como funciona?
                        </h2>
                        <div className="space-y-4 text-left">
                            <div className="flex items-start gap-3">
                                <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-purple-600 font-bold">
                                    1
                                </div>
                                <p className="text-gray-600">
                                    Escolha o estilo musical (Rock, Pop, Sertanejo, etc.)
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-purple-600 font-bold">
                                    2
                                </div>
                                <p className="text-gray-600">
                                    Descreva o conceito ou tema da música
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-purple-600 font-bold">
                                    3
                                </div>
                                <p className="text-gray-600">
                                    Nossa IA gera uma letra completa e original
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-purple-600 font-bold">
                                    4
                                </div>
                                <p className="text-gray-600">
                                    Salve e acesse suas letras a qualquer momento
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}