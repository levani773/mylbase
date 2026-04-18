import { User, FirestoreCollection } from './types';

export const MOCK_USERS: User[] = [
  { uid: 'u1', email: 'alex@example.com', provider: 'google.com', created: 'Apr 10, 2026', lastLogin: 'Apr 18, 2026' },
  { uid: 'u2', email: 'sarah@design.io', provider: 'password', created: 'Mar 15, 2026', lastLogin: 'Apr 17, 2026' },
  { uid: 'u3', email: 'dev@aura.db', provider: 'github.com', created: 'Jan 22, 2026', lastLogin: 'Apr 18, 2026' },
];

export const MOCK_FIRESTORE: FirestoreCollection[] = [
  {
    id: 'users',
    docs: [
      { id: 'u1', data: { name: 'Alex', role: 'admin', settings: { theme: 'dark' } } },
      { id: 'u2', data: { name: 'Sarah', role: 'editor', bio: 'Design is thinking made visual.' } },
    ]
  },
  {
    id: 'projects',
    docs: [
      { id: 'p1', data: { title: 'Aura Landing', status: 'deployed', tech: ['react', 'tailwind'] } },
      { id: 'p2', data: { title: 'Nexus API', status: 'pending', endpoint: 'https://api.nexus.dev' } },
    ]
  }
];

export const MOCK_STORAGE = [
  { name: 'profile_images', type: 'folder', size: '-', modified: '2 days ago' },
  { name: 'config.json', type: 'file', size: '2.4 KB', modified: '1 hour ago' },
  { name: 'logo_dark.svg', type: 'image', size: '12 KB', modified: '5 mins ago' },
  { name: 'backups', type: 'folder', size: '-', modified: '1 week ago' },
];
