// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication types
export interface SignupRequest {
  email: string;
  name: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OTPRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GoogleAuthRequest {
  token: string;
}

// Note types
export interface Note {
  id: string;
  title: string;
  content: string;
  color?: string;
  tags?: string[];
  userId: string;
  isPinned?: boolean;
  isArchived?: boolean;
  attachments?: {
    filename: string;
    url: string;
    type: string;
    size: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  color?: string;
  tags?: string[];
}

export interface UpdateNoteRequest {
  id: string;
  title?: string;
  content?: string;
  color?: string;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
}

// API Response types
export interface DemoResponse {
  message: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface NotesResponse {
  notes: Note[];
  total: number;
}

export interface NoteResponse {
  note: Note;
}

export interface TagsResponse {
  tags: {
    name: string;
    count: number;
  }[];
}

export interface NotesFilters {
  search?: string;
  tag?: string;
  pinned?: boolean;
  archived?: boolean;
}
