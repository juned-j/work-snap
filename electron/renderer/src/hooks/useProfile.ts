import { useEffect, useState } from 'react';

import {
  fetchProfile,
  updateProfile,
} from '../services/profileService';

import type {
  ProfileRecord,
} from '../services/profileService';

export const useProfile = (
  userId: string
) => {

  const [profile, setProfile] =
    useState<ProfileRecord | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  /*
  |--------------------------------------------------
  | LOAD PROFILE
  |--------------------------------------------------
  */
  useEffect(() => {

    let mounted = true;

    const loadProfile = async () => {

      if (!userId) return;

      setLoading(true);

      setError('');

      try {

        const data =
          await fetchProfile(userId);

        if (!mounted) return;

        if (data) {

          setProfile(data);

        } else {

          setError(
            'User not found.'
          );

        }

      } catch (err) {

        console.error(err);

        if (mounted) {

          setError(
            'Failed to load profile.'
          );

        }

      } finally {

        if (mounted) {

          setLoading(false);

        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };

  }, [userId]);

  /*
  |--------------------------------------------------
  | SAVE PROFILE
  |--------------------------------------------------
  */
  const saveProfile = async () => {

    if (!profile) return;

    setSaving(true);

    setError('');

    setMessage('');

    try {

      const updated =
        await updateProfile(
          userId,
          {
            name: profile.name,
            email: profile.email,
            role_id: profile.role_id,
          }
        );

      if (!updated) {

        throw new Error();

      }

      setProfile(updated);

      setMessage(
        'Profile updated successfully.'
      );

      setTimeout(() => {
        setMessage('');
      }, 3000);

    } catch (err) {

      console.error(err);

      setError(
        'Unable to update profile.'
      );

    } finally {

      setSaving(false);

    }
  };

  return {
    profile,
    setProfile,
    loading,
    saving,
    message,
    error,
    saveProfile,
  };
};