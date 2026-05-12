import React, { useEffect, useState } from 'react';
import { fetchProfile, updateProfile } from '../services/profileService';
import type { ProfileRecord } from '../services/profileService';

const ProfilePage = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const data = await fetchProfile(userId);
      setProfile(data);
    };

    if (userId) loadProfile();
  }, [userId]);

  const handleSave = async () => {
    if (!profile || !userId) return;
    setSaving(true);
    const updated = await updateProfile(userId, {
      name: profile.name,
      email: profile.email,
      role: profile.role,
    });
    setProfile(updated);
    setSaving(false);
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-900">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {profile ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Name</span>
              <input
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                value={profile.name ?? ''}
                onChange={(event) => setProfile({ ...profile, name: event.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                value={profile.email ?? ''}
                onChange={(event) => setProfile({ ...profile, email: event.target.value })}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Role</span>
            <input
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              value={profile.role ?? 'employee'}
              onChange={(event) => setProfile({ ...profile, role: event.target.value })}
            />
          </label>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      ) : (
        <p className="text-slate-600">Loading profile...</p>
      )}
    </div>
  );
};

export default ProfilePage;