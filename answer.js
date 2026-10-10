const { gpt } = require('./_lib');
module.exports = async (req, res) => {
  try {
    const { apiKey, model, text = '' } = req.body || {};
    const reply = await gpt(apiKey, model, [
      { role: 'system', content: 'Kamu menerima teks dari sebuah halaman website. Temukan semua pertanyaan di dalamnya (termasuk pilihan ganda), lalu jawab satu per satu dengan jelas dan ringkas. Tulis ulang tiap pertanyaan singkat, lalu jawabannya. Jika tidak ada pertanyaan, katakan begitu. Gunakan bahasa yang sama dengan halaman.' },
      { role: 'user', content: String(text).slice(0, 14000) }
    ]);
    res.json({ reply });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
