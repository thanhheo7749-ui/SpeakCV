"use client";
import { useEffect, useState } from "react";
import {
  getMyProfile,
  updateProfileInfo,
  addExperience,
  deleteExperience,
} from "@/services/api";
import {
  Save,
  Plus,
  Trash2,
  Briefcase,
  User,
  Loader2,
  Link as LinkIcon,
  Mail,
  ArrowLeft,
  Camera,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dữ liệu chung
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
        setInfo({ ...data.info, full_name: data.full_name, email: data.email });
        setExps(data.experiences || []);
      })
      .catch(() => alert("Lỗi tải dữ liệu!"))
      .finally(() => setLoading(false));
  }, [router]);

  // HÀM NÉN VÀ LƯU ẢNH AVATAR
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Nén ảnh xuống kích thước max 300x300 để lưu Database cho nhẹ
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Chuyển ảnh thành chuỗi Base64
        const base64Url = canvas.toDataURL("image/jpeg", 0.8);
        setInfo({ ...info, avatar: base64Url });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveInfo = async () => {
    setSaving(true);
    try {
      await updateProfileInfo(info);
      if (info.full_name) localStorage.setItem("userName", info.full_name);
      alert("🎉 Đã lưu thông tin thành công!");
      window.location.reload();
    } catch {
      alert("❌ Có lỗi xảy ra khi lưu thông tin!");
    } finally {
      setSaving(false);
    }
  };

  // Hàm thêm kinh nghiệm
  const handleAddExp = async () => {
    if (!newExp.company_name || !newExp.position)
      return alert("Vui lòng điền đủ Tên công ty và Vị trí!");
    try {
      await addExperience(newExp);
      const data = await getMyProfile();
      setExps(data.experiences);
      setNewExp({
        company_name: "",
        position: "",
        start_date: "",
        description: "",
      });
    } catch {
      alert("Lỗi khi thêm kinh nghiệm!");
    }
  };

  // Hàm xóa kinh nghiệm
  const handleDeleteExp = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa kinh nghiệm này?")) return;
    try {
      await deleteExperience(id);
      setExps(exps.filter((e) => e.id !== id));
    } catch {
      alert("Lỗi khi xóa!");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-white gap-3">
        <Loader2 className="animate-spin text-blue-500" size={32} /> Đang tải dữ
        liệu...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-10 pb-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* --- HEADER CÓ NÚT THOÁT --- */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-slate-800 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Hồ sơ của tôi</h1>
            <p className="text-slate-400 mt-2">
              Dữ liệu này sẽ được dùng để tự động tạo CV cho bạn.
            </p>
          </div>

          {/* NÚT QUAY LẠI TRANG CHỦ */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all font-medium"
          >
            <ArrowLeft size={18} /> Quay lại Trang chủ
          </button>
        </div>

        {/* --- PHẦN 1: THÔNG TIN CÁ NHÂN --- */}
        <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl">
          {/* KHU VỰC AVATAR MỚI THÊM */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-8 border-b border-slate-800">
            <div className="relative w-32 h-32 rounded-full border-4 border-slate-700 overflow-hidden bg-slate-800 group cursor-pointer flex-shrink-0 shadow-lg">
              {info.avatar ? (
                <img
                  src={info.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-full h-full p-6 text-slate-500" />
              )}
              {/* Lớp phủ mờ khi hover */}
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white mb-1" size={24} />
                <span className="text-xs font-bold text-white">Đổi ảnh</span>
              </div>
              {/* Input ẩn để bấm vào là up ảnh */}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-white">
                {info.full_name || "Chưa cập nhật tên"}
              </h2>
              <p className="text-blue-400 mt-1">{info.email}</p>
              <p className="text-slate-400 text-sm mt-2">
                Định dạng JPEG, PNG. Tối đa 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Các ô input cũ giữ nguyên */}
            <div>
              <label className="text-slate-400 text-sm font-bold uppercase">
                Họ và tên
              </label>
              <input
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none p-3 rounded-xl mt-2"
                value={info.full_name || ""}
                onChange={(e) =>
                  setInfo({ ...info, full_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm font-bold uppercase flex items-center gap-1">
                Email{" "}
                <span className="text-red-400/80 text-xs lowercase font-normal">
                  (Không thể thay đổi)
                </span>
              </label>
              <div className="relative mt-2">
                <input
                  disabled
                  className="w-full bg-slate-800/50 border border-slate-700/50 text-slate-500 p-3 pl-10 rounded-xl cursor-not-allowed"
                  value={info.email || ""}
                />
                <Mail
                  className="absolute left-3 top-3.5 text-slate-600"
                  size={18}
                />
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-sm font-bold uppercase">
                Số điện thoại
              </label>
              <input
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none p-3 rounded-xl mt-2"
                value={info.phone || ""}
                onChange={(e) => setInfo({ ...info, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm font-bold uppercase">
                Địa chỉ
              </label>
              <input
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none p-3 rounded-xl mt-2"
                value={info.address || ""}
                onChange={(e) => setInfo({ ...info, address: e.target.value })}
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm font-bold uppercase flex items-center gap-1">
                <LinkIcon size={14} /> LinkedIn URL
              </label>
              <input
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none p-3 rounded-xl mt-2"
                value={info.linkedin || ""}
                onChange={(e) => setInfo({ ...info, linkedin: e.target.value })}
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm font-bold uppercase flex items-center gap-1">
                <LinkIcon size={14} /> Github URL
              </label>
              <input
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none p-3 rounded-xl mt-2"
                value={info.github || ""}
                onChange={(e) => setInfo({ ...info, github: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm font-bold uppercase">
                Giới thiệu bản thân (Summary)
              </label>
              <textarea
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none p-3 rounded-xl mt-2 h-28 custom-scrollbar"
                value={info.summary || ""}
                onChange={(e) => setInfo({ ...info, summary: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm font-bold uppercase">
                Kỹ năng cốt lõi
              </label>
              <input
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none p-3 rounded-xl mt-2"
                value={info.skills || ""}
                onChange={(e) => setInfo({ ...info, skills: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveInfo}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold flex gap-2 items-center transition-all active:scale-95"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}{" "}
              {saving ? "Đang lưu..." : "Lưu Hồ Sơ"}
            </button>
          </div>
        </div>

        {/* --- PHẦN 2: KINH NGHIỆM LÀM VIỆC --- */}
        <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-yellow-400">
            <Briefcase /> Kinh nghiệm làm việc
          </h2>

          <div className="space-y-4 mb-8">
            {exps.length === 0 && (
              <div className="p-8 border-2 border-dashed border-slate-800 rounded-2xl text-center text-slate-500">
                Bạn chưa cập nhật kinh nghiệm làm việc nào.
              </div>
            )}
            {exps.map((exp: any) => (
              <div
                key={exp.id}
                className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-start group hover:border-slate-600 transition-colors"
              >
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {exp.position}
                  </h3>
                  <p className="text-blue-400 font-medium">
                    {exp.company_name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-wider">
                    {exp.start_date} tới {exp.end_date || "Hiện tại"}
                  </p>
                  <p className="text-sm text-slate-300 mt-3 whitespace-pre-line leading-relaxed">
                    {exp.description}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteExp(exp.id)}
                  className="text-slate-600 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Xóa kinh nghiệm này"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 mt-8">
            <h3 className="font-bold mb-4 text-sm uppercase text-slate-500">
              Thêm kinh nghiệm mới
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                className="bg-slate-950 border border-slate-700 focus:border-yellow-500 outline-none p-3 rounded-xl transition-colors"
                placeholder="Tên công ty"
                value={newExp.company_name}
                onChange={(e) =>
                  setNewExp({ ...newExp, company_name: e.target.value })
                }
              />
              <input
                className="bg-slate-950 border border-slate-700 focus:border-yellow-500 outline-none p-3 rounded-xl transition-colors"
                placeholder="Vị trí / Chức danh"
                value={newExp.position}
                onChange={(e) =>
                  setNewExp({ ...newExp, position: e.target.value })
                }
              />
              <input
                type="date"
                className="bg-slate-950 border border-slate-700 focus:border-yellow-500 outline-none p-3 rounded-xl transition-colors text-slate-400"
                value={newExp.start_date}
                onChange={(e) =>
                  setNewExp({ ...newExp, start_date: e.target.value })
                }
              />
            </div>
            <textarea
              className="w-full bg-slate-950 border border-slate-700 focus:border-yellow-500 outline-none p-3 rounded-xl mb-4 h-24 custom-scrollbar transition-colors"
              placeholder="Mô tả công việc và thành tựu của bạn..."
              value={newExp.description}
              onChange={(e) =>
                setNewExp({ ...newExp, description: e.target.value })
              }
            />

            <button
              onClick={handleAddExp}
              className="w-full py-4 border-2 border-dashed border-slate-700 hover:border-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/5 rounded-xl flex justify-center items-center gap-2 font-bold transition-all"
            >
              <Plus size={20} /> Thêm Kinh Nghiệm Này
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
