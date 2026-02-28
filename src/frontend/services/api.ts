export const API_URL = "http://127.0.0.1:8000/api";

export const chatWithAI = async (text: string, jd: string, voice: string, mode: string, chatHistory: any[], signal: AbortSignal) => {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_text: text, jd_text: jd, voice_id: voice, mode: mode, chat_history: chatHistory }),
    signal: signal
  });
  if (!res.ok) throw new Error("API Error");
  return res;
};

// --- END INTERVIEW ---
export const endInterview = async (
  history: string,
  jdText: string,
  position: string,
  historyId?: number,
  interviewType?: string,
  questionLimit?: number,
  timeLimit?: number
) => {
  const token = localStorage.getItem("token");
  const bodyData: any = { 
    history, 
    jd_text: jdText, 
    position,
    interview_type: interviewType || "free",
    question_limit: questionLimit || 0,
    time_limit: timeLimit || 0
  };
  if (historyId) {
    bodyData.history_id = historyId;
  }
  const res = await fetch(`${API_URL}/end-interview`, {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(bodyData),
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
export const reviewCV = async (file: File, company: string, jdText: string = "") => {
    const formData = new FormData();
    formData.append("file", file); // Key 'file' phải khớp với backend (file: UploadFile)
    if (company.trim()) {
        formData.append("company", company);
    }
    formData.append("jd_text", jdText.trim() ? jdText : "Không có JD");

    const res = await fetch(`${API_URL}/review-cv`, {
        method: "POST",
        // LƯU Ý: Không set Content-Type header khi dùng FormData, browser tự set
        body: formData
    });
    
    if (!res.ok) throw new Error("Lỗi upload");
    return res;
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

export const renameInterview = async (id: number, title: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/history/${id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title })
    });
    if (!res.ok) throw new Error("Lỗi đổi tên");
    return res.json();
};

export const deleteInterview = async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Lỗi xóa lịch sử");
    return res.json();
};

// --- API ADMIN ---
export const getAdminDashboard = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Không có quyền truy cập");
  return res.json();
};

export const getSystemLogs = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/interviews`, {
      headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Không có quyền truy cập logs");
  return res.json();
};

export const getSystemConfig = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/config`, {
      headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Không lấy được cấu hình");
  return res.json();
};

export const updateSystemConfig = async (systemPrompt: string, temperature: number) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/config`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ system_prompt: systemPrompt, temperature })
  });
  if (!res.ok) throw new Error("Cập nhật cấu hình thất bại");
  return res.json();
};

// Nạp thêm Credit cho người dùng (Chỉ Admin)
export const addUserCredits = async (userId: number, amount: number) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/users/${userId}/add-credits`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Có lỗi xảy ra khi cộng credit.");
  }
  return res.json();
};

// Lấy lịch sử giao dịch (Admin)
export const getTransactionLogs = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Không có quyền truy cập lịch sử giao dịch");
  return res.json();
};

// --- API DỊCH GIỌNG NÓI ---
export const transcribeAudio = async (audioBlob: Blob, position: string = "", lang: string = "vi", currentQuestion: string = "") => { 
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("position", position);
  formData.append("lang", lang);
  formData.append("currentQuestion", currentQuestion);

  const fetchUrl = `${API_URL}/transcribe`;

  const res = await fetch(fetchUrl, {
    method: "POST",
    body: formData,
  });
  return res.json();
};

// API QUẢN LÝ THƯ VIỆN JD MẪU (ADMIN)

// 1. Lấy danh sách
export const getJdTemplates = async () => {
  const res = await fetch(`${API_URL}/templates`);
  if (!res.ok) throw new Error("Lỗi lấy danh sách JD");
  return res.json();
};

// 2. Tạo mới JD
export const createJdTemplate = async (data: { title: string; description: string }) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/templates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Lỗi tạo JD");
  return res.json();
};

// 3. Cập nhật JD
export const updateJdTemplate = async (id: number, data: { title: string; description: string }) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/templates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Lỗi cập nhật JD");
  return res.json();
};

// 4. Xóa JD
export const deleteJdTemplate = async (id: number) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/templates/${id}`, {
    method: "DELETE",
    headers: { 
      Authorization: `Bearer ${token}` 
    },
  });
  if (!res.ok) throw new Error("Lỗi xóa JD");
  return res.json();
};

// Xóa user
export const deleteUser = async (userId: number) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Lỗi xóa người dùng");
  }
  return res.json();
};