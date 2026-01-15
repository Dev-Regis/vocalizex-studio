import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { Music, Loader2, Save, Layout } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function GerarLetras() {
    const [style, setStyle] = useState("");
    const [concept, setConcept] = useState("");
    const [lyrics, setLyrics] = useState("");
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [saving, setSaving] = useState(false);

    const generateLyrics = async () => {
        if (!style || !concept) {
            alert("Por favor, preencha o estilo e o conceito!");
            return;
        }

        setLoading(true);
        try {
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Crie uma letra de música completa no estilo ${style} sobre o conceito: ${concept}. 
                
A letra deve:
- Ter título criativo
- Incluir versos e refrão
- Ser em português
- Ser criativa e original

Formato:
[Título]
Título aqui

[Letra]
Letra completa aqui com versos e refrão`,
            });

            setLyrics(result);
            
            // Extrair título da resposta
            const titleMatch = result.match(/\[Título\]\s*\n(.+)/);
            if (titleMatch) {
                setTitle(titleMatch[1].trim());
            }
        } catch (error) {
            alert("Erro ao gerar letra: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const saveLyrics = async () => {
        if (!lyrics) {
            alert("Nenhuma letra para salvar!");
            return;
        }

        setSaving(true);
        try {
            await base44.entities.Song.create({
                title: title || "Sem título",
                style,
                concept,
                lyrics
            });
            alert("Letra salva com sucesso!");
        } catch (error) {
            alert("Erro ao salvar letra: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-purple-900 flex items-center gap-3">
                        <Music className="w-10 h-10" />
                        Gerador de Letras
                    </h1>
                    <Link to={createPageUrl("Dashboard")}>
                        <Button variant="outline" className="gap-2">
                            <Layout className="w-4 h-4" />
                            Dashboard
                        </Button>
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuração</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Estilo Musical
                                </label>
                                <Input
                                    placeholder="Ex: Rock, Pop, Sertanejo..."
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Conceito/Tema
                                </label>
                                <Textarea
                                    placeholder="Descreva sobre o que será a música..."
                                    value={concept}
                                    onChange={(e) => setConcept(e.target.value)}
                                    className="h-32"
                                />
                            </div>

                            <Button
                                onClick={generateLyrics}
                                disabled={loading}
                                className="w-full bg-purple-600 hover:bg-purple-700"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Gerando...
                                    </>
                                ) : (
                                    <>
                                        <Music className="w-4 h-4 mr-2" />
                                        Gerar Letra
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Resultado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lyrics ? (
                                <div className="space-y-4">
                                    <Textarea
                                        value={lyrics}
                                        onChange={(e) => setLyrics(e.target.value)}
                                        className="h-96 font-mono"
                                    />
                                    <Button
                                        onClick={saveLyrics}
                                        disabled={saving}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Salvar Letra
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="h-96 flex items-center justify-center text-gray-400">
                                    <p>A letra gerada aparecerá aqui</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}