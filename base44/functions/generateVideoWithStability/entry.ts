import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { videoClipId } = await req.json();
        console.log('🎬 Gerando vídeo - VideoClip ID:', videoClipId);

        // Buscar o VideoClip
        const clips = await base44.asServiceRole.entities.VideoClip.filter({ id: videoClipId });
        if (clips.length === 0) {
            return Response.json({ error: 'VideoClip não encontrado' }, { status: 404 });
        }

        const videoClip = clips[0];
        console.log('📦 VideoClip carregado:', videoClip);

        // Pegar a API Key
        const apiKey = Deno.env.get("STABILITY_API_KEY");
        if (!apiKey) {
            return Response.json({ error: 'STABILITY_API_KEY não configurada' }, { status: 500 });
        }

        // Determinar qual imagem usar (prioridade: photoBoth > photoMan > photoWoman)
        const imageUrl = videoClip.photoBoth || videoClip.photoMan || videoClip.photoWoman;
        if (!imageUrl) {
            return Response.json({ error: 'Nenhuma imagem encontrada no VideoClip' }, { status: 400 });
        }

        console.log('🖼️ Usando imagem:', imageUrl);

        // Baixar a imagem
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            return Response.json({ 
                error: 'Erro ao baixar a imagem',
                details: `Não foi possível baixar a imagem: ${imageUrl}`,
                status_code: imageResponse.status
            }, { status: 400 });
        }
        const imageBlob = await imageResponse.blob();
        
        // Validar se é uma imagem válida
        if (!imageBlob.type.startsWith('image/')) {
            return Response.json({ 
                error: 'Arquivo inválido',
                details: 'O arquivo não é uma imagem válida',
                status_code: 400
            }, { status: 400 });
        }
        
        // Criar FormData
        const formData = new FormData();
        formData.append('image', imageBlob, 'image.jpg');
        formData.append('seed', '0');
        formData.append('cfg_scale', '1.8');
        formData.append('motion_bucket_id', '127');

        console.log('📤 Enviando para Stability AI...');

        // Chamar API da Stability AI - Image to Video (v2alpha)
        const response = await fetch('https://api.stability.ai/v2alpha/generation/image-to-video', {
            method: 'POST',
            headers: {
                'authorization': `Bearer ${apiKey}`,
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro Stability AI:', errorText);
            
            // Erro 404 - endpoint não encontrado ou imagem inválida
            if (response.status === 404) {
                return Response.json({ 
                    error: 'Recurso não encontrado na Stability AI',
                    details: 'Verifique se a imagem é válida e se a API está acessível. O serviço pode estar temporariamente indisponível.',
                    status_code: 404
                }, { status: 404 });
            }
            
            // Verificar se é erro de créditos
            if (errorText.includes('credits') || errorText.includes('insufficient') || response.status === 402) {
                return Response.json({ 
                    error: 'Créditos insuficientes na Stability AI',
                    details: 'Você precisa adicionar créditos em https://platform.stability.ai/account/credits',
                    status_code: response.status,
                    needsCredits: true
                }, { status: response.status });
            }
            
            // Erro de autorização
            if (response.status === 401 || response.status === 403) {
                return Response.json({ 
                    error: 'Erro de autorização',
                    details: 'Verifique se a STABILITY_API_KEY está correta',
                    status_code: response.status
                }, { status: response.status });
            }
            
            return Response.json({ 
                error: 'Erro ao criar vídeo na Stability AI',
                details: errorText,
                status_code: response.status
            }, { status: response.status });
        }

        const result = await response.json();
        const generationId = result.id;
        console.log('✅ Geração iniciada! ID:', generationId);

        // Polling para checar o status
        let videoUrl = null;
        let attempts = 0;
        const maxAttempts = 60; // 5 minutos (5 segundos * 60)

        while (attempts < maxAttempts && !videoUrl) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Aguardar 5 segundos
            attempts++;

            console.log(`⏳ Tentativa ${attempts}/${maxAttempts} - Checando status...`);

            const statusResponse = await fetch(
                `https://api.stability.ai/v2alpha/generation/image-to-video/result/${generationId}`,
                {
                    method: 'GET',
                    headers: {
                        'authorization': `Bearer ${apiKey}`,
                        'accept': 'video/*'
                    }
                }
            );

            if (statusResponse.status === 202) {
                console.log('⏳ Ainda processando...');
                continue;
            }

            if (!statusResponse.ok) {
                // Se for 404, a geração pode ter expirado ou falhado
                if (statusResponse.status === 404) {
                    console.error('❌ Geração não encontrada (ID:', generationId, ')');
                    return Response.json({ 
                        error: 'Geração não encontrada',
                        details: 'A geração do vídeo expirou ou falhou. Tente novamente.',
                        status_code: 404
                    }, { status: 404 });
                }
                
                const errorText = await statusResponse.text();
                console.error('❌ Erro ao checar status:', errorText);
                return Response.json({ 
                    error: 'Erro ao verificar status do vídeo',
                    details: errorText
                }, { status: statusResponse.status });
            }

            // Vídeo pronto - baixar e fazer upload
            console.log('✅ Vídeo gerado! Fazendo upload...');
            const videoBlob = await statusResponse.blob();
            
            // Fazer upload do vídeo para o storage
            const uploadResponse = await base44.asServiceRole.integrations.Core.UploadFile({
                file: videoBlob
            });
            
            videoUrl = uploadResponse.file_url;
            console.log('✅ Upload completo! URL:', videoUrl);
            break;
        }

        if (!videoUrl) {
            return Response.json({ 
                error: 'Timeout ao gerar vídeo',
                details: 'O vídeo não foi gerado dentro do tempo esperado'
            }, { status: 408 });
        }

        // Atualizar o VideoClip com a URL do vídeo
        await base44.asServiceRole.entities.VideoClip.update(videoClipId, {
            videoUrl: videoUrl,
            status: 'completed'
        });

        console.log('🎉 VideoClip atualizado com sucesso!');

        return Response.json({ 
            success: true, 
            videoUrl: videoUrl 
        });

    } catch (error) {
        console.error('❌ ERRO GERAL:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});