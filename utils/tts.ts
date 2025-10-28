// This utility converts text to speech using the Google TTS API.
import { Speaker } from '../hooks/useSimulation';

export const playText = async (text: string, speaker: Speaker, apiKey: string, onEnd: () => void) => {
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            input: { text },
            voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D', ssmlGender: 'MALE' },
            audioConfig: { audioEncoding: 'MP3' },
        }),
    });

    const data = await response.json();
    const audioContent = data.audioContent;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createBufferSource();
    
    const buffer = await audioContext.decodeAudioData(Buffer.from(audioContent, 'base64'));
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    source.onended = onEnd;

    return { 
        stop: () => source.stop()
    };
};