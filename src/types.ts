export type Service = 'auth' | 'firestore' | 'storage' | 'hosting' | 'functions' | 'analytics' | 'rules' | 'sdk';

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
