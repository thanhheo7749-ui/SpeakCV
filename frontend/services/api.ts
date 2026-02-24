// frontend/services/api.ts

export const API_URL = "http://127.0.0.1:8000/api";

// Gửi tin nhắn Chat
export const chatWithAI = async (text: string, jd: string, voice: string, mode: string, signal: AbortSignal) => {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_text: text, jd_text: jd, voice_id: voice, mode: mode }),
    signal: signal
  });
  if (!res.ok) throw new Error("API Error");
  return res;
};

// --- END INTERVIEW ---
export const endInterview = async (history: string, jdText: string, position: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/end-interview`, {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ history, jd_text: jdText, position }),
  });
  return res.json();
};

// --- GET HINT ---
export const getHint = async (lastQuestion: string, jdText: string) => {
  const res = await fetch(`${API_URL}/hint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ last_question: lastQuestion, jd_text: jdText }),
  });
  return res.json();
};

// --- GENERATE CV ---
export const generateCV = async (userProfile: any, position: string, company: string, templateId: string) => {
    // Tạo prompt cho AI dựa trên template
    const templateInstruction = templateId === 'itviec' 
        ? "Style: Modern, Clean, focus on Skills & Projects (ITViec style)." 
        : templateId === 'creative' 
        ? "Style: Creative, Colorful, standout layout."
        : "Style: Classic, Harvard format, professional.";

    const res = await fetch(`${API_URL}/generate-cv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_info: JSON.stringify(userProfile),
            position: position,
            company: company,
            // Gửi style hướng dẫn cho AI
            style_instruction: templateInstruction 
        })
    });
    return res.json();
};

// --- REVIEW CV ---
export const reviewCV = async (file: File, company: string) => {
    const formData = new FormData();
    formData.append("file", file); // Key 'file' phải khớp với backend (file: UploadFile)
    formData.append("company", company);

    const res = await fetch(`${API_URL}/review-cv`, {
        method: "POST",
        // LƯU Ý: Không set Content-Type header khi dùng FormData, browser tự set
        body: formData
    });
    
    if (!res.ok) throw new Error("Lỗi upload");
    return res.json();
};

// --- AUTH API ---
export const registerUser = async (email:string, password:string, fullName:string) => {
    const res = await fetch(`${API_URL}/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName })
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Lỗi đăng ký"); }
    return res.json();
};

export const loginUser = async (email:string, password:string) => {
    const res = await fetch(`${API_URL}/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Lỗi đăng nhập"); }
    return res.json(); // Trả về { access_token, user_name }
};

// --- PROFILE APIs ---

// Hàm lấy Token từ LocalStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Gửi token lên
    };
};

// 1. Lấy toàn bộ hồ sơ
export const getMyProfile = async () => {
    const res = await fetch(`${API_URL}/my-profile`, {
        headers: getAuthHeaders() // Không cần body, chỉ cần header
    });
    if (!res.ok) throw new Error("Lỗi tải hồ sơ");
    return res.json();
};

// 2. Cập nhật thông tin cơ bản
export const updateProfileInfo = async (data: any) => {
    const res = await fetch(`${API_URL}/my-profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Lỗi cập nhật");
    return res.json();
};

// 3. Thêm kinh nghiệm
export const addExperience = async (data: any) => {
    const res = await fetch(`${API_URL}/experience`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Lỗi thêm kinh nghiệm");
    return res.json();
};

// 4. Xóa kinh nghiệm
export const deleteExperience = async (id: number) => {
    const res = await fetch(`${API_URL}/experience/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Lỗi xóa");
    return res.json();
};

// --- GET HISTORY ---
export const getHistory = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
};