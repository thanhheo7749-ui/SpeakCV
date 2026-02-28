/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

import { X, User } from "lucide-react";

export default function ProfileModal({
  show,
  onClose,
  profile,
  setProfile,
}: any) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-700 p-8">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold flex gap-2">
            <User className="text-blue-500" /> Hồ sơ
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500">
              Tên hiển thị
            </label>
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 mt-1 text-white"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">
              Kỹ năng / Kinh nghiệm
            </label>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 mt-1 h-24 text-white"
              value={profile.skills}
              onChange={(e) =>
                setProfile({ ...profile, skills: e.target.value })
              }
              placeholder="VD: ReactJS, Python, 2 năm kinh nghiệm..."
            />
          </div>
          <button
            onClick={() => {
              localStorage.setItem("userProfile", JSON.stringify(profile));
              onClose();
            }}
            className="w-full py-3 bg-pink-600 hover:bg-pink-500 rounded-xl font-bold mt-4 shadow-lg shadow-pink-900/20"
          >
            Lưu Hồ Sơ
          </button>
        </div>
      </div>
    </div>
  );
}
