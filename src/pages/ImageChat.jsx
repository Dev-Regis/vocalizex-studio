import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Send, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ImageChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length > 5) {
      toast.error("Máximo de 5 fotos permitidas");
      return;
    }

    const newFiles = [];
    for (const file of selectedFiles) {
      if (!file.type.startsWith("image/")) {
        toast.error("Apenas imagens são permitidas");
        continue;
      }

      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        newFiles.push({ url: file_url, name: file.name });
      } catch (error) {
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!input.trim() && files.length === 0) {
      toast.error("Digite algo ou adicione imagens");
      return;
    }

    const userMessage = {
      role: "user",
      content: input,
      files: [...files]
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setFiles([]);
    setIsGenerating(true);

    try {
      const prompt = `O usuário quer criar uma imagem com as seguintes especificações: ${input}. 
      ${files.length > 0 ? `O usuário enviou ${files.length} foto(s) como referência.` : ""}
      Descreva em detalhes como a imagem deve ser gerada (seja extremamente detalhado com cores, estilo, composição, iluminação).`;

      const { file_url } = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: files.map(f => f.url)
      });

      const aiMessage = {
        role: "assistant",
        content: "Imagem gerada com sucesso!",
        image: file_url
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error("Erro ao gerar imagem");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#27272a] bg-[#121214] sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            to={createPageUrl("ImageCreator")} 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>
          <h1 className="text-xl font-bold">Chat de Imagens IA</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <ImageIcon className="w-16 h-16 text-gray-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Comece a criar</h2>
              <p className="text-gray-400">Envie até 5 fotos e descreva o que deseja criar</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-[#121214] border border-[#27272a]"
                    }`}
                  >
                    {msg.content && <p className="mb-2">{msg.content}</p>}
                    
                    {msg.files && msg.files.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {msg.files.map((file, i) => (
                          <img
                            key={i}
                            src={file.url}
                            alt={file.name}
                            className="rounded-lg w-full h-32 object-cover"
                          />
                        ))}
                      </div>
                    )}

                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Generated"
                        className="rounded-lg w-full mt-2"
                      />
                    )}
                  </div>
                </div>
              ))}
              
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <span className="text-gray-400">Gerando imagem...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-[#27272a] bg-[#121214] sticky bottom-0">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          {/* File Preview */}
          {files.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {files.map((file, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="icon"
              disabled={files.length >= 5 || isGenerating}
              className="flex-shrink-0"
            >
              <Plus className="w-5 h-5" />
            </Button>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Descreva a imagem que deseja criar..."
              className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[60px]"
              disabled={isGenerating}
            />

            <Button
              onClick={handleSubmit}
              disabled={(!input.trim() && files.length === 0) || isGenerating}
              size="icon"
              className="flex-shrink-0 bg-purple-600 hover:bg-purple-500"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center">
            {files.length}/5 fotos • Pressione Enter para enviar
          </p>
        </div>
      </div>
    </div>
  );
}