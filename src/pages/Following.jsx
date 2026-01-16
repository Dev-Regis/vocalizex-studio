import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, UserPlus, UserMinus, Users } from "lucide-react";
import { toast } from "sonner";

export default function Following() {
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [myEmail, setMyEmail] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();
      setMyEmail(me.email);

      const allUsers = await base44.entities.User.list();
      const myFollowing = await base44.entities.Following.list();
      
      setUsers(allUsers.filter(u => u.email !== me.email));
      setFollowing(myFollowing.map(f => f.following_email));
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleFollow = async (userEmail) => {
    try {
      if (following.includes(userEmail)) {
        const follow = await base44.entities.Following.filter({ following_email: userEmail });
        if (follow[0]) {
          await base44.entities.Following.delete(follow[0].id);
          setFollowing(following.filter(e => e !== userEmail));
          toast.success("Deixou de seguir");
        }
      } else {
        await base44.entities.Following.create({ following_email: userEmail });
        setFollowing([...following, userEmail]);
        toast.success("Seguindo!");
      }
    } catch (error) {
      toast.error("Erro");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Seguir Usuários
          </h1>
          <p className="text-gray-400 mt-2">Acompanhe seus criadores favoritos</p>
        </div>

        <Card className="bg-[#121214] border-[#27272a] mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-400" />
              <div>
                <p className="font-bold">Seguindo {following.length} usuários</p>
                <p className="text-sm text-gray-400">Veja criações de quem você segue no feed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id} className="bg-[#121214] border-[#27272a]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <span className="text-lg font-bold">{user.email[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-bold">{user.full_name || user.email}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleToggleFollow(user.email)}
                    variant={following.includes(user.email) ? "outline" : "default"}
                    className={following.includes(user.email) ? "border-[#27272a]" : "bg-blue-600 hover:bg-blue-500"}
                  >
                    {following.includes(user.email) ? (
                      <><UserMinus className="w-4 h-4 mr-2" />Seguindo</>
                    ) : (
                      <><UserPlus className="w-4 h-4 mr-2" />Seguir</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}