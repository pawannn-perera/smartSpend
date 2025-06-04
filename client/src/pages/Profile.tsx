import React, { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User, Mail, Save, Camera, Trash2 } from "lucide-react";

const Profile: React.FC = () => {
  const { user, updateProfile, removeAvatar } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [avatar, setAvatar] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleRemoveAvatar = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await removeAvatar();
      setAvatar(null);
      setMessage({ type: "success", text: "Avatar removed." });
    } catch {
      setMessage({ type: "error", text: "Failed to remove avatar." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (avatar) formData.append("avatar", avatar);
      await updateProfile(formData);
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch {
      setMessage({ type: "error", text: "Failed to remove avatar." });
    } finally {
      setLoading(false);
    }
  };

  const avatarUrl = avatar
    ? URL.createObjectURL(avatar)
    : user?.avatar && user.avatar !== ""
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=EEE&color=888`;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-800">Your Profile</h1>
        <p className="text-md text-slate-600 mt-2">
          Manage your personal information and preferences.
        </p>
      </header>

      <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <img
              src={avatarUrl}
              alt="User avatar"
              loading="lazy"
              className="w-32 h-32 rounded-full object-cover ring-4 ring-slate-200 group-hover:ring-indigo-400 transition-all duration-300 ease-in-out shadow-lg"
            />
            <div className="absolute bottom-1 right-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-slate-100 p-2 rounded-full shadow-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="Upload new image"
              >
                <Camera className="w-5 h-5 text-slate-600" />
              </button>
              {(user?.avatar || avatar) && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="bg-white hover:bg-slate-100 p-2 rounded-full shadow-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  title="Remove image"
                >
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          {loading && <p className="text-sm text-indigo-600">Updating avatar...</p>}
        </div>

        {/* Feedback Message */}
        {message.text && (
          <div
            className={`text-sm rounded-lg p-4 border-l-4 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-500"
                : "bg-red-50 text-red-700 border-red-500"
            }`}
            role="alert"
          >
            <p className="font-medium">{message.type === "success" ? "Success" : "Error"}</p>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block mb-1.5 text-sm font-medium text-slate-700">
              Full Name
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                placeholder="e.g. Jane Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-slate-700">
              Email Address
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                readOnly
                className="form-input block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed text-slate-500 sm:text-sm focus:ring-0 focus:border-slate-300"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              <Save className="w-5 h-5" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;