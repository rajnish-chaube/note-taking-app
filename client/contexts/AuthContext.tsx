import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthResponse } from "@shared/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (
    email: string,
    name: string,
    password: string,
  ) => Promise<AuthResponse>;
  loginWithGoogle: (googleToken: string) => Promise<AuthResponse>;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data: AuthResponse = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    return data;
  };

  const signup = async (
    email: string,
    name: string,
    password: string,
  ): Promise<AuthResponse> => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Signup failed");
    }

    const data: AuthResponse = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    return data;
  };

  const loginWithGoogle = async (
    googleToken: string,
  ): Promise<AuthResponse> => {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: googleToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Google login failed");
    }

    const data: AuthResponse = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    return data;
  };

  const sendOTP = async (email: string): Promise<void> => {
    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send OTP");
    }
  };

  const verifyOTP = async (
    email: string,
    otp: string,
  ): Promise<AuthResponse> => {
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "OTP verification failed");
    }

    const data: AuthResponse = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    loginWithGoogle,
    sendOTP,
    verifyOTP,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
