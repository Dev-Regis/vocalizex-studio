import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Moon, Sun, Globe, Keyboard } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("pt-BR");
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    const savedLang = localStorage.getItem("language") || "pt-BR";
    const savedShortcuts = localStorage.getItem("keyboardShortcuts") !== "false";

    setTheme(savedTheme);
    setLanguage(savedLang);
    setKeyboardShortcuts(savedShortcuts);

    document.documentElement.className = savedTheme;
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.className = newTheme;
    toast.success(`Tema ${newTheme === "dark" ? "escuro" : "claro"} ativado`);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
    toast.success("Idioma alterado");
  };

  const handleShortcutsToggle = (enabled) => {
    setKeyboardShortcuts(enabled);
    localStorage.setItem("keyboardShortcuts", enabled);
    toast.success(`Atalhos ${enabled ? "ativados" : "desativados"}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Configurações
          </h1>
          <p className="text-gray-400 mt-2">Personalize sua experiência</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {theme === "dark" ? <Moon className="w-6 h-6 text-blue-400" /> : <Sun className="w-6 h-6 text-yellow-400" />}
                  <div>
                    <Label className="text-lg font-bold">Tema</Label>
                    <p className="text-sm text-gray-400">Escolha entre claro ou escuro</p>
                  </div>
                </div>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-40 bg-[#18181b] border-[#27272a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121214] border-[#27272a]">
                    <SelectItem value="dark" className="text-white">🌙 Escuro</SelectItem>
                    <SelectItem value="light" className="text-white">☀️ Claro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Globe className="w-6 h-6 text-green-400" />
                  <div>
                    <Label className="text-lg font-bold">Idioma</Label>
                    <p className="text-sm text-gray-400">Idioma da interface</p>
                  </div>
                </div>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-40 bg-[#18181b] border-[#27272a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121214] border-[#27272a]">
                    <SelectItem value="pt-BR" className="text-white">🇧🇷 Português</SelectItem>
                    <SelectItem value="en-US" className="text-white">🇺🇸 English</SelectItem>
                    <SelectItem value="es-ES" className="text-white">🇪🇸 Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Keyboard className="w-6 h-6 text-purple-400" />
                  <div>
                    <Label className="text-lg font-bold">Atalhos de Teclado</Label>
                    <p className="text-sm text-gray-400">Navegação rápida com teclado</p>
                  </div>
                </div>
                <Switch checked={keyboardShortcuts} onCheckedChange={handleShortcutsToggle} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121214] border-[#27272a]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">⌨️ Atalhos Disponíveis</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Voltar</span>
                  <kbd className="px-2 py-1 bg-[#18181b] rounded">Esc</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Buscar</span>
                  <kbd className="px-2 py-1 bg-[#18181b] rounded">Ctrl + K</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Nova criação</span>
                  <kbd className="px-2 py-1 bg-[#18181b] rounded">Ctrl + N</kbd>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}