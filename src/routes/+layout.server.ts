import type { LayoutServerLoad } from './$types';
import { getSessionUser } from '$lib/auth/session';

export const load: LayoutServerLoad = async (event) => {
  const user = await getSessionUser(event);

  return {
    user
  };
};
