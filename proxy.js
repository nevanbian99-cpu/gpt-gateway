const { blocked } = require('./_lib');
module.exports = async (req, res) => {
  try {
    const o = req.query.o; let p = req.query.p || '';
    if (Array.isArray(p)) p = p.join('/');
    const origin = Buffer.from(o, 'base64url').toString();
    if (blocked(new URL(origin).hostname)) return res.status(400).send('Alamat tidak diizinkan');
    const q = new URL(req.url, 'http://x').searchParams; q.delete('o'); q.delete('p');
    const qs = q.toString();
    const prefix = '/p/' + o;
    const r = await fetch(origin + '/' + p + (qs ? '?' + qs : ''), {
      headers: { 'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0', Accept: req.headers.accept || '*/*', 'Accept-Language': req.headers['accept-language'] || 'id,en' },
      redirect: 'follow'
    });
    const type = r.headers.get('content-type') || 'application/octet-stream';
    let buf = Buffer.from(await r.arrayBuffer());
    if (type.includes('text/html')) {
      let html = buf.toString('utf8')
        .replaceAll(origin, prefix)
        .replace(/(\s(?:href|src|action)=["'])\/(?!\/)/gi, `$1${prefix}/`)
        .replace(/<meta[^>]+http-equiv=["']?content-security-policy["']?[^>]*>/gi, '');
      const inject = '<script>window.__GPT_SID="1"</script><script src="/widget.js"></script>';
      html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, inject + '</body>') : html + inject;
      buf = Buffer.from(html);
    } else if (type.includes('text/css')) {
      buf = Buffer.from(buf.toString('utf8').replace(/url\((['"]?)\/(?!\/)/g, `url($1${prefix}/`));
    }
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'no-store');
    res.status(r.status).send(buf);
  } catch (e) { res.status(502).send('Gagal membuka website: ' + e.message); }
};
