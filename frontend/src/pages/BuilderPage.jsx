import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ReactFormBuilder } from "react-form-builder2";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

function normalizeBuilderData(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.task_data) return data.task_data;
  if (data.data && Array.isArray(data.data)) return data.data;
  return [];
}

export default function BuilderPage() {
  const [formName, setFormName] = useState("");
  const [schema, setSchema] = useState([]);
  const [forms, setForms] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);

  // YENİ: toolbox görünür/gizli durumu
  const [dockOpen, setDockOpen] = useState(true);

  const pretty = useMemo(() => JSON.stringify(schema, null, 2), [schema]);

  const fetchForms = async () => {
    try {
      const { data } = await axios.get(`${API}/api/forms`);
      setForms(data || []);
    } catch (e) {
      console.error(e);
      alert("Form listesi alınamadı. Backend çalışıyor mu?");
    }
  };

  useEffect(() => { fetchForms(); }, []);

  const handleNew = () => { setFormName(""); setSchema([]); setSelectedId(""); };

  const handleSave = async () => {
    const name = formName?.trim();
    if (!name) return alert("Lütfen form adı gir.");
    try {
      setLoading(true);
      await axios.post(`${API}/api/forms`, { name, schema });
      await fetchForms();
      alert("Kaydedildi.");
    } finally { setLoading(false); }
  };

  const handleLoad = async () => {
    if (!selectedId) return alert("Listeden bir form seç.");
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/forms/${selectedId}`);
      setFormName(data?.name || "");
      setSchema(data?.schema || []);
      alert("Yüklendi.");
    } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    const id = selectedId;
    if (!id) return alert("Güncellenecek formu listeden seç.");
    const name = formName?.trim();
    if (!name) return alert("Form adı boş olamaz.");
    try {
      setLoading(true);
      await axios.put(`${API}/api/forms/${id}`, { name, schema });
      await fetchForms();
      alert("Güncellendi.");
    } finally { setLoading(false); }
  };

  return (
    <section className="card">
      <div className="card-head">
        <h2>Form Oluştur (react-form-builder2)</h2>
        <div className="actions">
          {/* YENİ: toolbox gizle/göster */}
          <button className="btn" onClick={() => setDockOpen(o => !o)}>
            <i className="fa fa-wrench" /> {dockOpen ? "Araçları Gizle" : "Araçları Göster"}
          </button>

          <button className="btn ghost" onClick={handleNew} disabled={loading}>
            <i className="fa fa-file-o" /> Yeni
          </button>
          <button className="btn primary" onClick={handleSave} disabled={loading}>
            <i className="fa fa-save" /> Kaydet
          </button>
          <button className="btn" onClick={handleUpdate} disabled={loading || !selectedId}>
            <i className="fa fa-refresh" /> Güncelle
          </button>
          <button className="btn" onClick={() => setShowJson(s => !s)}>
            <i className="fa fa-code" /> {showJson ? "JSON’u Gizle" : "JSON’u Göster"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 12, marginBottom: 12 }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label>Form Adı</label>
          <input
            className="form-control"
            placeholder="Örn: Kullanıcı Bilgileri"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
          <select
            className="form-control"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            title="Kayıtlı formlar"
          >
            <option value="">— Kayıtlı formlar —</option>
            {forms.map((f) => (
              <option key={f.id} value={f.id}>
                #{f.id} — {f.name}
              </option>
            ))}
          </select>
          <button className="btn" onClick={handleLoad} disabled={!selectedId || loading}>
            <i className="fa fa-download" /> Yükle
          </button>
        </div>
      </div>

      <DndProvider backend={HTML5Backend}>
  <div className="rfb-wrap dock-right-fixed">
    {/* === YENİ: Tuval kartı === */}
    <div className="dz-card">
      <div className="dz-card-head">
        <div className="dz-title">
          <i className="fa fa-columns" aria-hidden="true" /> Form Tuvali
        </div>
        <div className="dz-head-actions">
          <button
            type="button"
            className="btn xs"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <i className="fa fa-arrow-up" /> Üste Git
          </button>
        </div>
      </div>

      <div className="dz-card-body">
        {/* RFB aynı, sadece yeni kart gövdesinin içinde */}
        <ReactFormBuilder
          data={schema}
          onPost={(raw) => setSchema(normalizeBuilderData(raw))}
        />
      </div>
    </div>
  </div>
</DndProvider>



      {showJson && (
        <div style={{ marginTop: 12 }}>
          <pre
            style={{
              background: "#fff", border: "1px solid #e5e7eb",
              borderRadius: 12, padding: 12, maxHeight: 320, overflow: "auto",
            }}
          >
            {pretty}
          </pre>
        </div>
      )}
    </section>
  );
}
