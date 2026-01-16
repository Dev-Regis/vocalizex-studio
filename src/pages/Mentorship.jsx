import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, GraduationCap, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function Mentorship() {
  const [mentorships, setMentorships] = useState([]);
  const [myEmail, setMyEmail] = useState("");

  useEffect(() => {
    loadMentorships();
  }, []);

  const loadMentorships = async () => {
    try {
      const me = await base44.auth.me();
      setMyEmail(me.email);

      const data = await base44.entities.Mentorship.list();
      setMentorships(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAccept = async (mentorship) => {
    try {
      await base44.entities.Mentorship.update(mentorship.id, { status: "active" });
      toast.success("Mentoria aceita!");
      loadMentorships();
    } catch (error) {
      toast.error("Erro");
    }
  };

  const handleReject = async (mentorship) => {
    try {
      await base44.entities.Mentorship.delete(mentorship.id);
      toast.success("Recusada");
      loadMentorships();
    } catch (error) {
      toast.error("Erro");
    }
  };

  const myMentorships = mentorships.filter(m => 
    m.mentor_email === myEmail || m.mentee_email === myEmail
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Sistema de Mentoria
          </h1>
          <p className="text-gray-400 mt-2">Aprenda com experientes ou ajude iniciantes</p>
        </div>

        <div className="space-y-4">
          {myMentorships.map((mentorship) => (
            <Card key={mentorship.id} className="bg-[#121214] border-[#27272a]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <GraduationCap className="w-8 h-8 text-indigo-400 mt-1" />
                    <div>
                      <p className="font-bold mb-1">
                        {mentorship.mentor_email === myEmail ? "Você é mentor de" : "Seu mentor é"}: 
                        <span className="text-indigo-400 ml-2">
                          {mentorship.mentor_email === myEmail ? mentorship.mentee_email : mentorship.mentor_email}
                        </span>
                      </p>
                      <p className="text-sm text-gray-400 mb-2">Status: {mentorship.status === "active" ? "✅ Ativa" : "⏳ Pendente"}</p>
                      {mentorship.notes && (
                        <p className="text-sm text-gray-300 bg-[#18181b] rounded p-3 mt-2">{mentorship.notes}</p>
                      )}
                    </div>
                  </div>

                  {mentorship.status === "pending" && mentorship.mentor_email === myEmail && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleAccept(mentorship)} size="sm" className="bg-green-600 hover:bg-green-500">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleReject(mentorship)} size="sm" variant="outline" className="border-red-500 text-red-400">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {myMentorships.length === 0 && (
            <Card className="bg-[#121214] border-[#27272a] p-12 text-center">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Nenhuma mentoria ativa</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}