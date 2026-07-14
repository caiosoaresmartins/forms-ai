export interface Document {
  id: string;
  name: string;
  status: 'pending' | 'uploaded' | 'updating';
  reason: string;
  path?: string;
}

export interface Party {
  id: string;
  partyName: string;
  role: string;
  documents: Document[];
}

export interface Toast {
  id: string;
  message: string;
  type: string;
}

export type ViewKey = 'landing' | 'login' | 'upload' | 'analyzing' | 'checklist' | 'clientPortal';
