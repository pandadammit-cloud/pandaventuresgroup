import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import ContentHealthTab from './tabs/ContentHealthTab';
import PortGuidesTab from './tabs/PortGuidesTab';

type Tab = 'content-health' | 'port-guides';

const TABS: { id: Tab; label: string }[] = [
  { id: 'content-health', label: 'Content Health' },
  { id: 'port-guides',    label: 'Port Guides' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('content-health');

  return (
    <div className="admin">
      <header className="admin__header">
        <div className="admin__header-brand">
          <img src="/logo-panda-ventures.png" alt="PandA Ventures" className="admin__header-logo" />
          <span className="admin__header-title">PlatformCore Admin</span>
        </div>
        <button className="admin__signout" onClick={() => signOut(auth)}>Sign out</button>
      </header>

      <nav className="admin__tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`admin__tab${activeTab === tab.id ? ' admin__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="admin__content">
        {activeTab === 'content-health' && <ContentHealthTab />}
        {activeTab === 'port-guides'    && <PortGuidesTab />}
      </main>
    </div>
  );
}
