import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function FormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    axios.get(`${API}/api/forms`)
      .then(r => setForms(r.data || []))
      .catch(() => alert('Formlar yüklenemedi. Backend çalışıyor mu?'))
      .finally(() => setLoading(false));
  }, []);

  const createSample = async () => {
    const sampleSchema = [
      { element: 'Header', text: 'İletişim Bilgileri', static: true },
      { element: 'EmailInput', label: 'E-Posta', field_name: 'email' },
      { element: 'TextInput', label: 'Yaş', field_name: 'age' },
      { element: 'Dropdown', label: 'Şehir', field_name: 'city', options: [], dataUrl: `${API}/api/cities` },
      { element: 'Dropdown', label: 'Sevdiğin Renk', field_name: 'fav_color', class_name: 'favorite-color', options: [], dataUrl: `${API}/api/colors` },
      { element: 'RadioButtons', label: 'Favori Hobi', field_name: 'hobby', options: [
        { text: 'Spor', value: 'spor' }, { text: 'Müzik', value: 'muzik' }, { text: 'Oyun', value: 'oyun' },
      ]},
      { element: 'TextArea', label: 'Kendini kısaca anlat', field_name: 'about' },
    ];
    const r = await axios.post(`${API}/api/forms`, { name: 'Örnek Form', schema: sampleSchema });
    nav(`/forms/${r.data.id}`); // doğrudan kullanıcı görünümüne gidelim
  };

  const del = async (fid) => {
    if (!confirm('Bu formu silmek istediğinize emin misiniz? (Geri alınamaz)')) return;
    await axios.delete(`${API}/api/forms/${fid}`);
    setForms(prev => prev.filter(f => f.id !== fid));
  };

  if (loading) return <main className="page"><div className="card"><h3>Yükleniyor…</h3></div></main>;

  return (
    <main className="page">
      <div className="card">
        <div className="card-head">
          <h2 style={{margin:0}}>Formlar</h2>
          <div className="actions">
            <button className="btn primary" onClick={createSample}>
              <i className="fa fa-plus" /> Örnek Form Oluştur
            </button>
          </div>
        </div>

        {forms.length === 0 ? (
          <p>Henüz form yok. “Örnek Form Oluştur”a bas.</p>
        ) : (
          <ul style={{ listStyle:'none', padding:0, margin:0 }}>
            {forms.map(f => (
              <li key={f.id} style={{ border:'1px solid var(--line)', borderRadius:12, padding:12, marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                  <div>
                    <div style={{ fontWeight:700 }}>{f.name} <small className="text-muted">#{f.id}</small></div>
                    <small className="text-muted">Oluştur: {new Date(f.createdAt).toLocaleString()}</small>
                  </div>
                  <div className="actions">
                    <Link className="btn" to={`/forms/${f.id}`}><i className="fa fa-eye" /> Görüntüle</Link>
                    {/* Düzenle & Paylaş yok */}
                    <button className="btn danger" onClick={() => del(f.id)}>
                      <i className="fa fa-trash" /> Sil
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
