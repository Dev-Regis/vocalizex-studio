import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Dashboard() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSongs();
    }, []);

    const loadSongs = async () => {
        try {
            const data = await base44.entities.Song.list("-created_date");
            setSongs(data);
        } catch (error) {
            console.error("Erro ao carregar músicas:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteSong = async (id) => {
        if (!confirm("Deseja realmente excluir esta música?")) return;

        try {
            await base44.entities.Song.delete(id);
            setSongs(songs.filter(s => s.id !== id));
        } catch (error) {
            alert("Erro ao excluir música: " + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-purple-900 flex items-center gap-3">
                        <Music className="w-10 h-10" />
                        Minhas Letras
                    </h1>
                    <Link to={createPageUrl("GerarLetras")}>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <p className="text-center text-gray-500">Carregando...</p>
                ) : songs.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-gray-500">
                            <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Nenhuma letra salva ainda.</p>
                            <Link to={createPageUrl("GerarLetras")}>
                                <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                                    Criar primeira letra
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {songs.map((song) => (
                            <Card key={song.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="truncate">{song.title}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteSong(song.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <p className="text-purple-600 font-medium">
                                            {song.style}
                                        </p>
                                        <p className="text-gray-600 line-clamp-2">
                                            {song.concept}
                                        </p>
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                                            <pre className="text-xs whitespace-pre-wrap">
                                                {song.lyrics}
                                            </pre>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}