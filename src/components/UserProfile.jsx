import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Settings, LogOut, X } from "lucide-react";
import { toast } from "sonner";

export default function UserProfile({ user, onClose }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    if (!fullName || !email) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Senhas não conferem");
      return;
    }

    setIsLoading(true);
    try {
      await base44.auth.updateMe({
        full_name: fullName,
        email: email,
      });
      
      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    onClose();
    setTimeout(() => {
      base44.auth.logout("/");
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-full">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.full_name}</h2>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div className="bg-[#18181b] rounded-lg p-4 border border-[#27272a]">
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="text-white font-medium">{user?.email}</p>
            </div>
            
            <div className="bg-[#18181b] rounded-lg p-4 border border-[#27272a]">
              <p className="text-xs text-gray-400 mb-1">Nome</p>
              <p className="text-white font-medium">{user?.full_name}</p>
            </div>

            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 mb-2"
            >
              <Settings className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSaveChanges} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-[#18181b] border-[#27272a] text-white"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-[#18181b] border-[#27272a] text-white"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Nova Senha (opcional)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <Input
                  type="password"
                  placeholder="Deixe em branco para não alterar"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 bg-[#18181b] border-[#27272a] text-white"
                  disabled={isLoading}
                />
              </div>
            </div>

            {newPassword && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <Input
                    type="password"
                    placeholder="Confirme a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-[#18181b] border-[#27272a] text-white"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
              >
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                variant="outline"
                className="flex-1 border-[#27272a]"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}