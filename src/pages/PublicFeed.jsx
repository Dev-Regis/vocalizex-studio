import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Heart, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

export default function PublicFeed() {
  const [creations, setCreations] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [userLikes, setUserLikes] = useState([]);

  useEffect(() => {
    loadFeed();
    loadUserLikes();
  }, []);

  const loadFeed = async () => {
    try {
      const data = await base44.entities.Creation.filter({ is_public: true }, "-created_date");
      setCreations(data);
      
      // Carregar comentários para cada criação
      for (const creation of data) {
        const creationComments = await base44.entities.Comment.filter({ creation_id: creation.id });
        setComments(prev => ({ ...prev, [creation.id]: creationComments }));
      }
    } catch (error) {
      toast.error("Erro ao carregar feed");
    }
  };

  const loadUserLikes = async () => {
    try {
      const likes = await base44.entities.Like.list();
      setUserLikes(likes.map(l => l.creation_id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async (creation) => {
    try {
      const isLiked = userLikes.includes(creation.id);
      
      if (isLiked) {
        const like = await base44.entities.Like.filter({ creation_id: creation.id });
        if (like[0]) {
          await base44.entities.Like.delete(like[0].id);
        }
        setUserLikes(userLikes.filter(id => id !== creation.id));
        
        await base44.entities.Creation.update(creation.id, {
          likes_count: Math.max(0, (creation.likes_count || 0) - 1)
        });
      } else {
        await base44.entities.Like.create({ creation_id: creation.id });
        setUserLikes([...userLikes, creation.id]);
        
        await base44.entities.Creation.update(creation.id, {
          likes_count: (creation.likes_count || 0) + 1
        });
      }
      
      loadFeed();
    } catch (error) {
      toast.error("Erro ao curtir");
    }
  };

  const handleComment = async (creationId) => {
    const text = newComment[creationId];
    if (!text?.trim()) return;

    try {
      await base44.entities.Comment.create({
        creation_id: creationId,
        text: text
      });
      setNewComment({ ...newComment, [creationId]: "" });
      
      const creationComments = await base44.entities.Comment.filter({ creation_id: creationId });
      setComments({ ...comments, [creationId]: creationComments });
      
      toast.success("Comentário enviado!");
    } catch (error) {
      toast.error("Erro ao comentar");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Feed Público
          </h1>
          <p className="text-gray-400 mt-2">Descubra criações da comunidade</p>
        </div>

        <div className="space-y-6">
          {creations.map((creation) => (
            <Card key={creation.id} className="bg-[#121214] border-[#27272a]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-sm font-bold">{creation.created_by?.[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{creation.created_by}</p>
                    <p className="text-xs text-gray-500">{new Date(creation.created_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <img src={creation.content_url} alt="Creation" className="w-full rounded-lg mb-4" />

                <p className="text-gray-300 mb-4">{creation.prompt}</p>

                <div className="flex items-center gap-4 mb-4">
                  <Button
                    onClick={() => handleLike(creation)}
                    variant="ghost"
                    size="sm"
                    className={userLikes.includes(creation.id) ? "text-red-500" : "text-gray-400"}
                  >
                    <Heart className={`w-5 h-5 mr-1 ${userLikes.includes(creation.id) ? "fill-current" : ""}`} />
                    {creation.likes_count || 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    <MessageCircle className="w-5 h-5 mr-1" />
                    {comments[creation.id]?.length || 0}
                  </Button>
                </div>

                <div className="space-y-3">
                  {comments[creation.id]?.map((comment) => (
                    <div key={comment.id} className="bg-[#18181b] rounded-lg p-3">
                      <p className="text-sm font-semibold text-purple-400 mb-1">{comment.created_by}</p>
                      <p className="text-sm text-gray-300">{comment.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <Input
                    value={newComment[creation.id] || ""}
                    onChange={(e) => setNewComment({ ...newComment, [creation.id]: e.target.value })}
                    placeholder="Adicionar comentário..."
                    className="bg-[#18181b] border-[#27272a] text-white"
                  />
                  <Button
                    onClick={() => handleComment(creation.id)}
                    disabled={!newComment[creation.id]?.trim()}
                    className="bg-purple-600 hover:bg-purple-500"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {creations.length === 0 && (
          <Card className="bg-[#121214] border-[#27272a] p-12 text-center">
            <p className="text-gray-400">Nenhuma criação pública ainda</p>
          </Card>
        )}
      </div>
    </div>
  );
}