export type UserCategory = 'MVP' | 'Later' | 'Future';
export type ItemStatus   = 'open' | 'in-progress' | 'done';
export type ItemSize     = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface BacklogItem {
  id:                string;
  product:           'dockbound' | 'forumjourney';
  section:           string;
  title:             string;
  description?:      string;
  notes?:            string;
  size?:             ItemSize | string;
  userCategory:      UserCategory | string;
  order:             number;
  blockedReason?:    string;
  status:            ItemStatus;
  completionReason?: string;
  commitRef?:        string;
  updatedAt?:        string;   // ISO 8601
  updatedBy?:        string;   // e.g. "dockboundAI", "forumjourneyAI", "amy"
}

export interface HistoryEntry {
  changedAt:   string;   // ISO 8601 — when this state became current
  changedBy:   string;
  changeNote?: string;
  snapshot:    Omit<BacklogItem, 'id'>;
}

export const BACKLOG: BacklogItem[] = [

  // ── DockBound ────────────────────────────────────────────────────────────────

  {
    id: 'db-auth-1', product: 'dockbound', section: 'Auth & Onboarding',
    title: 'User registration flow',
    userCategory: 'MVP', size: 'M', order: 1, status: 'open',
  },
  {
    id: 'db-auth-2', product: 'dockbound', section: 'Auth & Onboarding',
    title: 'Email verification',
    userCategory: 'MVP', size: 'S', order: 2, status: 'open',
  },
  {
    id: 'db-auth-3', product: 'dockbound', section: 'Auth & Onboarding',
    title: 'SSO (Google / Apple)',
    userCategory: 'Later', size: 'M', order: 3, status: 'open',
  },

  {
    id: 'db-guides-1', product: 'dockbound', section: 'Port Guides',
    title: 'Guide creation & editing UI',
    userCategory: 'MVP', size: 'L', order: 1, status: 'in-progress',
  },
  {
    id: 'db-guides-2', product: 'dockbound', section: 'Port Guides',
    title: 'Publish / unpublish workflow',
    userCategory: 'MVP', size: 'S', order: 2, status: 'open',
  },
  {
    id: 'db-guides-3', product: 'dockbound', section: 'Port Guides',
    title: 'Score & freshness indicators for cruisers',
    userCategory: 'MVP', size: 'M', order: 3, status: 'open',
  },
  {
    id: 'db-guides-4', product: 'dockbound', section: 'Port Guides',
    title: 'Multi-language guide support',
    userCategory: 'Future', size: 'XL', order: 4, status: 'open',
  },

  {
    id: 'db-search-1', product: 'dockbound', section: 'Search & Discovery',
    title: 'Port search by name / LOCODE',
    userCategory: 'MVP', size: 'M', order: 1, status: 'open',
  },
  {
    id: 'db-search-2', product: 'dockbound', section: 'Search & Discovery',
    title: 'Filter by region and cruise line',
    userCategory: 'Later', size: 'M', order: 2, status: 'open',
  },
  {
    id: 'db-search-3', product: 'dockbound', section: 'Search & Discovery',
    title: 'Map-based port exploration',
    userCategory: 'Future', size: 'XL', order: 3, status: 'open',
  },

  {
    id: 'db-notif-1', product: 'dockbound', section: 'Notifications',
    title: 'In-app port alert notifications',
    userCategory: 'Later', size: 'S', order: 1, status: 'open',
  },
  {
    id: 'db-notif-2', product: 'dockbound', section: 'Notifications',
    title: 'SMS port update alerts',
    userCategory: 'Later', size: 'M', order: 2, status: 'open',
    blockedReason: 'Twilio account approval pending',
  },

  // ── ForumJourney ─────────────────────────────────────────────────────────────

  {
    id: 'fj-auth-1', product: 'forumjourney', section: 'Auth & Onboarding',
    title: 'User registration',
    userCategory: 'MVP', size: 'M', order: 1, status: 'open',
  },
  {
    id: 'fj-auth-2', product: 'forumjourney', section: 'Auth & Onboarding',
    title: 'Profile creation & avatar upload',
    userCategory: 'MVP', size: 'M', order: 2, status: 'open',
  },
  {
    id: 'fj-auth-3', product: 'forumjourney', section: 'Auth & Onboarding',
    title: 'Social sign-in (Google)',
    userCategory: 'Later', size: 'M', order: 3, status: 'open',
  },

  {
    id: 'fj-forum-1', product: 'forumjourney', section: 'Forum Core',
    title: 'Create and browse forums',
    userCategory: 'MVP', size: 'L', order: 1, status: 'open',
  },
  {
    id: 'fj-forum-2', product: 'forumjourney', section: 'Forum Core',
    title: 'Post and threaded replies',
    userCategory: 'MVP', size: 'L', order: 2, status: 'open',
  },
  {
    id: 'fj-forum-3', product: 'forumjourney', section: 'Forum Core',
    title: 'Rich text editor (bold, links, lists)',
    userCategory: 'Later', size: 'M', order: 3, status: 'open',
  },
  {
    id: 'fj-forum-4', product: 'forumjourney', section: 'Forum Core',
    title: 'Image uploads in posts',
    userCategory: 'Later', size: 'M', order: 4, status: 'open',
  },
  {
    id: 'fj-forum-5', product: 'forumjourney', section: 'Forum Core',
    title: 'Reactions / upvotes on posts',
    userCategory: 'Future', size: 'S', order: 5, status: 'open',
  },

  {
    id: 'fj-events-1', product: 'forumjourney', section: 'Events',
    title: 'Create event listings',
    userCategory: 'MVP', size: 'L', order: 1, status: 'open',
  },
  {
    id: 'fj-events-2', product: 'forumjourney', section: 'Events',
    title: 'RSVP / attendance tracking',
    userCategory: 'MVP', size: 'M', order: 2, status: 'open',
  },
  {
    id: 'fj-events-3', product: 'forumjourney', section: 'Events',
    title: 'Event calendar view',
    userCategory: 'Later', size: 'L', order: 3, status: 'open',
  },
  {
    id: 'fj-events-4', product: 'forumjourney', section: 'Events',
    title: 'SMS event reminders',
    userCategory: 'Later', size: 'M', order: 4, status: 'open',
    blockedReason: 'Twilio account approval pending',
  },

  {
    id: 'fj-notif-1', product: 'forumjourney', section: 'Notifications',
    title: 'In-app notification bell',
    userCategory: 'MVP', size: 'M', order: 1, status: 'open',
  },
  {
    id: 'fj-notif-2', product: 'forumjourney', section: 'Notifications',
    title: 'Email digest (daily / weekly)',
    userCategory: 'Later', size: 'M', order: 2, status: 'open',
  },
  {
    id: 'fj-notif-3', product: 'forumjourney', section: 'Notifications',
    title: 'SMS notification opt-in',
    userCategory: 'Later', size: 'S', order: 3, status: 'open',
    blockedReason: 'Twilio account approval pending',
  },
  {
    id: 'fj-notif-4', product: 'forumjourney', section: 'Notifications',
    title: 'Push notifications (mobile)',
    userCategory: 'Future', size: 'L', order: 4, status: 'open',
  },

  {
    id: 'fj-admin-1', product: 'forumjourney', section: 'Moderation & Admin',
    title: 'Flag and remove posts',
    userCategory: 'MVP', size: 'M', order: 1, status: 'open',
  },
  {
    id: 'fj-admin-2', product: 'forumjourney', section: 'Moderation & Admin',
    title: 'User ban / suspend',
    userCategory: 'Later', size: 'S', order: 2, status: 'open',
  },
  {
    id: 'fj-admin-3', product: 'forumjourney', section: 'Moderation & Admin',
    title: 'Mod dashboard with queue',
    userCategory: 'Future', size: 'L', order: 3, status: 'open',
  },
];
