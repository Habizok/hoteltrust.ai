import { cookies } from 'next/headers';

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    return !!session?.value;
  } catch (error) {
    return false;
  }
}
