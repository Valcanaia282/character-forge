/* Salvar a ficha como arquivo PDF (sem abrir a janela de impressão).
   Usa html2pdf.js (html2canvas + jsPDF), carregado só na primeira vez que alguém clica. */
(function () {
  const CF = window.CF = window.CF || {};
  const LIB = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
  let loading = null, busy = false;

  function loadLib() {
    if (window.html2pdf) return Promise.resolve();
    if (!loading) {
      loading = new Promise((ok, fail) => {
        const s = document.createElement('script');
        s.src = LIB; s.async = true;
        s.onload = ok;
        s.onerror = () => { loading = null; s.remove(); fail(new Error('lib')); };
        document.head.appendChild(s);
      });
    }
    return loading;
  }

  function fileName(name) {
    const base = String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_').slice(0, 60);
    return 'Ficha_' + (base || 'personagem') + '.pdf';
  }

  /* sheet: o elemento .sheet já na página, ou o HTML da ficha.
     code: código CF1 da ficha, guardado dentro do PDF para reabrir em outro computador. */
  async function save(sheet, name, toast, code) {
    if (busy) return;
    busy = true;
    const say = toast || (() => {});
    say('Gerando o PDF da ficha…');
    try {
      await loadLib();
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const host = document.createElement('div');
      host.className = 'pdf-host';
      if (typeof sheet === 'string') host.innerHTML = sheet;
      else host.appendChild(sheet.cloneNode(true));
      host.querySelectorAll('.no-print').forEach(n => n.remove());
      host.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      await window.html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: fileName(name),
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.sh-box', '.sh-stats', '.sh-head', '.sh-track li', 'tr'] }
      }).from(host).toPdf().get('pdf').then(pdf => {
        // chave extra no catálogo do PDF: leitores de PDF ignoram, o Character Forge lê de volta
        if (code && /^CF1:[A-Za-z0-9+/=]+$/.test(code)) {
          pdf.internal.events.subscribe('putCatalog', () => pdf.internal.write('/CFCharacter (' + code + ')'));
        }
      }).save();
      say('PDF salvo! Confira a pasta de downloads.');
    } catch (e) {
      console.error(e);
      say('Não consegui gerar o PDF. Verifique a internet e tente de novo.');
    } finally {
      busy = false;
    }
  }

  /* Lê o código da ficha de um PDF salvo pelo Character Forge (ArrayBuffer). */
  function readCode(buf) {
    const bytes = new Uint8Array(buf);
    let text = '';
    for (let i = 0; i < bytes.length; i += 32768) text += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768));
    const m = text.match(/\/CFCharacter\s*\((CF1:[A-Za-z0-9+/=]+)\)/);
    if (!m) throw new Error('este PDF não tem os dados da ficha. Use um PDF baixado pelo botão “Salvar PDF” do Character Forge (PDFs antigos ou editados em outro programa não servem).');
    return m[1];
  }

  CF.pdf = { save, fileName, readCode };
})();
