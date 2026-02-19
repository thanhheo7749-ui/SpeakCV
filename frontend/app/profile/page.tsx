"use client";
import { useEffect, useState } from "react";
import {
  getMyProfile,
  updateProfileInfo,
  addExperience,
  deleteExperience,
} from "@/services/api";
import { Save, Plus, Trash2, Briefcase, User, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Dữ liệu
  const [info, setInfo] = useState<any>({});
  const [exps, setExps] = useState<any[]>([]);

  // Form thêm kinh nghiệm
  const [newExp, setNewExp] = useState({
    company_name: "",
    position: "",
    start_date: "",
    description: "",
  });

  // Tải dữ liệu khi vào trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    getMyProfile()
      .then((data) => {
        setInfo(data.info || {});
        setExps(data.experiences || []);
      })
      .catch(() => alert("Lỗi tải dữ liệu!"))
      .finally(() => setLoading(false));
  }, []);

  // Hàm lưu thông tin cơ bản
  const handleSaveInfo = async () => {
    try {
      await updateProfileInfo(info);
      alert("Đã lưu thông tin!");
    } catch {
      alert("Lỗi lưu!");
    }
  };

  // Hàm thêm kinh nghiệm
  const handleAddExp = async () => {
    if (!newExp.company_name || !newExp.position)
      return alert("Điền thiếu thông tin!");
    try {
      await addExperience(newExp);
      // Reload lại trang hoặc fetch lại data
      const data = await getMyProfile();
      setExps(data.experiences);
      setNewExp({
        company_name: "",
        position: "",
        start_date: "",
        description: "",
      }); // Reset form
    } catch {
      alert("Lỗi thêm!");
    }
  };

  // Hàm xóa kinh nghiệm
  const handleDeleteExp = async (id: number) => {
    if (!confirm("Bạn chắc chắn xóa?")) return;
    try {
      await deleteExperience(id);
      setExps(exps.filter((e) => e.id !== id));
    } catch {
      alert("Lỗi xóa!");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-white">
        Đang tải...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold border-b border-slate-800 pb-4">
          Hồ sơ gốc (Master Profile)
        </h1>

        {/* --- PHẦN 1: THÔNG TIN CƠ BẢN --- */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
            <User /> Thông tin chung
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm">Số điện thoại</label>
              <input
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg mt-1"
                value={info.phone || ""}
                onChange={(e) => setInfo({ ...info, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm">Địa chỉ</label>
              <input
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg mt-1"
                value={info.address || ""}
                onChange={(e) => setInfo({ ...info, address: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm">
                Giới thiệu ngắn (Summary)
              </label>
              <textarea
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg mt-1 h-24"
                value={info.summary || ""}
                onChange={(e) => setInfo({ ...info, summary: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm">
                Kỹ năng (Cách nhau dấu phẩy)
              </label>
              <input
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg mt-1"
                placeholder="React, Python, SQL..."
                value={info.skills || ""}
                onChange={(e) => setInfo({ ...info, skills: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveInfo}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold flex gap-2 items-center"
            >
              <Save size={18} /> Lưu Thay Đổi
            </button>
          </div>
        </div>

        {/* --- PHẦN 2: KINH NGHIỆM LÀM VIỆC --- */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-yellow-400">
            <Briefcase /> Kinh nghiệm
          </h2>

          {/* Danh sách kinh nghiệm đã có */}
          <div className="space-y-4 mb-8">
            {exps.length === 0 && (
              <p className="text-slate-500 italic">Chưa có kinh nghiệm nào.</p>
            )}
            {exps.map((exp: any) => (
              <div
                key={exp.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-start group"
              >
                <div>
                  <h3 className="font-bold text-lg">{exp.position}</h3>
                  <p className="text-blue-400">{exp.company_name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {exp.start_date} - {exp.end_date || "Hiện tại"}
                  </p>
                  <p className="text-sm text-slate-400 mt-2 whitespace-pre-line">
                    {exp.description}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteExp(exp.id)}
                  className="text-slate-600 hover:text-red-500 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Form thêm mới */}
          <div className="border-t border-slate-800 pt-6">
            <h3 className="font-bold mb-4 text-sm uppercase text-slate-500">
              Thêm kinh nghiệm mới
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                className="bg-slate-800 border border-slate-700 p-3 rounded-lg"
                placeholder="Công ty"
                value={newExp.company_name}
                onChange={(e) =>
                  setNewExp({ ...newExp, company_name: e.target.value })
                }
              />
              <input
                className="bg-slate-800 border border-slate-700 p-3 rounded-lg"
                placeholder="Vị trí (Chức danh)"
                value={newExp.position}
                onChange={(e) =>
                  setNewExp({ ...newExp, position: e.target.value })
                }
              />
              <input
                type="date"
                className="bg-slate-800 border border-slate-700 p-3 rounded-lg"
                value={newExp.start_date}
                onChange={(e) =>
                  setNewExp({ ...newExp, start_date: e.target.value })
                }
              />
            </div>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg mb-4 h-20"
              placeholder="Mô tả công việc..."
              value={newExp.description}
              onChange={(e) =>
                setNewExp({ ...newExp, description: e.target.value })
              }
            />

            <button
              onClick={handleAddExp}
              className="w-full py-3 border border-dashed border-slate-600 hover:border-blue-500 hover:text-blue-400 rounded-lg flex justify-center items-center gap-2"
            >
              <Plus size={18} /> Thêm Kinh Nghiệm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
