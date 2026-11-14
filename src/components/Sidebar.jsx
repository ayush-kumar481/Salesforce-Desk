import {
  Activity,
  ArrowRight,
  CircleHelp,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { objectIcons } from '../constants';

export default function Sidebar({ objects, activeObject, onSelectObject }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#home" aria-label="Salesforce Desk home">
        <span className="brand-mark"><Activity size={21} strokeWidth={2.5} /></span>
        <span>salesforce<span className="brand-light">desk</span></span>
        <span className="brand-pill">CRM</span>
      </a>

      <div className="side-section-label">WORKSPACE</div>
      <button className="nav-link">
        <LayoutDashboard size={17} /> Overview
      </button>

      <div className="side-section-label object-label">
        YOUR OBJECTS <span>{objects.length || 5}</span>
      </div>
      <nav className="object-nav">
        {objects.map((item) => {
          const Icon = objectIcons[item.name];
          const selected = activeObject === item.name;

          return (
            <button
              key={item.name}
              className={`nav-link ${selected ? 'selected' : ''}`}
              onClick={() => onSelectObject(item.name)}
            >
              <Icon size={17} />
              <span>{item.label}</span>
              {selected && <span className="nav-active-dot" />}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-spacer" />
      <div className="sidebar-help">
        <span className="help-icon"><CircleHelp size={17} /></span>
        <div><strong>Need a hand?</strong><p>Read the quick guide</p></div>
        <ArrowRight size={14} />
      </div>
      <div className="sidebar-footer">
        <span className="status-dot" /> Secure connection <ShieldCheck size={14} />
      </div>
    </aside>
  );
}
