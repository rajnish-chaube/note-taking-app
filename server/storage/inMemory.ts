// In-memory storage for development when MongoDB is not available

export interface InMemoryUser {
  id: string;
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  authProvider: "local" | "google" | "otp";
  googleId?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryNote {
  id: string;
  title: string;
  content: string;
  color?: string;
  tags: string[];
  userId: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryOTP {
  id: string;
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  isUsed: boolean;
  createdAt: Date;
}

// In-memory storage
export const inMemoryUsers: InMemoryUser[] = [];
export const inMemoryNotes: InMemoryNote[] = [];
export const inMemoryOTPs: InMemoryOTP[] = [];

// Helper functions
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Clean up expired OTPs periodically
setInterval(() => {
  const now = new Date();
  for (let i = inMemoryOTPs.length - 1; i >= 0; i--) {
    if (inMemoryOTPs[i].expiresAt < now) {
      inMemoryOTPs.splice(i, 1);
    }
  }
}, 60000); // Clean up every minute

console.log("📦 In-memory storage initialized for development");
