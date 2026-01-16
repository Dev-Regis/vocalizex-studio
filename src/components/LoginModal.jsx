import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function LoginModal({ isOpen, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Preencha email e senha");
      return;
    }

    setIsLoading(true);
    try {
      // Redireciona para a tela de login do Base44
      await base44.auth.redirectToLogin();
    } catch (error) {
      toast.error("Erro ao fazer login");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-purple-500/20 p-3 rounded-full mb-4 border border-purple-500/30 inline-flex">
            <LogIn className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Fazer Login</h2>
          <p className="text-gray-400">Entre com suas credenciais</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-[#18181b] border-[#27272a] text-white"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 bg-[#18181b] border-[#27272a] text-white"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Não tem conta? Peça ao administrador para criar uma
        </p>
      </div>
    </div>
  );
}