import { useState, useEffect, useRef } from "react";
import { User, Lock, Camera, Save, Trash2 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "/api";

type ProfileData = {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  full_name: string;
  position: string;
};

const POSITIONS = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "UI/UX Designer",
  "Project Manager",
  "QA Engineer",
  "DevOps Engineer",
  "Data Engineer",
  "Product Manager",
  "Scrum Master",
];

function getAuthHeader() {
  return {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  };
}

export default function SettingsPage() {
  const { addToast } = useToast();
  const { refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/users/profile/`, { headers: getAuthHeader() });
        if (!res.ok) throw new Error("Failed to load profile");
        const data: ProfileData = await res.json();
        setProfile(data);
        setFullName(data.full_name || "");
        setPosition(data.position || "");
        setEmail(data.email || "");
        if (data.avatar) setAvatarPreview(data.avatar);
      } catch (err) {
        console.error(err);
        addToast("error", "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    void loadProfile();
  }, [addToast]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast("error", "Avatar must be under 5 MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      addToast("error", "Avatar must be JPG, PNG, or WebP");
      return;
    }
    // Revoke old preview if it was a blob URL
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleDeleteAvatar = async () => {
    setDeletingAvatar(true);
    try {
      const res = await fetch(`${API_URL}/users/profile/avatar/`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error("Failed to delete avatar");
      setAvatarPreview(null);
      setAvatarFile(null);
      await refreshProfile();
      addToast("success", "Avatar removed");
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to remove avatar");
    } finally {
      setDeletingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("position", position);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await fetch(`${API_URL}/users/profile/`, {
        method: "PATCH",
        headers: getAuthHeader(),
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data: ProfileData = await res.json();
      setProfile(data);
      setAvatarFile(null);
      await refreshProfile();
      addToast("success", "Profile updated successfully");
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast("error", "Passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch(`${API_URL}/users/change-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to change password");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      addToast("success", "Password changed successfully");
    } catch (err) {
      console.error(err);
      addToast("error", err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="page-enter space-y-6">
          <div className="skeleton h-8 w-48 rounded-lg" />
          <div className="skeleton h-64 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-enter space-y-6 max-w-2xl">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-fit">
          {([
            { key: "profile", label: "Profile", icon: User },
            { key: "password", label: "Password", icon: Lock },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === key
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User size={32} className="text-slate-400 dark:text-slate-500" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Change avatar"
                >
                  <Camera size={20} className="text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{profile?.username}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">{profile?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-500">JPG, PNG, or WebP. Max 5 MB.</p>
                  {(avatarPreview || avatarFile) && (
                    <button
                      onClick={handleDeleteAvatar}
                      disabled={deletingAvatar}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                      {deletingAvatar ? "Removing..." : "Remove"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name */}
            <Input
              id="full_name"
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />

            {/* Position */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="position" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Position / Job Title
              </label>
              <div className="relative">
                <input
                  id="position"
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Full Stack Developer"
                  list="positions-list"
                  className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm py-2.5 px-3 outline-none transition-all duration-150"
                />
                <datalist id="positions-list">
                  {POSITIONS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500">Visible to team members</p>
            </div>

            {/* Email (read-only) */}
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              readOnly
              className="opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 dark:text-slate-500 -mt-4">Private — only you can see this</p>

            <div className="flex justify-end">
              <Button variant="primary" size="md" loading={saving} onClick={handleSaveProfile} icon={!saving ? <Save size={14} /> : undefined}>
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <form onSubmit={handleChangePassword} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <Input
              id="current-password"
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Input
              id="new-password"
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              hint="Must be at least 8 characters"
            />
            <Input
              id="confirm-new-password"
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              error={confirmPassword && confirmPassword !== newPassword ? "Passwords do not match" : undefined}
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="md" loading={changingPassword}>
                Change Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
