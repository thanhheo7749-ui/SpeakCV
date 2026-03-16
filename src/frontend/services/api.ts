/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

export const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api`;

// --- API REQUEST WRAPPER ---
export async function apiRequest(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res;
}

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
  const token = sessionStorage.getItem("token");
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
  const res = await apiRequest(`${API_URL}/end-interview`, {
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
  const res = await apiRequest(`${API_URL}/hint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ last_question: lastQuestion, jd_text: jdText }),
  });
  return res.json();
};

export const upgradeToPro = async () => {
  const token = sessionStorage.getItem("token");
  const res = await apiRequest(`${API_URL}/upgrade-pro`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// --- GENERATE CV ---
export const generateCV = async (userProfile: any, position: string, company: string, templateId: string) => {
    const templateInstruction = templateId === 'itviec' 
        ? "Style: Modern, Clean, focus on Skills & Projects (ITViec style)." 
        : templateId === 'creative' 
        ? "Style: Creative, Colorful, standout layout."
        : "Style: Classic, Harvard format, professional.";

    const res = await apiRequest(`${API_URL}/generate-cv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_info: JSON.stringify(userProfile),
            position: position,
            company: company,
            style_instruction: templateInstruction 
        })
    });
    return res.json();
};

// --- REVIEW CV ---
export const reviewCV = async (file: File, company: string, jdText: string = "") => {
    const formData = new FormData();
    formData.append("file", file);
    if (company.trim()) {
        formData.append("company", company);
    }
    formData.append("jd_text", jdText.trim() ? jdText : "Không có JD");

    const res = await fetch(`${API_URL}/review-cv`, {
        method: "POST",
        body: formData
    });
    
    if (!res.ok) throw new Error("Upload failed");
    return res;
};

// --- AUTH API ---
export const registerUser = async (email:string, password:string, fullName:string) => {
    const res = await fetch(`${API_URL}/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName })
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Registration failed"); }
    return res.json();
};

export const loginUser = async (email:string, password:string) => {
    const res = await fetch(`${API_URL}/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Login failed"); }
    return res.json();
};

export const loginGoogle = async (token: string) => {
    const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Google Login failed"); }
    return res.json();
};


// --- PROFILE APIs ---

const getAuthHeaders = () => {
    const token = sessionStorage.getItem("token");
    return { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export const getMyProfile = async () => {
    const res = await fetch(`${API_URL}/my-profile`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to load profile");
    return res.json();
};

export const updateProfileInfo = async (data: any) => {
    const res = await fetch(`${API_URL}/my-profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return res.json();
};

export const addExperience = async (data: any) => {
    const res = await fetch(`${API_URL}/experience`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to add experience");
    return res.json();
};

export const deleteExperience = async (id: number) => {
    const res = await fetch(`${API_URL}/experience/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to delete");
    return res.json();
};

// --- GET HISTORY ---
export const getHistory = async () => {
    const token = sessionStorage.getItem("token");
    const res = await apiRequest(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
};

export const renameInterview = async (id: number, title: string) => {
    const token = sessionStorage.getItem("token");
    const res = await fetch(`${API_URL}/history/${id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title })
    });
    if (!res.ok) throw new Error("Failed to rename");
    return res.json();
};

export const deleteInterview = async (id: number) => {
    const token = sessionStorage.getItem("token");
    const res = await fetch(`${API_URL}/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete history");
    return res.json();
};

export const updateInterviewConfig = async (
    historyId: number,
    data: { interview_type: string; question_limit: number; time_limit: number }
) => {
    const token = sessionStorage.getItem("token");
    const res = await fetch(`${API_URL}/history/${historyId}/config`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update interview config");
    return res.json();
};

// --- API ADMIN ---
export const getAdminDashboard = async () => {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Access denied");
  return res.json();
};

export const getSystemLogs = async () => {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/interviews`, {
      headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Access denied");
  return res.json();
};

export const getSystemConfig = async () => {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/config`, {
      headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load config");
  return res.json();
};

export const updateSystemConfig = async (systemPrompt: string, temperature: number) => {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/config`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ system_prompt: systemPrompt, temperature })
  });
  if (!res.ok) throw new Error("Failed to update config");
  return res.json();
};

// Add credits for a user (Admin only)
export const addUserCredits = async (userId: number, amount: number) => {
  const token = sessionStorage.getItem("token");
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
    throw new Error(errorData.detail || "Failed to add credits.");
  }
  return res.json();
};

// Get transaction history (Admin)
export const getTransactionLogs = async () => {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Access denied");
  return res.json();
};

// Speech-to-text transcription
export const transcribeAudio = async (audioBlob: Blob, position: string = "", lang: string = "vi", currentQuestion: string = "") => { 
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("position", position);
  formData.append("lang", lang);
  formData.append("currentQuestion", currentQuestion);

  const fetchUrl = `${API_URL}/transcribe`;

  const res = await apiRequest(fetchUrl, {
    method: "POST",
    body: formData,
  });
  return res.json();
};

// Get all JD templates
export const getJdTemplates = async () => {
  const res = await fetch(`${API_URL}/templates`);
  if (!res.ok) throw new Error("Failed to load JD templates");
  return res.json();
};

// Create a new JD template
export const createJdTemplate = async (data: { title: string; description: string }) => {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/templates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create JD template");
  return res.json();
};

// Update a JD template
export const updateJdTemplate = async (id: number, data: { title: string; description: string }) => {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/templates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update JD template");
  return res.json();
};

// Delete a JD template
export const deleteJdTemplate = async (id: number) => {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/templates/${id}`, {
    method: "DELETE",
    headers: { 
      Authorization: `Bearer ${token}` 
    },
  });
  if (!res.ok) throw new Error("Failed to delete JD template");
  return res.json();
};

// Delete a user
export const deleteUser = async (userId: number) => {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to delete user");
  }
  return res.json();
};

// Create a user (Admin only)
export const createUserAsAdmin = async (data: any) => {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to create user");
  }
  return res.json();
};

// Update a user (Admin only)
export const updateUserAsAdmin = async (userId: number, data: any) => {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to update user");
  }
  return res.json();
};

// Get user detail (Admin only)
export const getUserDetail = async (userId: number) => {
  const token = sessionStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to load user detail");
  }
  return res.json();
};

// --- JOB MATCHING ---
export const matchJobs = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/jobs/match`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Job matching failed");
  }
  return res.json();
};

// --- CV MAKEOVER (FILE UPLOAD) ---
export const uploadMakeoverCV = async (file: File, industry: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("industry", industry);

  const res = await fetch(`${API_URL}/cv/upload-makeover`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "CV makeover failed" }));
    throw new Error(err.detail || "CV makeover failed");
  }
  return res.json();
};