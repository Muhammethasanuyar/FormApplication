// frontend/src/pages/FormsPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function FormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/forms`)
      .then(r => setForms(r.data || []))
      .catch(() => alert('Formlar yüklenemedi. Backend çalışıyor mu?'))
      .finally(() => setLoading(false));
  }, []);

  const del = async (fid) => {
    if (!confirm('Bu formu silmek istediğinize emin misiniz? (Geri alınamaz)')) return;
    await axios.delete(`${API}/api/forms/${fid}`);
    setForms(prev => prev.filter(f => f.id !== fid));
  };

  if (loading) {
    return (
      <main className="page">
        <div className="card"><h3>Yükleniyor…</h3></div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="card">
        <div className="card-head">
          <h2 style={{ margin: 0 }}>Formlar</h2>
          {/* Form oluştur/düzenle/paylaş butonları kaldırıldı */}
        </div>

        {forms.length === 0 ? (
          <p>Henüz kayıtlı form yok.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {forms.map(f => (
              <li
                key={f.id}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 10
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {f.name} <small className="text-muted">#{f.id}</small>
                    </div>
                    <small className="text-muted">
                      Oluşturulma: {new Date(f.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <div className="actions">
                    <Link className="btn" to={`/forms/${f.id}`}>
                      <i className="fa fa-eye" /> Görüntüle
                    </Link>
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
