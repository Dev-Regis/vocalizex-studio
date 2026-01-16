import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Send, Image as ImageIcon, X, Loader2, Download, Mic, MicOff, FileText, Music, File, FileDown, Settings, Menu, MessageSquare, Pencil, Trash2, Check, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function ImageChat() {
  const queryClient = useQueryClient();
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState(""); // "gerando", "salvando", etc
  const [isListening, setIsListening] = useState(false);
  const [selectedModes, setSelectedModes] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(null);
  const [messageReplies, setMessageReplies] = useState({});
  const [replyText, setReplyText] = useState("");
  const [autoRead, setAutoRead] = useState(() => {
    const saved = localStorage.getItem('imageChat_autoRead');
    return saved ? JSON.parse(saved) : false;
  });
  const [selectedVoice, setSelectedVoice] = useState(() => {
    const saved = localStorage.getItem('imageChat_voice');
    return saved || 'pt-BR';
  });
  const [voiceRate, setVoiceRate] = useState(() => {
    const saved = localStorage.getItem('imageChat_voiceRate');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [availableVoices, setAvailableVoices] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list('-updated_date'),
  });

  const createConversationMutation = useMutation({
    mutationFn: (data) => base44.entities.Conversation.create(data),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries(['conversations']);
      setCurrentConversationId(newConv.id);
      setMessages([]);
      setFiles([]);
      toast.success("Nova conversa criada!");
    },
  });

  const updateConversationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Conversation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: (id) => base44.entities.Conversation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
      if (currentConversationId === deleteConversationMutation.variables) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      toast.success("Conversa excluída!");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      updateConversationMutation.mutate({
        id: currentConversationId,
        data: {
          messages: JSON.stringify(messages),
          last_message_date: new Date().toISOString()
        }
      });
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('imageChat_autoRead', JSON.stringify(autoRead));
  }, [autoRead]);

  useEffect(() => {
    localStorage.setItem('imageChat_voice', selectedVoice);
  }, [selectedVoice]);

  useEffect(() => {
    localStorage.setItem('imageChat_voiceRate', voiceRate.toString());
  }, [voiceRate]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

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

  const voiceOptions = [
    { lang: 'pt-BR', label: 'Fernando BR (Português)', keywords: ['luciana', 'francisca', 'fernanda', 'vitoria', 'female', 'fêmea', 'feminino'] },
    { lang: 'en-US', label: 'Samantha (Inglês US)', keywords: ['samantha', 'victoria', 'karen', 'female'] },
    { lang: 'en-GB', label: 'Kate (Inglês UK)', keywords: ['kate', 'serena', 'female'] },
    { lang: 'es-ES', label: 'Monica (Espanhol)', keywords: ['monica', 'female', 'spanish'] },
    { lang: 'fr-FR', label: 'Amelie (Francês)', keywords: ['amelie', 'female', 'french'] },
    { lang: 'de-DE', label: 'Anna (Alemão)', keywords: ['anna', 'female', 'german'] },
    { lang: 'it-IT', label: 'Alice (Italiano)', keywords: ['alice', 'female', 'italian'] },
    { lang: 'ja-JP', label: 'Kyoko (Japonês)', keywords: ['kyoko', 'female', 'japanese'] },
    { lang: 'zh-CN', label: 'Ting-Ting (Chinês)', keywords: ['ting-ting', 'female', 'chinese'] },
  ];

  const speakText = (text) => {
    if (!autoRead || !text) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedVoice;
    utterance.rate = voiceRate;
    utterance.pitch = 1.2;
    utterance.volume = 1.0;
    
    // Buscar voz feminina específica
    const voiceOption = voiceOptions.find(v => v.lang === selectedVoice);
    if (voiceOption && availableVoices.length > 0) {
      const femaleVoices = availableVoices.filter(v => {
        const nameLower = v.name.toLowerCase();
        const langMatch = v.lang.startsWith(selectedVoice);
        const hasKeyword = voiceOption.keywords.some(kw => nameLower.includes(kw));
        const notMale = !nameLower.includes('male') || nameLower.includes('female');
        return langMatch && (hasKeyword || notMale);
      });
      
      if (femaleVoices.length > 0) {
        utterance.voice = femaleVoices[0];
      }
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const loadConversation = (conv) => {
    setCurrentConversationId(conv.id);
    setMessages(conv.messages ? JSON.parse(conv.messages) : []);
    setFiles([]);
    setShowSidebar(false);
  };

  const createNewChat = () => {
    createConversationMutation.mutate({
      title: "Nova Conversa",
      messages: JSON.stringify([]),
      last_message_date: new Date().toISOString()
    });
    setShowSidebar(false);
  };

  const startEditTitle = (conv) => {
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const saveTitle = () => {
    if (editingId && editingTitle.trim()) {
      updateConversationMutation.mutate({
        id: editingId,
        data: { title: editingTitle.trim() }
      });
      setEditingId(null);
      setEditingTitle("");
    }
  };

  const deleteConversation = (id) => {
    if (confirm("Deseja excluir esta conversa?")) {
      deleteConversationMutation.mutate(id);
    }
  };

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
    setGeneratingStatus("processando...");

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
        setGeneratingStatus("gerando imagem...");
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
        setGeneratingStatus("salvando...");
      } else {
        // Processar com LLM (com ou sem busca na web)
        let prompt = currentInput;
        
        // Detectar se o usuário quer EDITAR, MODIFICAR ou TRANSFORMAR uma imagem
        const hasImages = currentFiles.some(f => f.type?.startsWith('image/'));
        const isImageEditRequest = hasImages && /\b(edit|edita|edite|modifica|modifica|modifique|transforma|transforme|altera|altere|muda|mude|troca|troque|ajusta|ajuste|coloca|coloque|adiciona|adicione|remove|remova|tira|tire|fundo|background|cor|color|filtro|filter|branco|branca|preto|preta|azul|vermelho|verde|amarelo|rosa|roxo|cinza)\b/i.test(currentInput);
        
        if (isImageEditRequest) {
          // Modo de edição/transformação de imagens
          setGeneratingStatus("editando imagem...");
          const imageFiles = currentFiles.filter(f => f.type?.startsWith('image/')).map(f => f.url);
          
          // Criar prompt otimizado para edição
          const editPrompt = `TAREFA: ${currentInput}

IMPORTANTE: Use a imagem fornecida como base e aplique as modificações solicitadas.
- Mantenha TODOS os elementos principais da imagem original (logotipos, objetos, pessoas)
- Aplique EXATAMENTE a modificação pedida
- Se for trocar fundo: remova o fundo atual e substitua pela cor/estilo solicitado (branco, preto, transparente, gradiente, etc)
- Se for adicionar elementos: mantenha a imagem e adicione o novo elemento
- Se for remover elementos: mantenha o resto e remova apenas o especificado
- Qualidade profissional e alta resolução
- Resultado limpo e bem acabado`;

          const response = await base44.integrations.Core.GenerateImage({
            prompt: editPrompt,
            existing_image_urls: imageFiles
          });

          const imageUrl = response.url || response.file_url || response;

          const aiMessage = {
            role: "assistant",
            content: "Aqui está sua imagem com as modificações aplicadas:",
            image: imageUrl
          };

          setMessages(prev => [...prev, aiMessage]);
          setGeneratingStatus("salvando...");
        } else {
          // Processar normalmente com LLM
          setGeneratingStatus("buscando resposta...");
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
          setGeneratingStatus("salvando...");
          speakText(response);
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
      setGeneratingStatus("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const addReply = (messageIndex) => {
    if (!replyText.trim()) return;
    
    setMessageReplies(prev => ({
      ...prev,
      [messageIndex]: [...(prev[messageIndex] || []), {
        text: replyText,
        timestamp: new Date().toISOString()
      }]
    }));
    setReplyText("");
    toast.success("Comentário adicionado!");
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
    <div className="min-h-screen bg-[#050506] text-white flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-80 bg-[#0a0a0b] border-r border-[#27272a] transform transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
            <h2 className="text-lg font-bold text-cyan-400">Chat History</h2>
            <Button
              onClick={() => setShowSidebar(false)}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-3">
            <Button
              onClick={createNewChat}
              className="w-full bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 rounded-lg border transition-all ${
                  currentConversationId === conv.id
                    ? 'bg-purple-600/20 border-purple-500/50'
                    : 'bg-[#18181b] border-[#27272a] hover:border-[#3f3f46]'
                }`}
              >
                {editingId === conv.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveTitle()}
                      className="bg-[#0a0a0b] border-[#27272a] text-white text-sm"
                      autoFocus
                    />
                    <Button
                      onClick={saveTitle}
                      size="icon"
                      className="bg-green-600 hover:bg-green-500 flex-shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => loadConversation(conv)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{conv.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(conv.last_message_date || conv.created_date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </button>
                    <div className="flex gap-1 mt-2">
                      <Button
                        onClick={() => startEditTitle(conv)}
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-white h-7"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => deleteConversation(conv.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 h-7"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-[#27272a] bg-[#121214] sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowSidebar(true)}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Link 
                to={createPageUrl("Home")} 
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Link>
            </div>
            <h1 className="text-xl font-bold">Chat IA Completo</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setAutoRead(!autoRead)}
                variant="ghost"
                size="icon"
                className={`${autoRead ? 'text-purple-400' : 'text-gray-400'} hover:text-white`}
                title={autoRead ? 'Desmutar voz' : 'Mutar voz'}
              >
                {autoRead ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>

              <Button
                onClick={() => setShowSettings(true)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => {
                  if (confirm("Limpar conversa atual?")) {
                    setMessages([]);
                    setFiles([]);
                    toast.success("Conversa limpa!");
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
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group relative`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSelectedMessageIndex(selectedMessageIndex === index ? null : index);
                  }}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 relative cursor-pointer transition-all ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-[#121214] border border-[#27272a] hover:border-purple-500/50"
                    } ${selectedMessageIndex === index ? "ring-2 ring-purple-500" : ""}`}
                    onClick={() => setSelectedMessageIndex(selectedMessageIndex === index ? null : index)}
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

                    {messageReplies[index] && messageReplies[index].length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                        <p className="text-xs font-semibold text-gray-300">Comentários ({messageReplies[index].length}):</p>
                        {messageReplies[index].map((reply, rIdx) => (
                          <div key={rIdx} className="bg-[#0a0a0b] rounded p-2 text-sm">
                            <p className="text-gray-200">{reply.text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(reply.timestamp).toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                        ))}
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
                      <span className="text-gray-400">{generatingStatus || "Pensando..."}</span>
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

        {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#121214] border-[#27272a] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Configurações
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Auto Read Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Leitura Automática</h3>
                  <p className="text-sm text-gray-400">Ler respostas em voz alta</p>
                </div>
                <Switch
                  checked={autoRead}
                  onCheckedChange={setAutoRead}
                />
              </div>
            </div>

            {/* Voice Selection */}
            {autoRead && (
              <div className="space-y-4 pt-3 border-t border-[#27272a]">
                <div>
                  <h3 className="font-semibold mb-2">Selecionar Voz</h3>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger className="bg-[#18181b] border-[#27272a] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121214] border-[#27272a]">
                      {voiceOptions.map((voice) => (
                        <SelectItem 
                          key={voice.lang} 
                          value={voice.lang}
                          className="text-white hover:bg-purple-500/20 cursor-pointer"
                        >
                          {voice.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Voice Speed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Velocidade da Voz</h3>
                    <span className="text-sm text-purple-400">{voiceRate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={voiceRate}
                    onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.5x</span>
                    <span>1.0x</span>
                    <span>2.0x</span>
                    <span>3.0x</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Reply Panel */}
      {selectedMessageIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50">
          <div className="bg-[#121214] border-t border-[#27272a] w-full rounded-t-2xl p-4">
            <div className="max-w-4xl mx-auto">
              {/* Mensagem Original */}
              <div className="mb-4 pb-4 border-b border-[#27272a]">
                <p className="text-xs text-gray-400 mb-2">Mensagem:</p>
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  {messages[selectedMessageIndex].content && (
                    <p className="text-white text-sm mb-2">{messages[selectedMessageIndex].content.substring(0, 300)}</p>
                  )}
                  {messages[selectedMessageIndex].image && (
                    <img src={messages[selectedMessageIndex].image} alt="msg" className="w-32 h-32 object-cover rounded" />
                  )}
                </div>
              </div>

              {/* Comentários Existentes */}
              {messageReplies[selectedMessageIndex] && messageReplies[selectedMessageIndex].length > 0 && (
                <div className="mb-4 pb-4 border-b border-[#27272a] max-h-40 overflow-y-auto">
                  <p className="text-xs text-gray-400 mb-2">Comentários ({messageReplies[selectedMessageIndex].length}):</p>
                  <div className="space-y-2">
                    {messageReplies[selectedMessageIndex].map((reply, idx) => (
                      <div key={idx} className="bg-[#0a0a0b] rounded p-2 text-sm">
                        <p className="text-gray-200">{reply.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(reply.timestamp).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input para Novo Comentário */}
              <div className="flex gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Adicione um comentário..."
                  className="bg-[#18181b] border-[#27272a] text-white resize-none min-h-[60px] flex-1"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => addReply(selectedMessageIndex)}
                    disabled={!replyText.trim()}
                    className="bg-purple-600 hover:bg-purple-500 flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setSelectedMessageIndex(null)}
                    variant="outline"
                    className="border-[#27272a] flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}