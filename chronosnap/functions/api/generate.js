import { GoogleGenerativeAI } from '@google/generative-ai';

const backgrounds = {
  'Ancient Egypt pyramid':
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#d4af37"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="#000">Egypt</text></svg>',
  'Renaissance art studio':
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#deb887"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="#000">Renaissance</text></svg>',
  'futuristic Mars colony':
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#ff4500"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="#fff">Mars</text></svg>'
};

export const onRequestPost = async ({ request, env }) => {
  const { image, scenarios } = await request.json();
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-edit' });

  const baseImage = Buffer.from(Uint8Array.from(image)).toString('base64');
  const outputs = [];

  for (const scene of scenarios) {
    const bgSvg = backgrounds[scene];
    let reference;
    let referenceType;
    if (bgSvg) {
      reference = Buffer.from(bgSvg).toString('base64');
      referenceType = 'image/svg+xml';
    }

    // Image generation
    const parts = [{ inlineData: { data: baseImage, mimeType: 'image/png' } }];
    if (reference) {
      parts.push({ inlineData: { data: reference, mimeType: referenceType } });
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

    outputs.push({ image: imageData, audio, reference, referenceType });
  }

  return new Response(JSON.stringify({ outputs }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
