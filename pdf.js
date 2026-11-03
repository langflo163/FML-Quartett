// FML Quartett – PDF-Datenblatt einer Karte (A4, vektorbasiert mit jsPDF).
// Wird erst beim Tippen auf „PDF“ geladen. Schriften und Bibliotheken liegen im Repo (lib/, fonts/).
(function () {
  const RED = [211, 32, 42], INK = [20, 20, 20], MUTED = [107, 104, 102], LINE = [220, 217, 214];
  const W = 210, H = 297, L = 12, R = 198, BOTTOM = 280;
  const KLABEL = { auto: "RC-Car", flugzeug: "Flugzeug", boot: "Boot", heli: "Hubschrauber" };

  function loadScript(src) {
    return new Promise((ok, bad) => {
      if (document.querySelector(`script[src="${src}"]`)) return ok();
      const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => bad(new Error("lib")); document.head.appendChild(s);
    });
  }
  async function b64(url) {
    const buf = await (await fetch(url)).arrayBuffer(); const u8 = new Uint8Array(buf); let s = "";
    for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(s);
  }
  let fontCache = null;
  async function fonts() {
    if (!fontCache) fontCache = Promise.all([
      ["SairaCondensed-ExtraBold.ttf", "Saira", "bold"], ["SairaCondensed-Bold.ttf", "Saira", "normal"],
      ["IBMPlexSans-Regular.ttf", "Plex", "normal"], ["IBMPlexMono-Regular.ttf", "PlexMono", "normal"],
    ].map(async ([f, n, st]) => [f, n, st, await b64("fonts/" + f)]));
    return fontCache;
  }
  function img(url) {
    return new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
  }
  // Bild auf Zielformat zuschneiden (cover), weißer Rand mit runden Ecken, als JPEG.
  async function crop(url, wmm, hmm, rmm) {
    const i = await img(url), k = 12, w = Math.round(wmm * k), h = Math.round(hmm * k), r = rmm * k;
    const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d");
    x.fillStyle = "#fff"; x.fillRect(0, 0, w, h);
    x.save(); x.beginPath();
    if (x.roundRect) x.roundRect(0, 0, w, h, r); else x.rect(0, 0, w, h);
    x.clip();
    const s = Math.max(w / i.naturalWidth, h / i.naturalHeight), dw = i.naturalWidth * s, dh = i.naturalHeight * s;
    x.drawImage(i, (w - dw) / 2, (h - dh) / 2, dw, dh); x.restore();
    return c.toDataURL("image/jpeg", 0.88);
  }
  async function pngData(url) {
    const i = await img(url); const c = document.createElement("canvas"); c.width = i.naturalWidth; c.height = i.naturalHeight;
    c.getContext("2d").drawImage(i, 0, 0); return c.toDataURL("image/png");
  }
  const eur = n => n == null ? "—" : n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const vidUrl = v => typeof v === "string" ? v : (v && v.url) || "";

  async function build(m, code, costs, photoUrl) {
    await Promise.all([loadScript("lib/jspdf.umd.min.js"), loadScript("lib/qrcode.js")]);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
    for (const [f, n, st, data] of await fonts()) { doc.addFileToVFS(f, data); doc.addFont(f, n, st); }
    const set = (font, style, size, col) => { doc.setFont(font, style); doc.setFontSize(size); doc.setTextColor(...(col || INK)); };
    const lh = size => size * 0.3528 * 1.25;
    const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

    // Kopf
    doc.setFillColor(...RED); doc.rect(0, 0, W, 30, "F");
    doc.setFillColor(...INK); doc.rect(0, 0, 30, 30, "F");
    set("Saira", "bold", 30, [255, 255, 255]); doc.text(code, 15, 18.5, { align: "center", baseline: "middle" });
    let ts = 24; set("Saira", "bold", ts, [255, 255, 255]);
    const title = (m.name || "").toUpperCase();
    while (doc.getTextWidth(title) > 140 && ts > 14) { ts -= 1; doc.setFontSize(ts); }
    doc.text(title, 36, 15);
    set("Saira", "normal", 9.5, [255, 255, 255]);
    doc.text([KLABEL[m.kategorie] || "", m.massstab || "", m.untertitel || ""].filter(Boolean).join(" · ").toUpperCase(), 36, 22.5, { maxWidth: 140 });
    try { doc.addImage(await pngData("icons/icon-180.png"), "PNG", 181, 6, 18, 18); } catch (e) {}

    // Foto + Technische Daten
    let y = 38;
    const pw = 104, ph = 78;
    if (photoUrl) {
      try { doc.addImage(await crop(photoUrl, pw, ph, 2.5), "JPEG", L, y, pw, ph); } catch (e) {}
    } else { doc.setFillColor(227, 225, 223); doc.roundedRect(L, y, pw, ph, 2.5, 2.5, "F"); }
    doc.setDrawColor(...INK); doc.setLineWidth(0.6); doc.roundedRect(L, y, pw, ph, 2.5, 2.5, "S");

    const cx = 123, cw = R - cx;
    set("Saira", "normal", 11.5); doc.text("TECHNISCHE DATEN", cx, y + 4);
    doc.setLineWidth(0.6); doc.line(cx, y + 6, R, y + 6);
    let ty = y + 11;
    (m.werte || []).forEach((w, i) => {
      if (i) { doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.line(cx, ty - 3.6, R, ty - 3.6); }
      // Label links, Wert rechts – der Wert wird umbrochen, damit er nie ins Label oder Foto läuft
      set("Plex", "normal", 6.8, MUTED); const lab = (w.label || "").toUpperCase();
      const labW = Math.min(doc.getTextWidth(lab), cw * 0.45); doc.text(doc.splitTextToSize(lab, cw * 0.45)[0], cx, ty);
      let vs = 9.5; set("PlexMono", "normal", vs, w.wert ? INK : MUTED);
      const vw = cw - labW - 3; let val = doc.splitTextToSize(w.wert || "offen", vw);
      if (val.length > 1) { vs = 8.2; doc.setFontSize(vs); val = doc.splitTextToSize(w.wert || "offen", vw); }
      doc.text(val, R, ty, { align: "right" });
      let h = 5.2 + (val.length - 1) * lh(vs);
      if (w.quelle) {
        set("Plex", "normal", 6.2, MUTED); const q = doc.splitTextToSize(w.quelle, cw - 10);
        doc.text(q, R, ty + 3.4 + (val.length - 1) * lh(vs), { align: "right" }); h += q.length * lh(6.2);
      }
      ty += h + 1.6;
    });
    y = Math.max(y + ph, ty - 3) + 9;

    // Komponenten
    const cols = costs
      ? [{ x: L, w: 92 }, { x: 107, w: 32 }, { x: 142, w: 32 }, { x: R, w: 22, right: true }]
      : [{ x: L, w: 104 }, { x: 119, w: 36 }, { x: 158, w: 40 }];
    let inTable = true;
    const newPage = () => { doc.addPage(); y = 16; if (inTable) head(); };
    const ensure = h => { if (y + h > BOTTOM) newPage(); };
    function head() {
      set("Plex", "normal", 6.3, MUTED);
      ["TEIL", "ART.-NR.", "SHOP", "PREIS"].slice(0, cols.length).forEach((t, i) =>
        doc.text(t, cols[i].right ? cols[i].x : cols[i].x, y, cols[i].right ? { align: "right" } : undefined));
      y += 3;
    }
    set("Saira", "normal", 11.5); doc.text("VERBAUTE KOMPONENTEN", L, y);
    doc.setDrawColor(...INK); doc.setLineWidth(0.6); doc.line(L, y + 2, R, y + 2); y += 7; head();
    const groups = {}; (m.komponenten || []).forEach(k => (groups[k.gruppe || "Sonstiges"] ??= []).push(k));
    let total = 0;
    for (const [g, ks] of Object.entries(groups)) {
      ensure(14); y += 2.5;
      set("Saira", "normal", 8.5, RED); doc.text(g.toUpperCase(), L, y + 2.8); y += 4.5;
      ks.forEach((k, idx) => {
        const n = k.menge || 1; if (k.preis) total += k.preis * n;
        let hints = String(k.hinweis || "").split(/\s*·\s*/).filter(Boolean);
        if (!costs) hints = hints.filter(h => !/^preis/i.test(h));
        set("Plex", "normal", 8.4); const name = doc.splitTextToSize((n > 1 ? n + "× " : "") + (k.name || ""), cols[0].w);
        set("Plex", "normal", 6.3); const hint = hints.length ? doc.splitTextToSize(hints.join(" · "), cols[0].w) : [];
        set("PlexMono", "normal", 7.2); const art = k.artnr ? doc.splitTextToSize(k.artnr, cols[1].w) : [];
        set("Plex", "normal", 8.4); const shop = k.shop ? doc.splitTextToSize(k.shop, cols[2].w) : [];
        const h = Math.max(name.length * lh(8.4) + hint.length * lh(6.3), art.length * lh(7.2), shop.length * lh(8.4)) + 2.4;
        if (y + h > BOTTOM) { newPage(); }
        if (idx) { doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.line(L, y, R, y); }
        const by = y + 3.6;
        set("Plex", "normal", 8.4); doc.text(name, cols[0].x, by);
        if (hint.length) { set("Plex", "normal", 6.3, MUTED); doc.text(hint, cols[0].x, by + name.length * lh(8.4) - 0.6); }
        if (art.length) { set("PlexMono", "normal", 7.2); doc.text(art, cols[1].x, by); }
        if (shop.length) { set("Plex", "normal", 8.4); doc.text(shop, cols[2].x, by); }
        if (costs) { set("PlexMono", "normal", 7.8); doc.text(k.inSet ? "im Set" : eur(k.preis == null ? null : k.preis * n), R, by, { align: "right" }); }
        y += h;
      });
    }
    if (costs) {
      ensure(10); doc.setDrawColor(...INK); doc.setLineWidth(0.6); doc.line(L, y + 1, R, y + 1);
      set("Saira", "bold", 11); doc.text("GESAMT", L, y + 6.5);
      set("PlexMono", "normal", 9.5); doc.text(eur(total), R, y + 6.5, { align: "right" }); y += 9;
    }

    inTable = false;
    // Fernsteuerung: Startstellung + Belegung (nur belegte Geber)
    const S = m._sender, sd = m.sender;
    if (S && sd) {
      const bel = sd.belegung || {}, used = S.prof.geber.filter(g => bel[g.id] && bel[g.id].funktion);
      const stOf = b => Array.isArray(b.stellungen) ? b.stellungen.filter(x => x && x.text) : ["oben", "unten"].filter(k => b[k]).map(k => ({ name: k, text: b[k] }));
      const starts = used.filter(g => bel[g.id].start);
      const hints = sd.hinweise || [];
      if (starts.length || hints.length || sd.modellspeicher) {
        y += 8; ensure(20);
        doc.setFillColor(...RED); doc.rect(L, y - 4.5, R - L, 7, "F");
        set("Saira", "bold", 10.5, [255, 255, 255]); doc.text("VOR DEM EINSCHALTEN", L + 3, y + 0.4);
        y += 6;
        const items = starts.map(g => [String(g.kurz || g.nr), `${g.name}${bel[g.id].funktion ? " · " + bel[g.id].funktion : ""}`, (() => { const b = bel[g.id], t = (stOf(b).find(x => x.name === b.start) || {}).text; return b.start.toUpperCase() + (t ? " = " + t : ""); })()]);
        if (sd.modellspeicher) items.push(["M", `Modellspeicher „${sd.modellspeicher}“ wählen`, ""]);
        hints.forEach(h => items.push(["!", h, ""]));
        items.forEach(([n, t, r], i) => {
          set("Plex", "normal", 8.6); const tl = doc.splitTextToSize(t, 120); const h = tl.length * lh(8.6) + 2.6;
          ensure(h);
          if (i) { doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.line(L, y, R, y); }
          set("Saira", "bold", 8, [255, 255, 255]); const nw = Math.max(5.2, doc.getTextWidth(n) + 2.6);
          doc.setFillColor(...(n === "M" || n === "!" ? INK : RED)); doc.roundedRect(L + 0.4, y + 0.6, nw, 5.2, 2.6, 2.6, "F");
          set("Saira", "bold", 8, [255, 255, 255]); doc.text(n, L + 0.4 + nw / 2, y + 3.3, { align: "center", baseline: "middle" });
          set("Plex", "normal", 8.6); doc.text(tl, L + nw + 4, y + 4.1);
          if (r) { set("Saira", "bold", 9.5, RED); doc.text(r, R, y + 4.1, { align: "right" }); }
          y += h;
        });
        doc.setDrawColor(...RED); doc.setLineWidth(0.6); doc.line(L, y, R, y);
      }
      if (used.length) {
        const iw = 62, ih = iw * S.prof.hoehe / S.prof.breite;
        y += 8; ensure(Math.min(ih, 60) + 10);
        set("Saira", "normal", 11.5); doc.text("FERNSTEUERUNG · " + S.prof.name.toUpperCase(), L, y);
        doc.setDrawColor(...INK); doc.setLineWidth(0.6); doc.line(L, y + 2, R, y + 2); y += 5;
        if (y + ih > BOTTOM) { newPage(); }
        const top = y;
        if (S.img) {
          try {
            const i = await img(S.img), c = document.createElement("canvas"); c.width = S.prof.breite; c.height = S.prof.hoehe;
            const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(i, 0, 0, c.width, c.height);
            used.forEach(g => {
              const [tx, ty] = g.ziel, [lx, ly] = g.label || g.ziel;
              x.strokeStyle = "#D3202A"; x.lineWidth = 3; if (g.label) { x.beginPath(); x.moveTo(lx, ly); x.lineTo(tx, ty); x.stroke(); }
              x.fillStyle = "#D3202A"; x.strokeStyle = "#fff"; x.lineWidth = 3; const RR = Math.round(S.prof.breite * 0.028); const lt = String(g.kurz || g.nr), lw = Math.max(2 * RR, lt.length * RR * 1.15 * 0.56 + RR);
              x.beginPath(); if (x.roundRect) x.roundRect(lx - lw / 2, ly - RR, lw, 2 * RR, RR); else x.arc(lx, ly, RR, 0, 7); x.fill(); x.stroke();
              x.fillStyle = "#fff"; x.font = "800 " + Math.round(RR * 1.15) + "px 'Saira Condensed', Arial Narrow, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(lt, lx, ly + 1);
            });
            doc.addImage(c.toDataURL("image/jpeg", 0.88), "JPEG", L, top, iw, ih);
          } catch (e) {}
        }
        let ly2 = top + 3; const tx0 = L + iw + 8, tw = R - tx0 - 8;
        used.forEach((g, i) => {
          const b = bel[g.id];
          set("Plex", "normal", 8.6); const fl = doc.splitTextToSize(b.funktion, tw);
          const sub = [g.name];
          const stl = Array.isArray(b.stellungen) ? b.stellungen.filter(x => x && x.text) : ["oben", "unten"].filter(k => b[k]).map(k => ({ name: k, text: b[k] }));
          stl.forEach(x => sub.push(x.name + " = " + x.text + (b.start === x.name ? " (Start)" : "")));
          if (b.notiz) sub.push(b.notiz);
          set("Plex", "normal", 6.6); const sl = doc.splitTextToSize(sub.join(" · "), tw);
          const h = fl.length * lh(8.6) + sl.length * lh(6.6) + 2.4;
          if (ly2 + h > BOTTOM) { doc.addPage(); ly2 = 16; }
          if (i) { doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.line(tx0 - 1, ly2 - 2.6, R, ly2 - 2.6); }
          const bt = String(g.kurz || g.nr); set("Saira", "bold", 8, [255, 255, 255]); const bw = Math.max(5.2, doc.getTextWidth(bt) + 2.6);
          doc.setFillColor(...RED); doc.roundedRect(tx0, ly2 - 2.4, bw, 5.2, 2.6, 2.6, "F");
          doc.text(bt, tx0 + bw / 2, ly2 + 0.3, { align: "center", baseline: "middle" });
          set("Plex", "normal", 8.6); doc.text(fl, tx0 + bw + 3, ly2 + 1.2);
          set("Plex", "normal", 6.6, MUTED); doc.text(sl, tx0 + bw + 3, ly2 + 1.2 + fl.length * lh(8.6));
          ly2 += h + 1.6;
        });
        y = doc.getCurrentPageInfo().pageNumber === doc.getNumberOfPages() ? Math.max(top + ih, ly2) : ly2;
      }
    }

    // Weitere Fotos
    const extra = (m._fotoUrls || []).slice(1, 9);
    if (extra.length) {
      const s = (R - L - 3 * 4) / 4;
      y += 7; ensure(10 + s); set("Saira", "normal", 11.5); doc.text("WEITERE FOTOS", L, y);
      doc.setDrawColor(...INK); doc.setLineWidth(0.6); doc.line(L, y + 2, R, y + 2); y += 5;
      for (let i = 0; i < extra.length; i++) {
        if (i && i % 4 === 0) { y += s + 4; ensure(s); }
        try { doc.addImage(await crop(extra[i], s, s, 1.8), "JPEG", L + (i % 4) * (s + 4), y, s, s); } catch (e) {}
      }
      y += s;
    }

    // Videos als QR-Codes
    const vids = (m.videos || []).map(v => ({ url: vidUrl(v), titel: (v && v.titel) || "" })).filter(v => /^https:/.test(v.url));
    if (vids.length) {
      const q = 24, gap = 8;
      y += 8; ensure(q + 16); set("Saira", "normal", 11.5); doc.text("VIDEOS", L, y);
      doc.setDrawColor(...INK); doc.setLineWidth(0.6); doc.line(L, y + 2, R, y + 2); y += 5;
      vids.forEach((v, i) => {
        const per = Math.floor((R - L + gap) / (q + gap));
        if (i && i % per === 0) { y += q + 13; ensure(q + 12); }
        const x = L + (i % per) * (q + gap);
        const qr = qrcode(0, "M"); qr.addData(v.url); qr.make();
        const n = qr.getModuleCount(), c = q / n; doc.setFillColor(...INK);
        for (let r = 0; r < n; r++) for (let cc = 0; cc < n; cc++) if (qr.isDark(r, cc)) doc.rect(x + cc * c, y + r * c, c + 0.02, c + 0.02, "F");
        const src = /youtu/.test(v.url) ? "YOUTUBE" : /instagram/.test(v.url) ? "INSTAGRAM" : /tiktok/.test(v.url) ? "TIKTOK" : "VIDEO";
        set("Saira", "normal", 7.5, RED); doc.text(src, x + q / 2, y + q + 3.6, { align: "center" });
        set("Plex", "normal", 6.5); doc.text(doc.splitTextToSize(v.titel || "Video " + (i + 1), q + 4)[0], x + q / 2, y + q + 6.6, { align: "center" });
      });
      y += q + 8;
    }

    // Fußzeile
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p); set("Plex", "normal", 6.5, MUTED);
      doc.text(`FML Quartett · ${m.name} · Stand ${today}`, L, H - 8);
      doc.text(`Seite ${p}/${pages}`, R, H - 8, { align: "right" });
    }
    return doc.output("blob");
  }

  window.fmlPdf = { build };
})();
