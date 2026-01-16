import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Mail, Plus, LogOut, Users, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

const ADMIN_EMAIL = "teste12345678@teste.com";
const ADMIN_PASSWORD = "124567887654210";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const adminAuth = localStorage.getItem("admin_auth");
    if (adminAuth) {
      setIsLoggedIn(true);
      loadUsers();
    }
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    if (adminEmail !== ADMIN_EMAIL || adminPassword !== ADMIN_PASSWORD) {
      toast.error("Credenciais inválidas");
      return;
    }

    localStorage.setItem("admin_auth", "true");
    setIsLoggedIn(true);
    toast.success("Admin logado!");
    loadUsers();
  };

  const loadUsers = async () => {
    try {
      const data = await base44.entities.User.list();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!newUserEmail || !newUserName) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      setIsLoading(true);
      
      // Usar a função de convite de usuário
      await base44.users.inviteUser(newUserEmail, "user");
      
      toast.success("Usuário registrado!");
      setNewUserEmail("");
      setNewUserName("");
      loadUsers();
    } catch (error) {
      toast.error("Erro ao registrar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Tem certeza? Esta ação não pode ser desfeita.")) return;

    try {
      await base44.entities.User.delete(userId);
      toast.success("Usuário deletado!");
      loadUsers();
    } catch (error) {
      toast.error("Erro ao deletar usuário");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setIsLoggedIn(false);
    navigate(createPageUrl("Home"));
    toast.success("Admin deslogado");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="bg-red-500/20 p-3 rounded-full mb-4 border border-red-500/30 inline-flex">
                  <Shield className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="text-3xl font-black mb-2">Painel Admin</h1>
                <p className="text-gray-400">Acesso restrito</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Email Admin</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <Input
                      type="email"
                      placeholder={ADMIN_EMAIL}
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="pl-10 bg-[#18181b] border-[#27272a] text-white"
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
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="pl-10 bg-[#18181b] border-[#27272a] text-white"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-700 py-6 text-lg">
                  Entrar como Admin
                </Button>
              </form>

              <div className="mt-6 p-4 bg-[#18181b] rounded-lg border border-[#27272a] text-sm text-gray-400">
                <p className="font-semibold text-gray-300 mb-2">Credenciais Demo:</p>
                <p>📧 {ADMIN_EMAIL}</p>
                <p>🔐 {ADMIN_PASSWORD}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Painel Administrativo
          </h1>
          <Button onClick={handleLogout} variant="outline" className="border-red-500 text-red-400">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#121214] border-[#27272a] lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Registrar Novo Usuário
              </h2>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="bg-[#18181b] border-[#27272a] text-white"
                  disabled={isLoading}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="bg-[#18181b] border-[#27272a] text-white"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-green-600 to-green-700">
                  {isLoading ? "Registrando..." : "Registrar Usuário"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Total de Usuários
              </h3>
              <p className="text-5xl font-black text-green-400">{users.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#121214] border-[#27272a]">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Usuários Registrados</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#27272a]">
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Cargo</th>
                    <th className="text-left py-3 px-4">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-[#27272a] hover:bg-[#18181b] transition-colors">
                      <td className="py-3 px-4">{user.full_name || "-"}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === "admin" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                          {user.role === "admin" ? "Admin" : "Usuário"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button 
                          onClick={() => handleDeleteUser(user.id)} 
                          variant="ghost" 
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}