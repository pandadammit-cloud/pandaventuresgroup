import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import V4ReviewTab from './tabs/V4ReviewTab';
import GuideQueueTab from './tabs/GuideQueueTab';
import ContentHealthTab from './tabs/ContentHealthTab';

type Tab = 'v4-review' | 'guide-queue' | 'content-health';

const TABS: { id: Tab; label: string }[] = [
  { id: 'v4-review',      label: 'V4 Review' },
  { id: 'guide-queue',    label: 'Guide Queue' },
  { id: 'content-health', label: 'Content Health' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('v4-review');

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
        {activeTab === 'v4-review'      && <V4ReviewTab />}
        {activeTab === 'guide-queue'    && <GuideQueueTab />}
        {activeTab === 'content-health' && <ContentHealthTab />}
      </main>
    </div>
  );
}
