/* Character Forge — foto de perfil do personagem.
 * A imagem escolhida é reduzida no próprio navegador (até 400 px, JPEG) e fica
 * guardada na ficha (c.portrait) como data URL. Assim ela vai junto para a
 * impressão, para o arquivo baixado e para a mesa ao vivo, sem servidor de imagens. */
(function () {
  const MAX_SIDE = 400;          // px do lado maior
  const MAX_CHARS = 160000;      // limite do data URL (~120 KB)
  const MAX_INPUT = 25 * 1024 * 1024;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const valid = src => typeof src === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(src) && src.length <= 400000;

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('formato')); };
      img.src = url;
    });
  }

  /* Reduz e comprime a imagem; devolve um data URL JPEG */
  async function process(file) {
    if (!file || !/^image\//.test(file.type || '') && !/\.(jpe?g|png|webp|gif|bmp|heic|heif|avif)$/i.test(file.name || '')) throw new Error('tipo');
    if (file.size > MAX_INPUT) throw new Error('grande');
    const img = await loadImage(file);
    const w0 = img.naturalWidth, h0 = img.naturalHeight;
    if (!w0 || !h0) throw new Error('formato');
    let side = MAX_SIDE, q = 0.85, out = '';
    for (let i = 0; i < 6; i++) {
      const k = Math.min(1, side / Math.max(w0, h0));
      const w = Math.max(1, Math.round(w0 * k)), h = Math.max(1, Math.round(h0 * k));
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#241d18'; // fundo para imagens com transparência
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      out = cv.toDataURL('image/jpeg', q);
      if (out.length <= MAX_CHARS) return out;
      q = Math.max(0.5, q - 0.1); side = Math.round(side * 0.85);
    }
    if (out.length <= MAX_CHARS * 1.5) return out;
    throw new Error('grande');
  }

  function errorText(e) {
    const m = e && e.message;
    if (m === 'tipo') return 'Esse arquivo não é uma imagem. Use JPG, PNG ou WEBP.';
    if (m === 'grande') return 'Imagem grande demais. Tente outra (até 25 MB).';
    return 'Não foi possível abrir essa imagem. Tente salvar como JPG ou PNG e enviar de novo.';
  }

  function initial(c) {
    const n = String((c && c.name) || '').trim();
    return n ? n[0].toUpperCase() : '?';
  }

  /* Avatar simples (cards, listas) */
  function avatar(c, cls) {
    const src = c && valid(c.portrait) ? c.portrait : null;
    return src
      ? `<img class="avatar ${cls || ''}" src="${src}" alt="Foto de ${esc(c.name || 'personagem')}" loading="lazy">`
      : `<span class="avatar ph ${cls || ''}" aria-hidden="true">${esc(initial(c))}</span>`;
  }

  /* Bloco com foto + botões de enviar/trocar/remover */
  function widget(c, opts) {
    opts = opts || {};
    const has = c && valid(c.portrait);
    return `<div class="portrait ${opts.cls || ''}">
      <div class="portrait-frame">${has ? `<img src="${c.portrait}" alt="Foto de ${esc(c.name || 'personagem')}">` : `<span class="portrait-ph" aria-hidden="true">${esc(initial(c))}</span>`}</div>
      <div class="portrait-actions no-print">
        <label class="btn sm">📷 ${has ? 'Trocar foto' : 'Enviar foto'}<input type="file" accept="image/*" data-portrait="${esc(c.id)}" class="sr-only"></label>
        ${has ? `<button class="btn sm ghost" data-action="portrait-remove" data-id="${esc(c.id)}">Remover</button>` : ''}
      </div>
    </div>`;
  }

  /* Copia sem a foto (para códigos de texto, que ficariam enormes) */
  function strip(obj) {
    const copy = Object.assign({}, obj);
    delete copy.portrait;
    return copy;
  }

  window.CF = window.CF || {};
  CF.portrait = { process, errorText, avatar, widget, strip, valid };
})();
