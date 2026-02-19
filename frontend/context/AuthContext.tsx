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

// Tạo Context rỗng ban đầu
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Khi F5 trang web, chạy hàm này để lấy lại thông tin đăng nhập từ LocalStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("userRole");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setRole(storedRole || "user"); // Mặc định là user nếu không có role
    }

    setIsLoading(false); // Đã tải xong
  }, []);

  // Hàm Đăng Nhập
  const login = (newToken: string, newName: string, newRole: string) => {
    // 1. Lưu vào Storage (để F5 không bị mất)
    localStorage.setItem("token", newToken);
    localStorage.setItem("userName", newName);
    localStorage.setItem("userRole", newRole);

    // 2. Cập nhật State
    setToken(newToken);
    setUser(newName);
    setRole(newRole);

    // 3. Chuyển hướng trang
    if (newRole === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard"); // Hoặc /profile tùy bạn muốn
    }
  };

  // Hàm Đăng Xuất
  const logout = () => {
    // 1. Xóa Storage
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");

    // 2. Xóa State
    setUser(null);
    setRole(null);
    setToken(null);

    // 3. Quay về trang đăng nhập
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

// Hook để dùng nhanh ở các file khác: const { user, login } = useAuth();
export const useAuth = () => useContext(AuthContext);
