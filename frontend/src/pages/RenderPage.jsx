import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ReactFormGenerator } from 'react-form-builder2';
import { createPortal } from 'react-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/* ---- Tema yardımcıları ---- */
const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  return { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) };
};
const mixWithWhite = (hex, p = 0.9) => {
  const rgb = hexToRgb(hex) || { r:59,g:130,b:246 };
  const r = Math.round(rgb.r + (255 - rgb.r) * p);
  const g = Math.round(rgb.g + (255 - rgb.g) * p);
  const b = Math.round(rgb.b + (255 - rgb.b) * p);
  return `rgb(${r}, ${g}, ${b})`;
};
const applyTheme = (hex) => {
  if (!/^#([A-Fa-f0-9]{6})$/.test(hex)) return;
  const rgb = hexToRgb(hex) || { r:59,g:130,b:246 };
  const bg  = mixWithWhite(hex, 0.92);
  document.documentElement.style.setProperty('--brand', hex);
  document.documentElement.style.setProperty('--bg', bg);
  document.documentElement.style.setProperty('--brand-weak', `rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`);
};

/* ---- Renk paleti ---- */
function ColorPalette({ colors, value, onPick, inline = false }) {
  const body = (
    <div className={`color-grid${inline ? ' inline' : ''}`}>
      {colors.map(c => {
        const active = (value || '').toLowerCase() === c.value.toLowerCase();
        return (
          <button
            key={c.value}
            type="button"
            className={`color-swatch${active ? ' selected' : ''}`}
            onClick={() => onPick(c.value)}
            title={c.name}
          >
            <span className="color-box" style={{ background: c.value }} />
            <span className="color-name">{c.name}</span>
          </button>
        );
      })}
    </div>
  );
  if (inline) return body;
  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div className="card-head"><h3 style={{margin:0,fontSize:16}}>Renk Seçimi</h3></div>
      {body}
    </div>
  );
}

/* ---- Options sanitize ---- */
const sanitizeOptions = (opts = []) => {
  let normalized = opts.map((o, i) => {
    if (typeof o === 'string') return { text: o, value: o };
    const text  = (o.text ?? o.label ?? o.value ?? `Seçenek ${i+1}`).toString().trim();
    let value   = (o.value ?? o.key ?? text).toString().trim();
    if (!value) value = `opt_${i}`;
    return { ...o, text, value };
  }).filter(o => o && o.value);

  const seen = new Set();
  normalized = normalized.map((o) => {
    let v = o.value;
    if (seen.has(v)) {
      let c = 2;
      while (seen.has(`${v}_${c}`)) c++;
      v = `${o.value}_${c}`;
    }
    seen.add(v);
    return { ...o, value: v };
  });

  return normalized;
};
const sanitizeSchema = (list = []) => list.map(f => {
  if (Array.isArray(f.options)) return { ...f, options: sanitizeOptions(f.options) };
  return f;
});

export default function RenderPage() {
  const { id } = useParams();

  // adım 1
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');

  const [form, setForm] = useState(null);
  const [colors, setColors] = useState([]);
  const [pickedColor, setPickedColor] = useState('');
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // koşullu alanlar
  const [employment, setEmployment] = useState(''); // work | student | none
  const [occupation, setOccupation] = useState('');
  const [university, setUniversity] = useState('');

  const generatorRef = useRef(null);
  const [paletteMount, setPaletteMount] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true); setErr('');
    Promise.all([
      axios.get(`${API}/api/forms/${id}`),
      axios.get(`${API}/api/colors`)
    ])
      .then(([f, c]) => {
        if (!mounted) return;
        setForm(f.data);
        setColors((c.data || []).map(x => ({ name: x.text || x.name, value: x.value })));
      })
      .catch(e => { console.error(e); mounted && setErr('Form veya renkler yüklenemedi.'); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  const schema = useMemo(() => {
    if (!form) return [];
    const base = Array.isArray(form.schema)
      ? form.schema
      : (typeof form.schema === 'string' ? (JSON.parse(form.schema || '[]')) : (form.schema?.data || []));
    if (!base?.length) return base;

    const list = JSON.parse(JSON.stringify(base));

    if (colors?.length) {
      const idx = list.findIndex(f =>
        (f.class_name && String(f.class_name).includes('favorite-color')) ||
        /favorite.*color|color/i.test(f.field_name || '') ||
        /renk/i.test(f.label || '')
      );
      if (idx >= 0) list[idx].options = colors.map(c => ({ text: c.name, value: c.value }));
    }

    return sanitizeSchema(list);
  }, [form, colors]);

  useEffect(() => {
    const root = generatorRef.current || document;

    const byClass = root.querySelector('.favorite-color select, .favorite-color input');
    const byName  = root.querySelector('select[name*="color" i], input[name*="color" i], select[name*="favorite" i], input[name*="favorite" i]');
    const byLabel = Array.from(root.querySelectorAll('.form-group')).find(g => {
      const t = (g.querySelector('label')?.textContent || '').toLowerCase().trim();
      return t.includes('sevdiğin renk') || t.includes('sevdigin renk') || t === 'renk' || t.includes('renk');
    })?.querySelector('select, input');

    const el = byClass || byLabel || byName;
    if (!el) { setPaletteMount(null); return; }

    const group = el.closest('.form-group') || el.parentElement;
    if (!group) { setPaletteMount(null); return; }

    let slot = group.parentElement?.querySelector('.color-palette-slot');
    if (!slot) {
      slot = document.createElement('div');
      slot.className = 'color-palette-slot';
      if (group.nextSibling) group.parentElement.insertBefore(slot, group.nextSibling);
      else group.parentElement.appendChild(slot);
    }
    setPaletteMount(slot);

    if (el.value) { setPickedColor(el.value); applyTheme(el.value); }
    const onChange = (e) => { setPickedColor(e.target.value); applyTheme(e.target.value); };
    el.addEventListener('change', onChange);
    return () => el.removeEventListener('change', onChange);
  }, [schema, step]);

  const handlePick = (hex) => {
    const root = generatorRef.current || document;
    const el = root.querySelector('.favorite-color select, .favorite-color input') ||
               root.querySelector('select[name*="color" i], input[name*="color" i], select[name*="favorite" i], input[name*="favorite" i]') ||
               Array.from(root.querySelectorAll('.form-group')).find(g => {
                 const t = (g.querySelector('label')?.textContent || '').toLowerCase().trim();
                 return t.includes('sevdiğin renk') || t.includes('sevdigin renk') || t.includes('renk');
               })?.querySelector('select, input');

    setPickedColor(hex);
    applyTheme(hex);
    if (el) {
      el.value = hex;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const JOBS = ['Yazılım Geliştirici','Veri Analisti','Tasarımcı','Ürün Yöneticisi','Satış Uzmanı','Öğretmen',
                'Doktor','Hemşire','Makine Mühendisi','Elektrik Mühendisi','Muhasebeci','Pazarlama Uzmanı',
                'Avukat','Mimar','İK Uzmanı','Operasyon Uzmanı','Destek Uzmanı','Teknisyen','Şoför','Esnaf'];
  const UNIVERSITIES = [
    "İstanbul Üniversitesi","İTÜ","Boğaziçi","Yıldız Teknik","Marmara","Galatasaray",
    "ODTÜ","Hacettepe","Ankara","Gazi","Ege","Dokuz Eylül","Karadeniz Teknik","Uludağ",
    "Selçuk","Erciyes","Anadolu","Cumhuriyet","Akdeniz","Çukurova","Fırat","İnönü","Mersin",
    "Bilkent","Koç","Sabancı","Başkent","Özyeğin","Bahçeşehir","Yeditepe","Medipol"
  ];

  const normalizeToArray = (answers) => {
    if (Array.isArray(answers)) return answers;
    if (answers && typeof answers === 'object') {
      return Object.entries(answers).map(([name, value]) => ({ name, value }));
    }
    return [];
  };

  const onSubmit = async (answers) => {
    try {
      const arr = normalizeToArray(answers);
      const extra = [
        { name: 'employment_status', value: employment || null },
        employment === 'work'    ? { name: 'occupation', value: occupation || null } : null,
        employment === 'student' ? { name: 'university', value: university || null } : null,
        { name: 'favorite_color', value: pickedColor || null },
      ].filter(Boolean);

      const cleaned = JSON.parse(JSON.stringify([...arr, ...extra]));
      await axios.post(`${API}/api/forms/${id}/submissions`, {
        formId: Number(id),
        name: `${firstName} ${lastName}`.trim() || null,
        data: cleaned
      });
      setOk(true);
    } catch (e) {
      console.error('SUBMIT ERROR →', e);
      alert(e?.response?.data?.message || 'Gönderim hatası');
    }
  };

  if (loading) return <div className="center-wrap"><div className="card form-card"><div className="card-head"><h3>Yükleniyor…</h3></div></div></div>;
  if (err)     return <div className="center-wrap"><div className="card form-card"><div className="card-head"><h3>Hata</h3></div><p>{err}</p></div></div>;
  if (!form)   return <div className="center-wrap"><div className="card form-card"><div className="card-head"><h3>Form bulunamadı</h3></div></div></div>;

  if (ok) {
    return (
      <div className="center-wrap">
        <section className="card form-card" style={{ textAlign:'center' }}>
          <div className="success-ico"><i className="fa fa-check-circle" /></div>
          <h2>Başarıyla gönderildi 🎉</h2>
          <p>{(firstName || lastName) ? `Teşekkürler ${firstName} ${lastName}! ` : ''}Verilerini aldık.</p>
          <p>Hoşçakal, güzel günlerde görüşmek üzere! 👋</p>
        </section>
      </div>
    );
  }

  const canContinue = firstName.trim().length > 1 && lastName.trim().length > 1;

  return (
    <div className="center-wrap render-center">
      <section className="card form-card">
        <div className="card-head"><h2>{form?.name || `Form #${id}`}</h2></div>

        {step === 1 ? (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Adım 1 — Temel Bilgiler</h3>
            <div className="form-group">
              <label>Ad</label>
              <input className="form-control" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Adınız" />
            </div>
            <div className="form-group">
              <label>Soyad</label>
              <input className="form-control" value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Soyadınız" />
            </div>
            <div className="actions" style={{ marginTop: 8 }}>
              <button className="btn primary" disabled={!canContinue} onClick={()=>setStep(2)}>
                <i className="fa fa-arrow-right" /> İlerle
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="card">
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <i className="fa fa-smile-o" style={{ fontSize:28, color:"var(--brand)" }} />
                <div>
                  <div style={{ fontWeight:700, fontSize:18 }}>
                    Hoş geldin, {firstName} {lastName}!
                  </div>
                  <div className="text-muted" style={{ fontSize:13 }}>
                    Aşağıdaki formu tamamla. “Sevdiğin Renk” seçildiğinde tema otomatik uyarlanır.
                  </div>
                </div>
              </div>
            </div>

            {/* Çalışma durumu */}
            <div className="card">
              <h4 style={{ marginTop: 0 }}>Çalışıyor musunuz?</h4>
              <div className="inline-fields">
                <label className="f-radio">
                  <input type="radio" name="emp" value="work"
                         checked={employment === 'work'}
                         onChange={() => { setEmployment('work'); setUniversity(''); }} />
                  <span>Çalışıyorum</span>
                </label>
                <label className="f-radio">
                  <input type="radio" name="emp" value="student"
                         checked={employment === 'student'}
                         onChange={() => { setEmployment('student'); setOccupation(''); }} />
                  <span>Öğrenciyim</span>
                </label>
                <label className="f-radio">
                  <input type="radio" name="emp" value="none"
                         checked={employment === 'none'}
                         onChange={() => { setEmployment('none'); setOccupation(''); setUniversity(''); }} />
                  <span>Çalışmıyorum</span>
                </label>
              </div>

              {employment === 'work' && (
                <div className="form-group" style={{ marginTop: 10 }}>
                  <label>Meslek</label>
                  <select className="form-control" value={occupation} onChange={e=>setOccupation(e.target.value)}>
                    <option value="">Seçiniz</option>
                    {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
              )}

              {employment === 'student' && (
                <div className="form-group" style={{ marginTop: 10 }}>
                  <label>Üniversite</label>
                  <select className="form-control" value={university} onChange={e=>setUniversity(e.target.value)}>
                    <option value="">Seçiniz</option>
                    {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Renk paleti fallback */}
            {!paletteMount && (
              <ColorPalette colors={colors} value={pickedColor} onPick={handlePick} />
            )}

            <div className="generator-wrap" ref={generatorRef}>
              <ReactFormGenerator
                key={`form-${id}-${schema.length}`}
                data={schema}
                onSubmit={onSubmit}
                submitButton={
                  <button className="btn primary" type="submit">
                    <i className="fa fa-send" /> Gönder
                  </button>
                }
              />
            </div>

            <div className="actions" style={{ marginTop: 10 }}>
              <button className="btn" onClick={()=>setStep(1)}><i className="fa fa-arrow-left" /> Geri</button>
            </div>
          </>
        )}
      </section>

      {step === 2 && paletteMount && createPortal(
        <ColorPalette colors={colors} value={pickedColor} onPick={handlePick} inline />,
        paletteMount
      )}
    </div>
  );
}
