import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/endpoints/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('auth_user')) || null;
    } catch {
      return null;
    }
  });

  const [activeBusiness, setActiveBusiness] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('active_business')) || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const selectDefaultBusiness = (userData) => {
    if (userData?.businesses && userData.businesses.length > 0) {
      const currentActiveId = localStorage.getItem('active_business_id');
      const found = userData.businesses.find((b) => String(b.id) === String(currentActiveId));
      const target = found || userData.businesses[0];

      localStorage.setItem('active_business_id', target.id);
      localStorage.setItem('active_business', JSON.stringify(target));
      setActiveBusiness(target);
    }
  };

  // Verifikasi token saat mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setInitialized(true);
      return;
    }
    authApi
      .me()
      .then((res) => {
        const u = res.data?.data;
        if (u) {
          setUser(u);
          localStorage.setItem('auth_user', JSON.stringify(u));
          selectDefaultBusiness(u);
        }
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('active_business_id');
        localStorage.removeItem('active_business');
        setUser(null);
        setActiveBusiness(null);
      })
      .finally(() => setInitialized(true));
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { token, user: u } = res.data.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(u));
      setUser(u);

      // Ambil profile lengkap untuk bisnis
      try {
        const meRes = await authApi.me();
        const fullUser = meRes.data?.data;
        if (fullUser) {
          setUser(fullUser);
          localStorage.setItem('auth_user', JSON.stringify(fullUser));
          selectDefaultBusiness(fullUser);
        }
      } catch (_) {
        // Abaikan jika me gagal
      }

      return { success: true, user: u };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Email atau password salah.',
        errors: err.response?.data?.errors || {},
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword || data.password_confirmation,
        phone: data.phone || null,
      });

      const responseData = res.data?.data;
      if (responseData?.token && responseData?.user) {
        localStorage.setItem('auth_token', responseData.token);
        localStorage.setItem('auth_user', JSON.stringify(responseData.user));
        setUser(responseData.user);
      }

      return { success: true, message: res.data?.message, data: responseData };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Pendaftaran gagal.',
        errors: err.response?.data?.errors || {},
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // silent
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('active_business_id');
      localStorage.removeItem('active_business');
      setUser(null);
      setActiveBusiness(null);
    }
  }, []);

  const switchBusiness = useCallback((business) => {
    localStorage.setItem('active_business_id', business.id);
    localStorage.setItem('active_business', JSON.stringify(business));
    setActiveBusiness(business);
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        activeBusiness,
        loading,
        initialized,
        isAuthenticated,
        login,
        register,
        logout,
        switchBusiness,
        setUser,
        setActiveBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
