"use client";

import { useEffect, useState } from "react";
import api from "@/app/axios";
import toast from "react-hot-toast";

type updateObj = {
  name?: string;
  profile?: {
    bio?: string;
    interests?: string[];
    profile_picture?: string;
  };
};
// TODO: add back button & complete upload photo and interests logic
export default function ProfilePage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [profilePicture, setProfilePicture] = useState<string | Blob | null>(null);
  const [editMode, setEditMode] = useState<{ field: string | null }>({ field: null });
  const [tempValues, setTempValues] = useState<{ name: string; bio: string; interests: string[]; profilePicture: string | Blob | null }>({
    name: "",
    bio: "",
    interests: [] as string[],
    profilePicture: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/v1/auth/me");
        console.log("🚀 ~ fetchProfile ~ response:", response);
        const user = response.data.user;
        setName(user.name || "");
        setBio(user.profile?.bio || "");
        setInterests(user.profile?.interests || []);
        setProfilePicture(user.profile?.profile_picture || null);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile.");
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = (field: string) => {
    setEditMode({ field });
    setTempValues({ name, bio, interests, profilePicture });
  };

  const handleCancel = () => {
    setEditMode({ field: null });
  };

  const handleSave = async (field: string) => {
    setLoading(true);
    const toastId = toast.loading("Loading...");
    try {
      // Dynamically create the payload with only the changed fields
      const updatedProfile: updateObj = { profile: {} };
      if (field === "name") updatedProfile["name"] = tempValues.name;
      else if (field === "bio") {
        updatedProfile.profile!.bio = tempValues.bio;
      } else if (field === "interests") {
        updatedProfile.profile!.interests = tempValues.interests;
      } else if (field === "profilePicture") {
        const formData = new FormData();
        formData.append("profile_picture", tempValues.profilePicture as string);
        const response = await api.patch("/api/v1/users/me", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.data.profile?.profile_picture) setProfilePicture(response.data.data.profile.profile_picture);
        toast.success("Profile picture updated successfully!");
        return;
      }

      const response = await api.patch("/api/v1/users/me", updatedProfile);

      // Update local state with new values
      if (field === "name") setName(response.data.data.name);
      else if (field === "bio") setBio(response.data.data.profile.bio);
      else if (field === "interests") setInterests(response.data.data.profile.interests);
      else if (field === "profilePicture") setProfilePicture(response.data.data.profile.profile_picture);

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setEditMode({ field: null });
      setLoading(false);
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-2xl bg-background shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-foreground">Profile</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-foreground">Name</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editMode.field === "name" ? tempValues.name : name}
              onChange={(e) => setTempValues((prev) => ({ ...prev, name: e.target.value }))}
              disabled={editMode.field !== "name"}
              className="bg-background text-foreground w-full border rounded-lg px-4 py-2"
            />
            {editMode.field === "name" ? (
              <>
                <button onClick={() => handleSave("name")} disabled={loading} className="bg-green-600 text-white py-1 px-4 rounded-lg hover:bg-green-700">
                  Save
                </button>
                <button onClick={handleCancel} className="bg-gray-600 text-white py-1 px-4 rounded-lg hover:bg-gray-700">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => handleEdit("name")} className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700">
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-foreground">Bio</label>
          <div className="flex items-center gap-2">
            <textarea
              value={editMode.field === "bio" ? tempValues.bio : bio}
              onChange={(e) => setTempValues((prev) => ({ ...prev, bio: e.target.value }))}
              disabled={editMode.field !== "bio"}
              className="bg-background text-foreground w-full border rounded-lg px-4 py-2"
              rows={4}
            />
            {editMode.field === "bio" ? (
              <>
                <button onClick={() => handleSave("bio")} disabled={loading} className="bg-green-600 text-white py-1 px-4 rounded-lg hover:bg-green-700">
                  Save
                </button>
                <button onClick={handleCancel} className="bg-gray-600 text-white py-1 px-4 rounded-lg hover:bg-gray-700">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => handleEdit("bio")} className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700">
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-foreground">Interests</label>
          {interests.map((interest, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={editMode.field === "interests" ? tempValues.interests[index] : interest}
                onChange={(e) => {
                  const newInterests = [...tempValues.interests];
                  newInterests[index] = e.target.value;
                  setTempValues((prev) => ({ ...prev, interests: newInterests }));
                }}
                disabled={editMode.field !== "interests"}
                className="bg-background text-foreground w-full border rounded-lg px-4 py-2"
              />
              {editMode.field === "interests" && (
                <button
                  onClick={() =>
                    setTempValues((prev) => ({
                      ...prev,
                      interests: prev.interests.filter((_, i) => i !== index),
                    }))
                  }
                  className="text-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {editMode.field === "interests" ? (
            <button onClick={() => setTempValues((prev) => ({ ...prev, interests: [...prev.interests, ""] }))} className="text-blue-500 mt-2">
              Add Interest
            </button>
          ) : (
            <button onClick={() => handleEdit("interests")} className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700">
              Edit
            </button>
          )}
          {editMode.field === "interests" && (
            <div className="mt-2 flex gap-4">
              <button onClick={() => handleSave("interests")} disabled={loading} className="bg-green-600 text-white py-1 px-4 rounded-lg hover:bg-green-700">
                Save
              </button>
              <button onClick={handleCancel} className="bg-gray-600 text-white py-1 px-4 rounded-lg hover:bg-gray-700">
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-foreground">Profile Picture</label>
          {profilePicture && <img src={profilePicture as string} alt="Profile" className="w-32 h-32 rounded-full mb-4" />}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const fileUrl = URL.createObjectURL(file);
                setTempValues((prev) => ({ ...prev, profilePicture: file }));
                setProfilePicture(fileUrl);
              }
            }}
            className="bg-background text-foreground w-full border rounded-lg px-4 py-2"
            disabled={editMode.field !== "profilePicture"}
          />
          {editMode.field === "profilePicture" ? (
            <div className="mt-2 flex gap-4">
              <button
                onClick={() => handleSave("profilePicture")}
                disabled={loading}
                className="bg-green-600 text-white py-1 px-4 rounded-lg hover:bg-green-700"
              >
                Save
              </button>
              <button onClick={handleCancel} className="bg-gray-600 text-white py-1 px-4 rounded-lg hover:bg-gray-700">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => handleEdit("profilePicture")} className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700">
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
