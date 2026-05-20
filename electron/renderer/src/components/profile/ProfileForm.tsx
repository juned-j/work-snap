import {
  User,
  Mail,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';

import type {
  ProfileRecord,
} from '../../services/profileService';

interface Props {
  profile: ProfileRecord;
  setProfile: (
    profile: ProfileRecord
  ) => void;
  saving: boolean;
  message: string;
  error: string;
  onSave: () => void;
}

const getRoleName = (
  roleId?: string
) => {

  switch (roleId) {

    case '1':
      return 'Employee';

    case '2':
      return 'Manager';

    case '3':
      return 'Admin';

    case '4':
      return 'Super Admin';

    default:
      return 'User';
  }
};

const ProfileForm = ({
  profile,
  setProfile,
  saving,
  message,
  error,
  onSave,
}: Props) => {

  return (

    <div className="mx-auto max-w-4xl py-6">

      {/* MAIN CARD */}
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)]">

        {/* TOP SECTION */}
        <div className="relative border-b border-slate-100 bg-slate-900 px-8 py-10">

          {/* DECORATION */}
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-slate-800 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">

            {/* AVATAR */}
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 text-4xl font-bold text-white ring-4 ring-white/10">

              {profile.name?.charAt(0)?.toUpperCase() || 'U'}

            </div>

            {/* INFO */}
            <div className="flex-1">

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-3xl font-bold tracking-tight text-white">

                  {profile.name || 'Unknown User'}

                </h1>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-sm">

                  <Shield className="h-3.5 w-3.5" />

                  {getRoleName(profile.role_id)}

                </div>

              </div>

              <p className="mt-3 text-sm text-slate-300">

                Manage your personal information and account settings.

              </p>

            </div>

          </div>

        </div>

        {/* ALERTS */}
        <div className="space-y-4 px-8 pt-6">

          {message && (

            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">

              <CheckCircle2 className="h-5 w-5" />

              {message}

            </div>

          )}

          {error && (

            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">

              <AlertCircle className="h-5 w-5" />

              {error}

            </div>

          )}

        </div>

        {/* FORM SECTION */}
        <div className="grid gap-6 p-8 md:grid-cols-2">

          {/* NAME */}
          <div>

            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">

              <User className="h-4 w-4 text-slate-500" />

              Full Name

            </label>

            <input
              type="text"
              value={profile.name ?? ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  name: e.target.value,
                })
              }
              placeholder="Enter full name"
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm text-slate-900 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
            />

          </div>

          {/* EMAIL */}
          <div>

            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">

              <Mail className="h-4 w-4 text-slate-500" />

              Email Address

            </label>

            <input
              type="email"
              value={profile.email ?? ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  email: e.target.value,
                })
              }
              placeholder="Enter email address"
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm text-slate-900 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
            />

          </div>

          {/* ROLE */}
          <div className="md:col-span-2">

            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">

              <Shield className="h-4 w-4 text-slate-500" />

              Account Role

            </label>

            <div className="relative">

              <select
                value={profile.role_id ?? ''}
                disabled
                className="h-14 w-full cursor-not-allowed appearance-none rounded-2xl border border-slate-200 bg-slate-100 px-5 pr-14 text-sm font-medium text-slate-500 outline-none"
              >

                <option value="">
                  Select Role
                </option>

                <option value="1">
                  Employee
                </option>

                <option value="2">
                  Manager
                </option>

                <option value="3">
                  Admin
                </option>

                <option value="4">
                  Super Admin
                </option>

              </select>

              <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center">

                <Lock className="h-4 w-4 text-slate-400" />

              </div>

            </div>

            <p className="mt-2 text-xs text-slate-500">
              Role access is controlled by the administrator.
            </p>

          </div>

        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50 px-8 py-6 md:flex-row md:items-center md:justify-between">

          <div>

            <h3 className="text-sm font-semibold text-slate-900">
              Save Profile Changes
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Your updated information will be securely saved.
            </p>

          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <Save className="h-4 w-4" />

            {saving
              ? 'Saving Changes...'
              : 'Save Changes'}

          </button>

        </div>

      </div>

    </div>
  );
};

export default ProfileForm;