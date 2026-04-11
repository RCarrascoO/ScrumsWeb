import { useEffect, useState } from 'react';
import { authApi } from './api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get('access_token');
        if (token) {
          const res = await authApi.me();
          setUser(res.data);
        }
      } catch (error) {
        Cookies.remove('access_token');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (credentials: any) => {
    const res = await authApi.login(credentials);
    if (res.data.access_token) {
      Cookies.set('access_token', res.data.access_token);
      const userRes = await authApi.me();
      setUser(userRes.data);
      router.push('/dashboard');
    }
  };

  const logout = () => {
    Cookies.remove('access_token');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, login, logout };
}