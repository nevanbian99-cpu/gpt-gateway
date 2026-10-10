exports.gpt = async (apiKey, model, messages) => {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
    body: JSON.stringify({ model: model || 'gpt-4o-mini', messages })
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'OpenAI error ' + r.status);
  return j.choices[0].message.content;
};
exports.blocked = h => /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1)/i.test(h);
