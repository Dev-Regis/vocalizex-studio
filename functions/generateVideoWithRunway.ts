import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        console.log('🚀 Iniciando geração com Runway ML');
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            console.error('❌ Usuário não autenticado');
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { videoClipId } = body;

        if (!videoClipId) {
            return Response.json({ error: 'videoClipId é obrigatório' }, { status: 400 });
        }

        console.log('🔍 Buscando VideoClip:', videoClipId);

        // Buscar o VideoClip
        const videoClips = await base44.entities.VideoClip.filter({ id: videoClipId });
        if (videoClips.length === 0) {
            return Response.json({ error: 'VideoClip não encontrado' }, { status: 404 });
        }

        const videoClip = videoClips[0];

        const RUNWAY_API_KEY = Deno.env.get('RUNWAY_API_KEY');
        console.log('🔑 RUNWAY_API_KEY:', RUNWAY_API_KEY ? 'Configurada ✅' : 'NÃO ENCONTRADA ❌');
        
        if (!RUNWAY_API_KEY) {
            return Response.json({ error: 'RUNWAY_API_KEY não configurada' }, { status: 500 });
        }

        // Criar prompt para o vídeo baseado na letra e descrição
        const imageUrl = videoClip.photoMan || videoClip.photoWoman || videoClip.photoBoth;
        
        let prompt = `A person singing and dancing energetically. ${videoClip.sceneDescription || ''}. Dynamic movement, professional music video style.`;
        
        if (videoClip.lyrics) {
            const firstLines = videoClip.lyrics.split('\n').slice(0, 3).join(' ');
            prompt += ` Song lyrics: ${firstLines}`;
        }

        console.log('📝 Prompt:', prompt);

        // Criar task de geração de vídeo na Runway
        const runwayPayload = {
            promptImage: imageUrl,
            promptText: prompt,
            model: 'gen3a_turbo',
            duration: 5,
            ratio: videoClip.orientation === 'vertical' ? '9:16' : '16:9'
        };

        console.log('📤 Enviando para Runway:', JSON.stringify(runwayPayload, null, 2));

        const createResponse = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RUNWAY_API_KEY}`,
                'Content-Type': 'application/json',
                'X-Runway-Version': '2024-11-06'
            },
            body: JSON.stringify(runwayPayload)
        });

        console.log('📊 Status Runway:', createResponse.status);

        if (!createResponse.ok) {
            const error = await createResponse.text();
            console.error('❌ Erro Runway:', error);
            return Response.json({ 
                error: 'Erro ao criar vídeo na Runway',
                details: error,
                status_code: createResponse.status
            }, { status: createResponse.status });
        }

        const createData = await createResponse.json();
        console.log('📋 Resposta Runway:', JSON.stringify(createData, null, 2));
        
        const taskId = createData.id;
        console.log('✅ Task ID criado:', taskId);

        // Fazer polling do status
        let videoUrl = null;
        let attempts = 0;
        const maxAttempts = 120; // 10 minutos máximo (5s cada)

        console.log('⏳ Iniciando polling...');

        while (attempts < maxAttempts && !videoUrl) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            attempts++;

            console.log(`⏳ Tentativa ${attempts}/${maxAttempts}`);

            const statusResponse = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${RUNWAY_API_KEY}`,
                    'X-Runway-Version': '2024-11-06'
                }
            });

            if (!statusResponse.ok) {
                console.error('❌ Erro ao verificar status:', statusResponse.status);
                const errorText = await statusResponse.text();
                console.error('❌ Detalhes:', errorText);
                continue;
            }

            const statusData = await statusResponse.json();
            console.log(`📊 Status: ${statusData.status}`);

            if (statusData.status === 'SUCCEEDED') {
                videoUrl = statusData.output?.[0] || statusData.video_url || statusData.url;
                console.log('🎉 Vídeo pronto! URL:', videoUrl);
            } else if (statusData.status === 'FAILED') {
                console.error('❌ Falha no processamento:', statusData);
                return Response.json({ 
                    error: 'Erro no processamento do vídeo',
                    details: statusData.failure || statusData
                }, { status: 500 });
            } else {
                console.log(`⏳ Status: ${statusData.status} - Progresso: ${statusData.progress || 0}%`);
            }
        }

        if (!videoUrl) {
            console.error('❌ Timeout após', attempts, 'tentativas');
            return Response.json({ 
                error: 'Timeout: vídeo não foi processado a tempo',
                attempts: attempts
            }, { status: 408 });
        }

        // Atualizar o VideoClip
        console.log('💾 Atualizando VideoClip...');
        await base44.asServiceRole.entities.VideoClip.update(videoClipId, {
            videoUrl: videoUrl,
            status: 'completed'
        });

        console.log('✅ Sucesso!');

        return Response.json({ 
            success: true,
            videoUrl: videoUrl,
            message: 'Vídeo gerado com sucesso via Runway ML!'
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