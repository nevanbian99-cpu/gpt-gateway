const { gpt } = require('./_lib');
module.exports = async (req, res) => {
  try {
    const { apiKey, model, messages = [] } = req.body || {};
    const reply = await gpt(apiKey, model, [{ role: 'system', content: 'Kamu asisten yang membantu. Jawab dalam bahasa pengguna.' }, ...messages.slice(-20)]);
    res.json({ reply });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
