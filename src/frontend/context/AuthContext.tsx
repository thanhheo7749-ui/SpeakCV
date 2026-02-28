/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// Định nghĩa kiểu dữ liệu cho Context
interface AuthContextType {
  user: string | null;
  role: string | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, name: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("userRole");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setRole(storedRole || "user");
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string, newName: string, newRole: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("userName", newName);
    localStorage.setItem("userRole", newRole);

    setToken(newToken);
    setUser(newName);
    setRole(newRole);
    if (newRole === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    setUser(null);
    setRole(null);
    setToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, role, token, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
