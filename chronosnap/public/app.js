async function generate() {
  const fileInput = document.getElementById('photo');
  const select = document.getElementById('scenarios');
  const results = document.getElementById('results');
  results.innerHTML = '';
  if (!fileInput.files[0]) return alert('Upload a photo first');

  const arrayBuffer = await fileInput.files[0].arrayBuffer();
  const scenarios = Array.from(select.selectedOptions).map(o => o.value);

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: Array.from(new Uint8Array(arrayBuffer)), scenarios })
  });

  const data = await response.json();
  data.outputs.forEach(({ image, audio, reference }) => {
    if (reference) {
      const refEl = document.createElement('img');
      refEl.src = `data:image/jpeg;base64,${reference}`;
      refEl.alt = 'reference background';
      results.appendChild(refEl);
    }
    const imageEl = document.createElement('img');
    imageEl.src = `data:image/png;base64,${image}`;
    results.appendChild(imageEl);
    if (audio) {
      const audioEl = document.createElement('audio');
      audioEl.controls = true;
      audioEl.src = `data:audio/mpeg;base64,${audio}`;
      results.appendChild(audioEl);
    }
  });
}

document.getElementById('generate').addEventListener('click', generate);
