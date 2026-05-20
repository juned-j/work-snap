import { supabase } from '../api/supabase';

export interface ProfileRecord {
  id: string;
  name?: string;
  email?: string;
  role_id?: string;
}

/*
|--------------------------------------------------------------------------
| FETCH USER FROM USERS TABLE
|--------------------------------------------------------------------------
*/
export const fetchProfile = async (
  userId?: string
): Promise<ProfileRecord | null> => {

  if (!userId) return null;

  try {

    const { data, error } =
      await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role_id
        `)
        .eq('id', userId)
        .single();

    if (error) {

      console.error(
        'Fetch user error:',
        error
      );

      return null;
    }

    console.log(
      'Fetched user:',
      data
    );

    return data;

  } catch (err) {

    console.error(
      'Unexpected fetch error:',
      err
    );

    return null;
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE USER
|--------------------------------------------------------------------------
*/
export const updateProfile = async (
  userId: string,
  updates: Partial<ProfileRecord>
): Promise<ProfileRecord | null> => {

  if (!userId) return null;

  try {

    const { error } =
      await supabase
        .from('users')
        .update({
          name: updates.name,
          email: updates.email,
          role_id: updates.role_id,
        })
        .eq('id', userId);

    if (error) {

      console.error(
        'Update user error:',
        error
      );

      return null;
    }

    /*
    |--------------------------------------------------------------------------
    | RETURN UPDATED USER
    |--------------------------------------------------------------------------
    */
    return await fetchProfile(userId);

  } catch (err) {

    console.error(
      'Unexpected update error:',
      err
    );

    return null;
  }
};