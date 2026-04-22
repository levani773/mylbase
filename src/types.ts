export type Service = 'dashboard' | 'auth' | 'firestore' | 'storage' | 'hosting' | 'functions' | 'analytics' | 'rules' | 'sdk' | 'apikeys' | 'settings';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
}

export interface User {
  uid: string;
  email: string;
  provider: string;
  created: string;
  lastLogin: string;
}

export interface FirestoreDoc {
  id: string;
  data: any;
}

export interface FirestoreCollection {
  id: string;
  docs: FirestoreDoc[];
}
