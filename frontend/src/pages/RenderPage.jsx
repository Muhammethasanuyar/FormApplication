import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { ReactFormGenerator } from 'react-form-builder2'
import { createPortal } from 'react-dom'

// --- renk dropdown'unu DOM'da bul ---
function findFavControl(root, favName = 'fav_color') {
  let el =
    root.querySelector(`select[name="${favName}"], input[name="${favName}"]`) ||
    root.querySelector('.favorite-color select, .favorite-color input')

  if (!el) {
    const grp = Array.from(root.querySelectorAll('.form-group')).find((g) => {
      const t = (g.querySelector('label')?.textContent || '').toLowerCase().trim()
      return (
        t === 'sevdiğin renk' ||
        t === 'sevdigin renk' ||
        t === 'renk' ||
        t.includes('sevdi') ||
        t.includes('color') ||
        t.includes('renk')
      )
    })
    el = grp?.querySelector('select, input') || null
  }
  return el
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

/* ========== Tema yardımcıları ========== */
const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return null
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}
const mixWithWhite = (hex, p = 0.92) => {
  const rgb = hexToRgb(hex) || { r: 59, g: 130, b: 246 }
  const r = Math.round(rgb.r + (255 - rgb.r) * p)
  const g = Math.round(rgb.g + (255 - rgb.g) * p)
  const b = Math.round(rgb.b + (255 - rgb.b) * p)
  return `rgb(${r}, ${g}, ${b})`
}
const applyTheme = (hex) => {
  if (!/^#([A-Fa-f0-9]{6})$/.test(hex)) return
  const rgb = hexToRgb(hex) || { r: 59, g: 130, b: 246 }
  document.documentElement.style.setProperty('--brand', hex)
  document.documentElement.style.setProperty('--bg', mixWithWhite(hex, 0.92))
  document.documentElement.style.setProperty('--brand-weak', `rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`)
}

/* --- dropdown value <-> hex yardımcıları (YENİ) --- */
const getHex = (v = '') => String(v).split('|')[0]?.trim()
const slugify = (s = '') =>
  s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
const makeVal = (hex, name) => `${hex}|${slugify(name || 'renk')}`

/* ========== Options/Schema normalize ========== */
const sanitizeOptions = (opts = []) => {
  let normalized = (opts || [])
    .map((o, i) => {
      if (typeof o === 'string') return { text: o, value: o }
      const text = (o.text ?? o.label ?? o.value ?? `Seçenek ${i + 1}`).toString().trim()
      let value = (o.value ?? o.key ?? text).toString().trim()
      if (!value) value = `opt_${i}`
      return { text, value }
    })
    .filter((o) => o && o.value)

  const seen = new Set()
  normalized = normalized.map((o) => {
    let v = o.value
    if (seen.has(v)) {
      let c = 2
      while (seen.has(`${v}_${c}`)) c++
      v = `${v}_${c}`
    }
    seen.add(v)
    return { ...o, value: v }
  })
  return normalized
}

const sanitizeSchema = (list = []) =>
  list.map((f) => (Array.isArray(f.options) ? { ...f, options: sanitizeOptions(f.options) } : f))

/* ========== Renk Paleti ========== */
function ColorPalette({ colors, value, onPick, inline = false }) {
  const body = (
    <div className={`color-grid${inline ? ' inline' : ''}`}>
      {colors.map((c) => {
        const active = value?.toLowerCase() === c.value.toLowerCase()
        return (
          <button
            key={c.value}
            type="button"
            className={`color-swatch${active ? ' selected' : ''}`}
            onClick={() => onPick(c.value)}
            title={c.text || c.name}
          >
            <span className="color-box" style={{ background: c.value }} />
            <span className="color-name">{c.text || c.name}</span>
          </button>
        )
      })}
    </div>
  )
  if (inline) return body
  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div className="card-head">
        <h3 style={{ margin: 0, fontSize: 16 }}>Renk Seçimi</h3>
      </div>
      {body}
    </div>
  )
}

/* ========== Cevapları normalize et ========== */
const normalizeToArray = (answers) => {
  if (Array.isArray(answers)) return answers
  if (answers && typeof answers === 'object') {
    return Object.entries(answers).map(([name, value]) => ({ name, value }))
  }
  return []
}

/* ===================================================================== */

export default function RenderPage() {
  const { id } = useParams()

  // Adım 1
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  // RFB + renkler
  const [form, setForm] = useState(null)
  const [colors, setColors] = useState([])
  const [pickedColor, setPickedColor] = useState('')
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  // Koşullu alanlar
  const [employment, setEmployment] = useState('') // 'work' | 'student' | 'none'
  const [occupation, setOccupation] = useState('')
  const [university, setUniversity] = useState('')

  const generatorRef = useRef(null)
  const [paletteMount, setPaletteMount] = useState(null)
  const favName = 'fav_color'

  const idCounterRef = useRef(0)

  /* ---- Verileri çek ---- */
  useEffect(() => {
    let mounted = true
    setLoading(true)
    setErr('')
    Promise.all([axios.get(`${API}/api/forms/${id}`), axios.get(`${API}/api/colors`)])
      .then(([f, c]) => {
        if (!mounted) return
        setForm(f.data)
        setColors((c.data || []).map((x) => ({ text: x.text || x.name, value: x.value })))
      })
      .catch((e) => {
        console.error(e)
        mounted && setErr('Form veya renkler yüklenemedi.')
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [id])

  /* ---- Schema patch (renk options + Hobiler çoklu seçim) ---- */
  const schema = useMemo(() => {
    if (!form) return []

    const base = Array.isArray(form.schema)
      ? form.schema
      : (typeof form.schema === 'string'
          ? JSON.parse(form.schema || '[]')
          : (form.schema?.data || []))

    if (!base?.length) return base
    const list = JSON.parse(JSON.stringify(base))

    // (YENİ) Aynı HEX'e sahip farklı isimleri de koruyarak birleştir
    const mergeByHexKeepNames = (a = [], b = []) => {
      const norm = (arr) => sanitizeOptions(arr).map(o => ({ text: o.text, value: o.value }))
      const out = []
      const seenNameVal = new Set()
      const hexNames = new Map() // hex -> Set(names)

      ;[...norm(a), ...norm(b)].forEach(opt => {
        const hex = getHex(opt.value)
        if (!/^#([A-Fa-f0-9]{6})$/.test(hex)) return
        const name = opt.text || 'Renk'

        let val = hex
        if (hexNames.has(hex)) {
          const names = hexNames.get(hex)
          if (!names.has(name)) {
            val = makeVal(hex, name) // benzersiz value: "#xxxxxx|ad"
            names.add(name)
          }
        } else {
          hexNames.set(hex, new Set([name]))
        }

        const key = `${name}|${val}`
        if (!seenNameVal.has(key)) {
          seenNameVal.add(key)
          out.push({ text: name, value: val })
        }
      })
      return out
    }

    // 1) Renk alanını doldur/merge et
    const colorIdx = list.findIndex(f =>
      (f.field_name && String(f.field_name).toLowerCase() === 'fav_color') ||
      (f.class_name && String(f.class_name).includes('favorite-color')) ||
      /favorite.*color|color|renk/i.test(f.field_name || '') ||
      /renk/i.test(f.label || '')
    )
    if (colorIdx >= 0) {
      const existing = list[colorIdx].options || []
      const fromApi  = (colors || []).map(c => ({ text: c.text || c.name, value: c.value }))
      list[colorIdx].options = mergeByHexKeepNames(existing, fromApi)
    }

    // 2) Hobi → çoklu (Checkboxes)
    const hIdx = list.findIndex(f => {
      const fn = String(f.field_name || '').toLowerCase()
      const lb = String(f.label || '').toLowerCase()
      return /hobi|hobby|hobiler|hobbies/.test(fn) || /hobi|hobby|hobiler|hobbies/.test(lb)
    })
    if (hIdx >= 0) {
      list[hIdx].element = 'Checkboxes'
      list[hIdx].options = sanitizeOptions(list[hIdx].options || [])
      if (String(list[hIdx].field_name || '').toLowerCase() === 'hobby') list[hIdx].field_name = 'hobbies'
      if (!list[hIdx].label || /hobi|hobby/i.test(list[hIdx].label)) list[hIdx].label = 'Hobiler'
    }

    return sanitizeSchema(list)
  }, [form, colors])

  /* ---- Renk dropdown’unu bul, ALTINA slot yerleştir ---- */
  useEffect(() => {
    const root = generatorRef.current || document

    const placeSlot = () => {
      const el = findFavControl(root, 'fav_color')
      if (!el) { setPaletteMount(null); return }

      const group = el.closest('.form-group') || el.parentElement
      if (!group) { setPaletteMount(null); return }

      let slot = group.parentElement?.querySelector(':scope > .color-palette-slot')
      if (!slot) {
        slot = document.createElement('div')
        slot.className = 'color-palette-slot'
        if (group.nextSibling) group.parentElement.insertBefore(slot, group.nextSibling)
        else group.parentElement.appendChild(slot)
      }
      setPaletteMount(slot)

      // (DEĞİŞTİ) value "#hex|slug" olabilir → sadece HEX'i uygula
      if (el.value) { const hx = getHex(el.value); setPickedColor(hx); applyTheme(hx) }

      const onChange = (e) => {
        const hx = getHex(e.target.value)
        setPickedColor(hx)
        applyTheme(hx)
      }
      el.addEventListener('change', onChange)
      return () => el.removeEventListener('change', onChange)
    }

    let cleanup = placeSlot()
    const mo = new MutationObserver(() => { cleanup && cleanup(); cleanup = placeSlot() })
    const host = generatorRef.current
    if (host) mo.observe(host, { childList: true, subtree: true })
    return () => { mo.disconnect(); cleanup && cleanup() }
  }, [schema, step])

  // ---- Checkbox/Radio: id/label bağla (benzersiz) ----
  
  useEffect(() => {
    const root = generatorRef.current
    if (!root) return

    const wire = () => {
      const items = root.querySelectorAll(
        '.custom-control.custom-checkbox, .custom-control.custom-radio, .checkbox, .radio'
      )
      const used = new Set()

      items.forEach((box) => {
        const input = box.querySelector('input[type="checkbox"],input[type="radio"]')
        const label =
          box.querySelector('label.custom-control-label') || box.querySelector('label')
        if (!input || !label) return

        if (!input.id || used.has(input.id)) {
          input.id = `rfb-opt-${++idCounterRef.current}`
        }
        used.add(input.id)
        if (label.getAttribute('for') !== input.id) {
          label.setAttribute('for', input.id)
        }
      })
    }

    wire()
    const mo = new MutationObserver(wire)
    mo.observe(root, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [schema, step])

  // ---- Label tıklamasını doğru input’a yönlendir ----
  useEffect(() => {
    const root = generatorRef.current
    if (!root) return

    const onLabelClickCapture = (e) => {
      const lbl = e.target.closest('label')
      if (!lbl) return
      const box = lbl.closest(
        '.custom-control.custom-checkbox, .custom-control.custom-radio, .checkbox, .radio'
      )
      if (!box || !root.contains(box)) return

      const input = box.querySelector('input[type="checkbox"],input[type="radio"]')
      if (!input || input.disabled) return

      e.preventDefault()
      e.stopPropagation()
      if (input.type === 'checkbox') input.checked = !input.checked
      else input.checked = true
      input.dispatchEvent(new Event('input',  { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }

    root.addEventListener('click', onLabelClickCapture, true)
    return () => root.removeEventListener('click', onLabelClickCapture, true)
  }, [schema, step])

  // ---- Kartın tamamına tıkla → input toggle ----
  useEffect(() => {
    const root = generatorRef.current
    if (!root) return

    const onTileClick = (e) => {
      if (e.target.matches('input[type="checkbox"],input[type="radio"]')) return
      const box = e.target.closest(
        '.custom-control.custom-checkbox, .custom-control.custom-radio, .checkbox, .radio'
      )
      if (!box || !root.contains(box)) return

      const input = box.querySelector('input[type="checkbox"],input[type="radio"]')
      if (!input || input.disabled) return

      if (input.type === 'checkbox') input.checked = !input.checked
      else input.checked = true
      input.dispatchEvent(new Event('input',  { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }

    root.addEventListener('click', onTileClick)
    return () => root.removeEventListener('click', onTileClick)
  }, [schema, step])

  /* ---- Palette tıklandığında dropdown’u da güncelle ---- */
  const handlePick = (hex) => {
    const root = generatorRef.current || document
    const el = findFavControl(root, 'fav_color')
    setPickedColor(hex)
    applyTheme(hex)
    if (!el) return

    if (el.tagName === 'SELECT') {
      // Seçeneği HEX'e göre bul (#xxxxxx veya #xxxxxx|slug)
      const opts = Array.from(el.options)
      let opt = opts.find((o) => getHex(o.value).toLowerCase() === hex.toLowerCase())
      if (!opt) {
        const label = (colors.find(c => c.value.toLowerCase() === hex.toLowerCase())?.text) || hex
        const val = makeVal(hex, label)
        opt = new Option(label, val, true, true)
        el.add(opt)
        el.value = val
      } else {
        el.value = opt.value
        opt.selected = true
      }
    } else {
      el.value = hex
    }

    // RFB state’ini güncelle
    el.dispatchEvent(new Event('input',  { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
    setTimeout(() => el.dispatchEvent(new Event('blur', { bubbles: true })), 0)
  }

  /* ---- Meslek & Üniversite listeleri ---- */
  const JOBS = [
    'Yazılım Geliştirici','Veri Analisti','Tasarımcı','Ürün Yöneticisi','Satış Uzmanı','Öğretmen',
    'Doktor','Hemşire','Makine Mühendisi','Elektrik Mühendisi','Muhasebeci','Pazarlama Uzmanı',
    'Avukat','Mimar','İK Uzmanı','Operasyon Uzmanı','Destek Uzmanı','Teknisyen','Şoför','Esnaf'
  ]
  const UNIVERSITIES = [
    'İstanbul Üniversitesi','İstanbul Teknik Üniversitesi','Boğaziçi Üniversitesi','Yıldız Teknik Üniversitesi',
    'Marmara Üniversitesi','Galatasaray Üniversitesi','Koç Üniversitesi','Sabancı Üniversitesi','Bilkent Üniversitesi',
    'ODTÜ','Hacettepe Üniversitesi','Ankara Üniversitesi','Ege Üniversitesi','Dokuz Eylül Üniversitesi',
    'Gebze Teknik Üniversitesi','Sakarya Üniversitesi','Uludağ Üniversitesi','Karadeniz Teknik Üniversitesi',
    'Atatürk Üniversitesi','Çukurova Üniversitesi','Akdeniz Üniversitesi','İnönü Üniversitesi'
  ]

  /* ---- Submit ---- */
  const onSubmit = async (answers) => {
    try {
      const arr = normalizeToArray(answers)

      // Email’i bul ve doğrula (UI required’a ek güvenlik katmanı)
      const email = (arr.find(a => String(a.name || '').toLowerCase().includes('mail')) || {}).value
      const emailOk = typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      if (!emailOk) {
        alert('Lütfen geçerli bir e-posta adresi girin.')
        return
      }

      const extra = [
        { name: 'first_name', value: firstName || null },
        { name: 'last_name', value: lastName || null },
        { name: 'favorite_color', value: pickedColor || null },
        { name: 'employment_status', value: employment || null },
        employment === 'work' ? { name: 'occupation', value: occupation || null } : null,
        employment === 'student' ? { name: 'university', value: university || null } : null
      ].filter(Boolean)

      const payload = JSON.parse(JSON.stringify([...arr, ...extra]))
      await axios.post(`${API}/api/forms/${id}/submissions`, { payload })
      setOk(true)
    } catch (e) {
      console.error('SUBMIT ERROR →', e)
      alert(e?.response?.data?.message || 'Gönderim hatası (500). Sunucu loglarını kontrol edin.')
    }
  }

  /* ---- UI durumları ---- */
  if (loading)
    return (
      <div className="center-wrap">
        <div className="card form-card">
          <div className="card-head"><h3>Yükleniyor…</h3></div>
        </div>
      </div>
    )
  if (err)
    return (
      <div className="center-wrap">
        <div className="card form-card">
          <div className="card-head"><h3>Hata</h3></div>
          <p>{err}</p>
        </div>
      </div>
    )
  if (!form)
    return (
      <div className="center-wrap">
        <div className="card form-card">
          <div className="card-head"><h3>Form bulunamadı</h3></div>
        </div>
      </div>
    )

  if (ok) {
    return (
      <div className="center-wrap">
        <section className="card form-card" style={{ textAlign: 'center' }}>
          <div className="success-ico"><i className="fa fa-check-circle" /></div>
          <h2>Başarıyla gönderildi</h2>
          <p>{firstName || lastName ? `Teşekkürler ${firstName} ${lastName}! ` : ''}Zaman ayırdığınız için teşekkürler.</p>
          <p>Hoşça kalın</p>
        </section>
      </div>
    )
  }

  const canContinue = firstName.trim().length > 1 && lastName.trim().length > 1

  return (
    <div className="center-wrap render-center">
      <section className="card form-card">
        <div className="card-head">
          <h2>{form?.name || `Form #${id}`}</h2>
        </div>

        {step === 1 ? (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Temel Bilgiler</h3>
            <div className="form-group">
              <label>Ad</label>
              <input className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Adınız" />
            </div>
            <div className="form-group">
              <label>Soyad</label>
              <input className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Soyadınız" />
            </div>
            <div className="actions" style={{ marginTop: 8 }}>
              <button className="btn primary" disabled={!canContinue} onClick={() => setStep(2)}>
                <i className="fa fa-arrow-right" /> İlerle
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <i className="fa fa-smile-o" style={{ fontSize: 28, color: 'var(--brand)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>
                    Hoş geldin, {firstName} {lastName}!
                  </div>
                  <div className="text-muted" style={{ fontSize: 13 }} />
                </div>
              </div>
            </div>

            {/* Çalışma durumu (koşullu) */}
            <div className="card">
              <h4 style={{ marginTop: 0 }}>Çalışıyor musunuz?</h4>
              <div className="inline-fields">
                <label className="f-radio">
                  <input type="radio" name="emp" value="work" checked={employment === 'work'}
                    onChange={() => { setEmployment('work'); setUniversity('') }} />
                  <span>Çalışıyorum</span>
                </label>

                <label className="f-radio">
                  <input type="radio" name="emp" value="student" checked={employment === 'student'}
                    onChange={() => { setEmployment('student'); setOccupation('') }} />
                  <span>Öğrenciyim</span>
                </label>

                <label className="f-radio">
                  <input type="radio" name="emp" value="none" checked={employment === 'none'}
                    onChange={() => { setEmployment('none'); setOccupation(''); setUniversity('') }} />
                  <span>Çalışmıyorum</span>
                </label>
              </div>

              {employment === 'work' && (
                <div className="form-group" style={{ marginTop: 10 }}>
                  <label>Meslek</label>
                  <select className="form-control" value={occupation} onChange={(e) => setOccupation(e.target.value)}>
                    <option value="">Seçiniz</option>
                    {JOBS.map((j) => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
              )}

              {employment === 'student' && (
                <div className="form-group" style={{ marginTop: 10 }}>
                  <label>Üniversite</label>
                  <select className="form-control" value={university} onChange={(e) => setUniversity(e.target.value)}>
                    <option value="">Seçiniz</option>
                    {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Fallback: dropdown bulunamazsa paleti burada göster */}
            {!paletteMount && <ColorPalette colors={colors} value={pickedColor} onPick={handlePick} />}

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
              <button className="btn" onClick={() => setStep(1)}>
                <i className="fa fa-arrow-left" /> Geri
              </button>
            </div>
          </>
        )}
      </section>

      {/* Paleti dropdown’un ALTINA sabitle (Portal) */}
      {step === 2 && paletteMount && createPortal(
        <ColorPalette colors={colors} value={pickedColor} onPick={handlePick} inline />,
        paletteMount
      )}
    </div>
  )
}
