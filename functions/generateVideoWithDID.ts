import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { videoClipId } = await req.json();

        if (!videoClipId) {
            return Response.json({ error: 'videoClipId é obrigatório' }, { status: 400 });
        }

        // Buscar os dados do VideoClip
        const videoClip = await base44.entities.VideoClip.get(videoClipId);

        if (!videoClip) {
            return Response.json({ error: 'VideoClip não encontrado' }, { status: 404 });
        }

        const DID_API_KEY = Deno.env.get('DID_API_KEY');
        if (!DID_API_KEY) {
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

        // Criar o vídeo na D-ID
        const createResponse = await fetch('https://api.d-id.com/talks', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${DID_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(didPayload)
        });

        if (!createResponse.ok) {
            const error = await createResponse.text();
            return Response.json({ 
                error: 'Erro ao criar vídeo na D-ID',
                details: error
            }, { status: createResponse.status });
        }

        const createData = await createResponse.json();
        const talkId = createData.id;

        // Aguardar o processamento do vídeo (polling)
        let videoUrl = null;
        let attempts = 0;
        const maxAttempts = 60; // 5 minutos máximo

        while (attempts < maxAttempts && !videoUrl) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Aguardar 5 segundos

            const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
                headers: {
                    'Authorization': `Basic ${DID_API_KEY}`
                }
            });

            if (!statusResponse.ok) {
                return Response.json({ 
                    error: 'Erro ao verificar status do vídeo' 
                }, { status: statusResponse.status });
            }

            const statusData = await statusResponse.json();

            if (statusData.status === 'done') {
                videoUrl = statusData.result_url;
            } else if (statusData.status === 'error') {
                return Response.json({ 
                    error: 'Erro no processamento do vídeo',
                    details: statusData.error
                }, { status: 500 });
            }

            attempts++;
        }

        if (!videoUrl) {
            return Response.json({ 
                error: 'Timeout: vídeo não foi processado a tempo' 
            }, { status: 408 });
        }

        // Atualizar o VideoClip com o URL do vídeo
        await base44.asServiceRole.entities.VideoClip.update(videoClipId, {
            videoUrl: videoUrl,
            status: 'completed'
        });

        return Response.json({ 
            success: true,
            videoUrl: videoUrl,
            message: 'Vídeo gerado com sucesso!'
        });

    } catch (error) {
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});