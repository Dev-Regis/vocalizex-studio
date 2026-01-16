import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock, Mail, X } from "lucide-react";
import { toast } from "sonner";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
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
      // Armazenar credenciais localmente (em produção seria via API)
      localStorage.setItem("user_auth", JSON.stringify({ email, password }));
      localStorage.setItem("user_email", email);
      toast.success("Login realizado!");
      setEmail("");
      setPassword("");
      onLoginSuccess();
      onClose();
    } catch (error) {
      toast.error("Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121214] border-[#27272a] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Login</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-300 mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-[#18181b] border-[#27272a] text-white"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-300 mb-2 block">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-[#18181b] border-[#27272a] text-white"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-500/30 text-gray-300 hover:bg-gray-500/10"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-500"
            >
              {isLoading ? "Conectando..." : "Entrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}