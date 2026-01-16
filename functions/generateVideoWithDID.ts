import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        console.log('🚀 Função iniciada');
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        console.log('👤 Usuário:', user?.email);

        if (!user) {
            console.error('❌ Usuário não autenticado');
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        console.log('📦 Body recebido:', body);
        
        const { videoClipId } = body;

        if (!videoClipId) {
            console.error('❌ videoClipId não fornecido');
            return Response.json({ error: 'videoClipId é obrigatório' }, { status: 400 });
        }

        console.log('🔍 Buscando VideoClip ID:', videoClipId);

        // Buscar os dados do VideoClip
        const videoClips = await base44.entities.VideoClip.filter({ id: videoClipId });

        if (videoClips.length === 0) {
            return Response.json({ error: 'VideoClip não encontrado' }, { status: 404 });
        }

        const videoClip = videoClips[0];

        const DID_API_KEY = Deno.env.get('DID_API_KEY');
        console.log('🔑 DID_API_KEY:', DID_API_KEY ? 'Configurada ✅' : 'NÃO ENCONTRADA ❌');
        
        if (!DID_API_KEY) {
            console.error('❌ DID_API_KEY não configurada');
            return Response.json({ error: 'DID_API_KEY não configurada' }, { status: 500 });
        }

        // Preparar a requisição para a D-ID
        const didPayload = {
            source_url: videoClip.photoMan || videoClip.photoWoman || videoClip.photoBoth,
            script: {
                type: "audio",
                audio_url: videoClip.musicUrl,
                reduce_noise: true
            },
            config: {
                fluent: true,
                pad_audio: 0,
                stitch: true,
                result_format: videoClip.orientation === 'vertical' ? '1080x1920' : '1920x1080'
            }
        };

        // Adicionar marca d'água se fornecida
        if (videoClip.watermark) {
            didPayload.config.logo = {
                url: "data:text/plain;base64," + btoa(videoClip.watermark),
                position: [10, 10]
            };
        }

        console.log('Enviando para D-ID:', JSON.stringify(didPayload, null, 2));

        // Criar o vídeo na D-ID
        const createResponse = await fetch('https://api.d-id.com/talks', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${DID_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(didPayload)
        });

        console.log('📊 Status D-ID:', createResponse.status);

        if (!createResponse.ok) {
            const error = await createResponse.text();
            console.error('❌ Erro D-ID:', error);
            return Response.json({ 
                error: 'Erro ao criar vídeo na D-ID',
                details: error,
                status_code: createResponse.status
            }, { status: createResponse.status });
        }

        const createData = await createResponse.json();
        console.log('📋 Resposta D-ID:', JSON.stringify(createData, null, 2));
        const talkId = createData.id;
        console.log('✅ Talk ID criado:', talkId);

        // Aguardar o processamento do vídeo (polling)
        let videoUrl = null;
        let attempts = 0;
        const maxAttempts = 60; // 5 minutos máximo

        console.log('⏳ Iniciando polling do status...');

        while (attempts < maxAttempts && !videoUrl) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Aguardar 5 segundos
            attempts++;

            console.log(`⏳ Tentativa ${attempts}/${maxAttempts} - Verificando status...`);

            const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
                headers: {
                    'Authorization': `Basic ${DID_API_KEY}`
                }
            });

            if (!statusResponse.ok) {
                console.error('❌ Erro ao verificar status:', statusResponse.status);
                return Response.json({ 
                    error: 'Erro ao verificar status do vídeo',
                    status_code: statusResponse.status
                }, { status: statusResponse.status });
            }

            const statusData = await statusResponse.json();
            console.log(`📊 Status atual: ${statusData.status}`);

            if (statusData.status === 'done') {
                videoUrl = statusData.result_url;
                console.log('🎉 Vídeo pronto! URL:', videoUrl);
            } else if (statusData.status === 'error') {
                console.error('❌ Erro no processamento:', statusData.error);
                return Response.json({ 
                    error: 'Erro no processamento do vídeo',
                    details: statusData.error || statusData
                }, { status: 500 });
            } else {
                console.log(`⏳ Status: ${statusData.status} - Aguardando...`);
            }
        }

        if (!videoUrl) {
            console.error('❌ Timeout após', attempts, 'tentativas');
            return Response.json({ 
                error: 'Timeout: vídeo não foi processado a tempo',
                attempts: attempts
            }, { status: 408 });
        }

        // Atualizar o VideoClip com o URL do vídeo
        console.log('💾 Atualizando VideoClip no banco...');
        await base44.asServiceRole.entities.VideoClip.update(videoClipId, {
            videoUrl: videoUrl,
            status: 'completed'
        });

        console.log('✅ Sucesso! VideoClip atualizado');

        return Response.json({ 
            success: true,
            videoUrl: videoUrl,
            message: 'Vídeo gerado com sucesso!'
        });

    } catch (error) {
        console.error('❌ ERRO FATAL:', error);
        console.error('❌ Stack:', error.stack);
        return Response.json({ 
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});