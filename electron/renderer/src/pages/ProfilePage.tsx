import ProfileForm from '../components/profile/ProfileForm';

import { useProfile }
  from '../hooks/useProfile';

const ProfilePage = ({
  userId,
}: {
  userId: string;
}) => {

  const {
    profile,
    setProfile,
    loading,
    saving,
    message,
    error,
    saveProfile,
  } = useProfile(userId);

  /*
  |------------------------------------------------------------------
  | LOADING STATE
  |------------------------------------------------------------------
  */
  if (loading) {

    return (

      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">

        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />

      </div>

    );
  }

  /*
  |------------------------------------------------------------------
  | USER NOT FOUND
  |------------------------------------------------------------------
  */
  if (!profile) {

    return (

      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">

        User not found.

      </div>

    );
  }

  /*
  |------------------------------------------------------------------
  | DISABLE ROLE CHANGE
  |------------------------------------------------------------------
  */
  const updatedProfile = {
    ...profile,

    // role readonly
    roleDisabled: true,
  };

  return (

    <ProfileForm
      profile={updatedProfile}
      setProfile={setProfile}
      saving={saving}
      message={message}
      error={error}
      onSave={saveProfile}
    />

  );
};

export default ProfilePage;