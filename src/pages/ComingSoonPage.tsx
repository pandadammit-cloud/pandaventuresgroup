export default function ComingSoonPage() {
  return (
    <div className="coming-soon">
      <div className="coming-soon__inner">
        <img
          src="/logo-panda-ventures.png"
          alt="PandA Ventures"
          className="coming-soon__logo"
        />
        <p className="coming-soon__tagline">
          PandA Ventures, LLC — building intelligent travel and event platforms.
        </p>
        <div className="coming-soon__badge">Coming Soon</div>
        <div className="coming-soon__ventures">
          <a href="https://dockbound.com" className="coming-soon__venture-link" target="_blank" rel="noreferrer">
            <img src="/logo-dockbound.png" alt="DockBound" className="coming-soon__venture-logo" />
            <span>DockBound</span>
          </a>
          <a href="https://forumjourney.com" className="coming-soon__venture-link" target="_blank" rel="noreferrer">
            <img src="/logo-forumjourney.png" alt="ForumJourney" className="coming-soon__venture-logo" />
            <span>ForumJourney</span>
          </a>
        </div>
      </div>
    </div>
  );
}
