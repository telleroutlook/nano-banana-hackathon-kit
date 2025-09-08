import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'cross-fetch';

export const onRequestPost = async ({ request, env }) => {
  const { image, scenarios } = await request.json();
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-edit' });

  const baseImage = Buffer.from(Uint8Array.from(image)).toString('base64');
  const outputs = [];

  for (const scene of scenarios) {
    // attempt to fetch a public reference image
    let reference;
    try {
      const bgRes = await fetch(`https://source.unsplash.com/featured/?${encodeURIComponent(scene)}`);
      if (bgRes.ok) {
        const bgArrayBuffer = await bgRes.arrayBuffer();
        reference = Buffer.from(bgArrayBuffer).toString('base64');
      }
    } catch (e) {
      // ignore network failures
    }

    // Image generation
    const parts = [{ inlineData: { data: baseImage, mimeType: 'image/png' } }];
    if (reference) {
      parts.push({ inlineData: { data: reference, mimeType: 'image/jpeg' } });
    }
    parts.push({ text: `Place the person in ${scene}. Use the additional image as background if provided.` });

    const result = await model.generateContent(parts);
    const imageData = result.response.candidates[0].content.parts[0].inlineData.data;

    let audio;
    if (env.ELEVEN_API_KEY) {
      const narration = `You are now in ${scene}.`;
      const ttsRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/adam', {
        method: 'POST',
        headers: {
          'xi-api-key': env.ELEVEN_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: narration })
      });
      audio = Buffer.from(await ttsRes.arrayBuffer()).toString('base64');
    }

    outputs.push({ image: imageData, audio, reference });
  }

  return new Response(JSON.stringify({ outputs }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
