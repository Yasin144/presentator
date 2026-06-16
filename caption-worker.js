let pipeline, env;
let transcriber = null;

function extractSafeData(data) {
    if (!data) return null;
    try {
        return JSON.parse(JSON.stringify(data));
    } catch(e) {
        // If JSON cycle fails, manually extract known valid keys
        return {
            status: data.status,
            name: data.name,
            file: data.file,
            progress: data.progress,
            timestamp: data.timestamp ? [data.timestamp[0], data.timestamp[1]] : null,
            text: data.text || ""
        };
    }
}

self.onmessage = async (e) => {
    if (e.data.type === 'init') {
        try {
            if (!pipeline) {
                const transformers = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.16.1');
                pipeline = transformers.pipeline;
                env = transformers.env;
                env.allowLocalModels = false;
                env.useBrowserCache = true;
            }
            if (!transcriber) {
                transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small.en', {
                    progress_callback: data => {
                        self.postMessage({ type: 'progress', data: extractSafeData(data) });
                    }
                });
            }
            self.postMessage({ type: 'init_done' });
        } catch (err) {
            self.postMessage({ type: 'error', error: err.message });
        }
    } else if (e.data.type === 'transcribe') {
        try {
            const { audioDataArray, options, duration } = e.data;
            const result = await transcriber(audioDataArray, {
                ...options,
                chunk_callback: (chunk) => {
                    self.postMessage({ type: 'chunk_progress', chunk: extractSafeData(chunk), duration });
                }
            });
            const safeResult = extractSafeData(result);
            self.postMessage({ type: 'result', result: safeResult });
        } catch (err) {
            self.postMessage({ type: 'error', error: err.message });
        }
    }
};
