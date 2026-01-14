import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    // Transcrever áudio para texto
    const transcriptionPrompt = `Você é um especialista em transcrição de áudio. Você receberá um arquivo de áudio MP3 e deve transcrever COMPLETAMENTE toda a letra da música.

INSTRUÇÕES CRÍTICAS:
1. Ouça todo o áudio com atenção máxima
2. Transcreva PALAVRA POR PALAVRA tudo que é cantado
3. Mantenha a estrutura e organização da música
4. Use formatação clara com seções como [Verso 1], [Refrão], [Verso 2], [Ponte], [Outro]
5. Se houver instrumentais longos sem voz, marque como [Instrumental]
6. NÃO omita nenhuma parte cantada
7. Mantenha a pontuation e capitalização apropriadas

FORMATO DE RESPOSTA:
[Intro]
(letra se houver)

[Verso 1]
linha 1
linha 2
linha 3

[Refrão]
refrão linha 1
refrão linha 2

Continue transcrevendo TODA a música até o final.

Agora transcreva COMPLETAMENTE a letra:`;

    const transcription = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: transcriptionPrompt,
      file_urls: [file_url],
      add_context_from_internet: false
    });

    if (!transcription || transcription.trim().length < 20) {
      return Response.json({
        success: false,
        lyrics: null,
        error: 'Could not extract lyrics'
      });
    }

    return Response.json({
      success: true,
      lyrics: transcription.trim()
    });
  } catch (error) {
    console.error('Error extracting lyrics:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});