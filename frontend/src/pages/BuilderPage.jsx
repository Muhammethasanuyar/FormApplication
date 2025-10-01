import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { ReactFormBuilder } from 'react-form-builder2';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function BuilderPage(){
  const builderRef = useRef(null);
  const [name, setName] = useState('Demo Form');
  const [saving, setSaving] = useState(false);
  const [lastId, setLastId] = useState(null);

  // örnek: cities/colors populate için URL ipuçları
  const hint = (
    <div className="card" style={{marginBottom:12}}>
      <b>İpucu:</b> Dropdown’u seçip <i>“Populate Options from API”</i> alanına şu endpoint’leri yazabilirsin:
      <ul style={{margin:'6px 0 0 16px'}}>
        <li><code>{API}/api/cities</code> (81 il)</li>
        <li><code>{API}/api/colors</code> (renk paleti)</li>
      </ul>
      <small>“Sevdiğin Renk” alanına <b>favorite-color</b> class’ı verirsen renk paleti otomatik bağlanır.</small>
    </div>
  );

  const save = async () => {
    setSaving(true);
    try{
      // kütüphanenin iç state'inden alın (yoksa onPost callback'i ile yakalayabilirsin)
      const data = builderRef.current?.state?.data || [];
      const res = await axios.post(`${API}/api/forms`, { name, schema: data });
      setLastId(res.data.id);
      alert(`Kaydedildi! Form id=${res.data.id}. Önizleme: /forms/${res.data.id}`);
    }catch(e){
      console.error(e);
      alert('Kaydedilemedi');
    }finally{
      setSaving(false);
    }
  };

  return (
    <div className="card form-card">
      <div className="card-head">
        <h2>Form Builder</h2>
        <div className="actions">
          <input
            className="form-control"
            style={{width:260}}
            value={name}
            onChange={e=>setName(e.target.value)}
            placeholder="Form adı"
          />
          <button className="btn primary" onClick={save} disabled={saving}>
            <i className="fa fa-save" /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          {lastId && (
            <a className="btn" href={`/forms/${lastId}`} target="_blank">
              <i className="fa fa-eye" /> Önizle
            </a>
          )}
        </div>
      </div>

      {hint}

      <div className="rfb-wrap">
        {/* Builder preview | toolbox sağda */}
        <ReactFormBuilder ref={builderRef} />
      </div>
    </div>
  );
}
