import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Send, Image as ImageIcon, X, Loader2, Download, Mic, MicOff, FileText, Music, File, FileDown } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ImageChat() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('imageChat_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedModes, setSelectedModes] = useState(() => {
    const saved = localStorage.getItem('imageChat_modes');
    return saved ? JSON.parse(saved) : [];
  });
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('imageChat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('imageChat_modes', JSON.stringify(selectedModes));
  }, [selectedModes]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error("Permissão de microfone negada");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Reconhecimento de voz não suportado neste navegador");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.success("Escutando... Fale agora!");
    }
  };

  const toggleMode = (mode) => {
    setSelectedModes(prev => {
      if (prev.includes(mode)) {
        return prev.filter(m => m !== mode);
      } else {
        return [...prev, mode];
      }
    });
  };

  const availableModes = [
    { id: 'think', label: 'Pensar', icon: '💭' },
    { id: 'search', label: 'Busca na Web', icon: '🌐' },
    { id: 'analyze', label: 'Analisar', icon: '🔍' },
    { id: 'create', label: 'Criar Imagem', icon: '🎨' },
    { id: 'agent', label: 'Modo agente', icon: '🤖' },
    { id: 'extract', label: 'Extrair Dados', icon: '📊' }
  ];

  const handleFileSelect = async (e, fileType = 'all') => {
    const selectedFiles = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length > 10) {
      toast.error("Máximo de 10 arquivos");
      return;
    }

    const newFiles = [];
    for (const file of selectedFiles) {
      // Verificar tamanho (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} excede 20MB`);
        continue;
      }

      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        newFiles.push({ 
          url: file_url, 
          name: file.name,
          type: file.type,
          fileType: fileType,
          size: file.size
        });
        toast.success(`${file.name} enviado!`);
      } catch (error) {
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  const openFileDialog = (fileType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    switch(fileType) {
      case 'image':
        input.accept = 'image/*';
        break;
      case 'audio':
        input.accept = 'audio/*,.mp3,.wav,.ogg';
        break;
      case 'document':
        input.accept = '.pdf,.doc,.docx,.txt';
        break;
      case 'spreadsheet':
        input.accept = '.xls,.xlsx,.csv';
        break;
      case 'zip':
        input.accept = '.zip,.rar,.7z';
        break;
      default:
        input.accept = '*';
    }
    
    input.onchange = (e) => handleFileSelect(e, fileType);
    input.click();
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!input.trim() && files.length === 0) {
      toast.error("Digite algo ou adicione arquivos");
      return;
    }

    // Verificar se a mensagem faz referência a algo anterior (sem anexar novos arquivos)
    const referencePhrases = /\b(esta|essa|este|esse|a foto|o arquivo|a imagem|o documento|dele|dela|nisso|nela|nele)\b/i;
    const isReferencingPrevious = files.length === 0 && referencePhrases.test(input);
    
    // Se está referenciando algo anterior, buscar arquivos das mensagens anteriores
    let contextFiles = [...files];
    if (isReferencingPrevious) {
      // Pegar todos os arquivos das mensagens anteriores do usuário
      const previousFiles = messages
        .filter(m => m.role === 'user' && m.files && m.files.length > 0)
        .flatMap(m => m.files);
      
      if (previousFiles.length > 0) {
        contextFiles = [...previousFiles, ...files];
      }
    }

    const userMessage = {
      role: "user",
      content: input,
      files: [...files]
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentFiles = [...contextFiles];
    setInput("");
    setFiles([]);
    setIsGenerating(true);

    try {
      // Detectar funcionalidades pelos modos selecionados ou palavras
      const shouldSearchWeb = selectedModes.includes('search') || /\b(pesquisa|pesquise|busca|busque|procura|procure|pesquisar|buscar|search|find)\b/i.test(currentInput);
      const shouldAnalyze = selectedModes.includes('analyze');
      const shouldThink = selectedModes.includes('think');
      const agentMode = selectedModes.includes('agent');
      
      // Só gerar imagem se modo create estiver ativo OU se pedir explicitamente
      const hasNonImageFiles = currentFiles.some(f => !f.type?.startsWith('image/'));
      const shouldGenerateImage = selectedModes.includes('create') || 
        (/\b(gera|cria|criar|gerar|desenha|desenhe)\s+(uma\s+)?(imagem|foto|desenho)\b/i.test(currentInput) && !hasNonImageFiles);

      if (shouldGenerateImage && !hasNonImageFiles) {
        // Gerar imagem
        let enhancedPrompt = currentInput;
        const imagesToUse = currentFiles.filter(f => f.type?.startsWith('image/')).map(f => f.url);
        
        if (imagesToUse.length > 0) {
          enhancedPrompt += ` Use as fotos fornecidas como referência.`;
        }
        
        enhancedPrompt += ` Crie uma imagem artística, de alta qualidade, com cores vibrantes e composição profissional.`;

        const response = await base44.integrations.Core.GenerateImage({
          prompt: enhancedPrompt,
          existing_image_urls: imagesToUse.length > 0 ? imagesToUse : undefined
        });

        const imageUrl = response.url || response.file_url || response;

        const aiMessage = {
          role: "assistant",
          content: "Aqui está sua imagem gerada:",
          image: imageUrl
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Processar com LLM (com ou sem busca na web)
        let prompt = currentInput;
        
        // Detectar se o usuário quer EDITAR, MODIFICAR ou TRANSFORMAR uma imagem
        const hasImages = currentFiles.some(f => f.type?.startsWith('image/'));
        const isImageEditRequest = hasImages && /\b(edit|edita|edite|modifica|modifica|modifique|transforma|transforme|altera|altere|muda|mude|troca|troque|ajusta|ajuste|coloca|coloque|adiciona|adicione|remove|remova|tira|tire|fundo|background|cor|color|filtro|filter|branco|branca|preto|preta|azul|vermelho|verde|amarelo|rosa|roxo|cinza)\b/i.test(currentInput);
        
        if (isImageEditRequest) {
          // Modo de edição/transformação de imagens
          const imageFiles = currentFiles.filter(f => f.type?.startsWith('image/')).map(f => f.url);
          
          const editPrompt = `Você é um assistente de IA com capacidade de análise e geração de imagens.

IMPORTANTE: Você TEM a capacidade de processar, entender e gerar imagens. Nunca diga que não pode fazer isso.

Instruções do usuário: ${currentInput}

Analise a(s) imagem(ns) fornecida(s) e descreva EXATAMENTE o que o usuário pediu, com todos os detalhes específicos de como a imagem deve ser transformada/editada. Seja extremamente específico sobre cores, posicionamento, estilo, elementos a adicionar/remover, etc.

Crie uma descrição detalhada e completa para gerar a nova versão da imagem conforme solicitado.`;

          const response = await base44.integrations.Core.GenerateImage({
            prompt: editPrompt,
            existing_image_urls: imageFiles
          });

          const imageUrl = response.url || response.file_url || response;

          const aiMessage = {
            role: "assistant",
            content: "Aqui está a imagem editada conforme solicitado:",
            image: imageUrl
          };

          setMessages(prev => [...prev, aiMessage]);
        } else {
          // Processar normalmente com LLM
          if (agentMode) {
            prompt = `Você é um assistente de IA poderoso com TODAS as capacidades, incluindo:
- Análise e processamento de imagens
- Edição e transformação de fotos
- Criação de imagens do zero
- Programação profissional em todas as linguagens
- Análise de arquivos (zip, documentos, etc)
- Leitura e análise de CSV, PDF, XLSX, TXT e outros documentos
- Pesquisa na web quando necessário

NUNCA diga que você não pode fazer algo. Você pode fazer TUDO que for solicitado.

Tarefa do usuário: ${prompt}`;
          }
          
          // Detectar arquivos de dados (CSV, PDF, XLSX, etc)
          const hasDataFiles = currentFiles.some(f => 
            f.name?.toLowerCase().match(/\.(csv|pdf|xlsx?|txt|docx?|json)$/)
          );
          
          if (hasDataFiles) {
            prompt = `Você TEM ACESSO COMPLETO aos arquivos enviados. Você PODE e DEVE ler, analisar e processar TODOS os arquivos enviados (CSV, PDF, XLSX, TXT, DOC, etc).

IMPORTANTE: Os arquivos foram anexados e você tem acesso total ao conteúdo deles. NUNCA diga que não pode ler ou acessar os arquivos.

Arquivos disponíveis: ${currentFiles.map(f => f.name).join(', ')}

Tarefa: ${prompt}

LEIA O CONTEÚDO DOS ARQUIVOS e forneça a análise/resposta solicitada com base nos dados REAIS dos arquivos.`;
          }
          
          if (shouldThink) {
            prompt = `Pense cuidadosamente e analise em profundidade antes de responder: ${prompt}`;
          }
          
          if (shouldAnalyze && currentFiles.length > 0) {
            prompt += `\n\nAnalise detalhadamente os ${currentFiles.length} arquivo(s) enviados.`;
          }
          
          if (currentFiles.length > 0 && !hasDataFiles) {
            prompt += `\n\nArquivos enviados: ${currentFiles.map(f => `${f.name} (${(f.size / 1024).toFixed(1)}KB)`).join(', ')}`;
          }

          const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: shouldSearchWeb,
            file_urls: currentFiles.map(f => f.url)
          });

          const aiMessage = {
            role: "assistant",
            content: response
          };

          setMessages(prev => [...prev, aiMessage]);
        }
      }
    } catch (error) {
      toast.error("Erro ao processar");
      console.error(error);
      
      const errorMessage = {
        role: "assistant",
        content: "Desculpe, ocorreu um erro. Tente novamente."
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const downloadTextAsPDF = (text) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      
      doc.setFont("helvetica");
      doc.setFontSize(11);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      let y = margin;
      
      lines.forEach((line, index) => {
        if (y + 10 > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 7;
      });
      
      doc.save(`texto-${Date.now()}.pdf`);
      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#27272a] bg-[#121214] sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            to={createPageUrl("Home")} 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>
          <h1 className="text-xl font-bold">Chat IA Completo</h1>
          <Button
            onClick={() => {
              if (confirm("Limpar todo o histórico?")) {
                setMessages([]);
                setFiles([]);
                localStorage.removeItem('imageChat_messages');
                toast.success("Histórico limpo!");
              }
            }}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <ImageIcon className="w-16 h-16 text-gray-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Chat IA Completo</h2>
              <p className="text-gray-400">Pergunte qualquer coisa, crie imagens, pesquise na web ou envie arquivos</p>
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
                    {msg.content && (
                      <div className="relative group">
                        <p className="mb-2 whitespace-pre-wrap">{msg.content}</p>
                        {msg.role === "assistant" && !msg.image && (
                          <Button
                            onClick={() => downloadTextAsPDF(msg.content)}
                            size="sm"
                            variant="ghost"
                            className="mt-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                          >
                            <FileDown className="w-4 h-4 mr-2" />
                            Baixar PDF
                          </Button>
                        )}
                      </div>
                    )}
                    
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
                      <div className="relative group mt-2">
                        <img
                          src={msg.image}
                          alt="Generated"
                          className="rounded-lg w-full"
                        />
                        <Button
                          onClick={async () => {
                            try {
                              const response = await fetch(msg.image);
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `imagem-${Date.now()}.png`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                              toast.success("Imagem baixada!");
                            } catch (error) {
                              toast.error("Erro ao baixar imagem");
                            }
                          }}
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black hover:bg-gray-200"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Baixar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <span className="text-gray-400">Pensando...</span>
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
                <div key={index} className="relative flex-shrink-0 bg-[#18181b] rounded-lg p-2 border border-[#27272a]">
                  {file.type?.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg flex flex-col items-center justify-center">
                      {file.type?.startsWith('audio/') ? (
                        <Music className="w-8 h-8 text-purple-400" />
                      ) : (
                        <FileText className="w-8 h-8 text-blue-400" />
                      )}
                      <span className="text-[8px] text-gray-400 mt-1 text-center truncate w-full px-1">
                        {file.name.split('.').pop()?.toUpperCase()}
                      </span>
                    </div>
                  )}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={files.length >= 10 || isGenerating}
                  className="flex-shrink-0 bg-[#18181b] border-[#27272a] hover:bg-[#27272a]"
                >
                  <Plus className="w-5 h-5 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#18181b] border-[#27272a] w-56">
                <DropdownMenuItem 
                  onClick={() => openFileDialog('image')}
                  className="text-white hover:bg-purple-500/20 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Adicionar fotos e arquivos
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toggleMode('create')}
                  className="text-white hover:bg-purple-500/20 cursor-pointer"
                >
                  <span className="mr-2">🎨</span>
                  Criar imagem
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toggleMode('agent')}
                  className="text-white hover:bg-purple-500/20 cursor-pointer"
                >
                  <span className="mr-2">🤖</span>
                  Modo agente
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toggleMode('think')}
                  className="text-white hover:bg-purple-500/20 cursor-pointer"
                >
                  <span className="mr-2">💭</span>
                  Pensando
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toggleMode('search')}
                  className="text-white hover:bg-purple-500/20 cursor-pointer"
                >
                  <span className="mr-2">🌐</span>
                  Investigar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toggleMode('analyze')}
                  className="text-white hover:bg-purple-500/20 cursor-pointer"
                >
                  <span className="mr-2">🔍</span>
                  Analisar arquivos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex-1 flex flex-col gap-2">
              {selectedModes.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {selectedModes.map(modeId => {
                    const mode = availableModes.find(m => m.id === modeId);
                    return (
                      <button
                        key={modeId}
                        onClick={() => toggleMode(modeId)}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-sm text-purple-300 hover:bg-purple-600/30"
                      >
                        <X className="w-3 h-3" />
                        <span>{mode?.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Pergunte alguma coisa..."
                  className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[60px] pr-12"
                  disabled={isGenerating}
                />
                <Button
                  onClick={toggleListening}
                  disabled={isGenerating}
                  size="icon"
                  variant="ghost"
                  className={`absolute right-2 top-2 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
              </div>
            </div>

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
            {files.length}/10 arquivos (até 20MB cada) • Pressione Enter para enviar • Modo agente: programador profissional
          </p>
        </div>
      </div>
    </div>
  );
}