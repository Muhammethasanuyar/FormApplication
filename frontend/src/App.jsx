import { Routes, Route, Link } from 'react-router-dom';
import BuilderPage from './pages/BuilderPage.jsx';
import RenderPage from './pages/RenderPage.jsx';

export default function App(){
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <i className="fa fa-wpforms" /> <span>Form Builder Wizard</span>
        </div>
        <nav className="nav">
          <Link className="navlink" to="/builder">Builder</Link>
          <Link className="navlink" to="/forms/1">Örnek Form</Link>
        </nav>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<BuilderPage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/forms/:id" element={<RenderPage />} />
        </Routes>
      </main>
    </div>
  );
}
