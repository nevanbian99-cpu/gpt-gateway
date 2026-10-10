const { blocked } = require('./_lib');
module.exports = async (req, res) => {
  const { url, apiKey } = req.body || {};
  let t; try { t = new URL(url); if (!/^https?:$/.test(t.protocol)) throw 0; } catch { return res.status(400).json({ error: 'URL tidak valid (harus diawali http:// atau https://).' }); }
  if (blocked(t.hostname)) return res.status(400).json({ error: 'Alamat ini tidak diizinkan.' });
  if (!apiKey) return res.status(400).json({ error: 'API key OpenAI wajib diisi.' });
  const chk = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: 'Bearer ' + apiKey } });
  if (!chk.ok) return res.status(401).json({ error: 'API key ditolak OpenAI (status ' + chk.status + ').' });
  res.json({ start: '/p/' + Buffer.from(t.origin).toString('base64url') + t.pathname + t.search });
};
