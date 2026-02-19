export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  skills: string;
}

export interface ChatState {
  status: string;
  aiText: string;
  userText: string;
  tempText: string; // Text đang nói dở
}