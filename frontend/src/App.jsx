import { Routes, Route, Link } from 'react-router-dom';
import FormsPage from './pages/FormsPage.jsx';
import BuilderPage from './pages/BuilderPage.jsx';
import RenderPage from './pages/RenderPage.jsx';

export default function App(){
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><i className="fa fa-wpforms" /> Form Builder</div>
        <nav className="nav">
          <Link className="navlink" to="/">Formlar</Link>
          <a className="navlink" href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<FormsPage />} />
        <Route path="/builder/:id" element={<BuilderPage />} />
        <Route path="/forms/:id" element={<RenderPage />} />
      </Routes>
    </div>
  );
}
