import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, CounselorState } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoggedIn: boolean;
  loginAs: (roleOrEmail: string) => void;
  logout: () => void;
  updateCounselorState: (state: CounselorState) => void;
}

const PRESET_USERS: Record<string, User> = {
  admin: {
    id: 'user-admin-01',
    name: 'Dr. S. K. Mehta (Main Admin)',
    email: 'admin@svkm.ac.in',
    username: 'admin',
    role: 'MAIN_ADMIN',
    phone: '+91 2562 281456'
  },
  registrar: {
    id: 'user-registrar-01',
    name: 'Prof. R. V. Patil (Registrar)',
    email: 'registrar@svkm.ac.in',
    username: 'registrar',
    role: 'REGISTRAR',
    phone: '+91 2562 281450'
  },
  counselor_c: {
    id: 'user-counselor-c',
    name: 'Prof. Chetan Deshmukh (Counselor C - STME)',
    email: 'counselor.c@svkm.ac.in',
    username: 'counselor_c',
    role: 'COUNSELOR',
    phone: '+91 9820011003',
    counselor: {
      counselor_id: 'counselor-stme-c',
      current_state: 'AVAILABLE',
      phone_number: '+91 9820011003'
    }
  },
  counselor_d: {
    id: 'user-counselor-d',
    name: 'Prof. Deepali Kulkarni (Counselor D - STME)',
    email: 'counselor.d@svkm.ac.in',
    username: 'counselor_d',
    role: 'COUNSELOR',
    phone: '+91 9820011004',
    counselor: {
      counselor_id: 'counselor-stme-d',
      current_state: 'AVAILABLE',
      phone_number: '+91 9820011004'
    }
  },
  counselor_e: {
    id: 'user-counselor-e',
    name: 'Prof. Eknath Shinde (Counselor E - STME)',
    email: 'counselor.e@svkm.ac.in',
    username: 'counselor_e',
    role: 'COUNSELOR',
    phone: '+91 9820011005',
    counselor: {
      counselor_id: 'counselor-stme-e',
      current_state: 'AVAILABLE',
      phone_number: '+91 9820011005'
    }
  },
  counselor_a: {
    id: 'user-counselor-a',
    name: 'Prof. Anita Sharma (Counselor A - STME)',
    email: 'counselor.a@svkm.ac.in',
    username: 'counselor_a',
    role: 'COUNSELOR',
    phone: '+91 9820011001',
    counselor: {
      counselor_id: 'counselor-stme-a',
      current_state: 'BUSY',
      phone_number: '+91 9820011001'
    }
  },
  counselor_b: {
    id: 'user-counselor-b',
    name: 'Prof. Bharat Patil (Counselor B - STME)',
    email: 'counselor.b@svkm.ac.in',
    username: 'counselor_b',
    role: 'COUNSELOR',
    phone: '+91 9820011002',
    counselor: {
      counselor_id: 'counselor-stme-b',
      current_state: 'BUSY',
      phone_number: '+91 9820011002'
    }
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('svkm_user');
    return saved ? JSON.parse(saved) : PRESET_USERS.admin;
  });

  const loginAs = (keyOrIdentifier: string) => {
    const clean = keyOrIdentifier.trim().toLowerCase();
    
    // Check exact key in PRESET_USERS
    if (PRESET_USERS[clean]) {
      const selected = PRESET_USERS[clean];
      setUser(selected);
      localStorage.setItem('svkm_user', JSON.stringify(selected));
      localStorage.setItem('svkm_auth_token', `mock_token_${selected.id}`);
      return;
    }

    // Check by email, username, or ID across PRESET_USERS
    const foundPreset = Object.values(PRESET_USERS).find(u => 
      u.email.toLowerCase() === clean || 
      (u.username && u.username.toLowerCase() === clean) ||
      (u.counselor && u.counselor.counselor_id.toLowerCase() === clean) ||
      u.id.toLowerCase() === clean
    );

    if (foundPreset) {
      setUser(foundPreset);
      localStorage.setItem('svkm_user', JSON.stringify(foundPreset));
      localStorage.setItem('svkm_auth_token', `mock_token_${foundPreset.id}`);
      return;
    }

    // Fallback: check localStorage registered counselors or users
    try {
      const stored = JSON.parse(localStorage.getItem('svkm_registered_users') || '[]');
      const match = stored.find((u: any) => 
        (u.email && u.email.toLowerCase() === clean) || 
        (u.id && u.id.toLowerCase() === clean)
      );
      if (match) {
        const uObj: User = {
          id: match.id,
          name: match.name,
          email: match.email,
          username: match.email.split('@')[0],
          role: match.role === 'COUNSELOR' ? 'COUNSELOR' : match.role === 'REGISTRAR' ? 'REGISTRAR' : 'MAIN_ADMIN',
          phone: match.phone,
          counselor: match.role === 'COUNSELOR' ? {
            counselor_id: match.id,
            current_state: 'AVAILABLE',
            phone_number: match.phone
          } : undefined
        };
        setUser(uObj);
        localStorage.setItem('svkm_user', JSON.stringify(uObj));
        localStorage.setItem('svkm_auth_token', `mock_token_${uObj.id}`);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    const fallback = clean.includes('reg') ? PRESET_USERS.registrar : clean.includes('cns') || clean.includes('counselor') ? PRESET_USERS.counselor_c : PRESET_USERS.admin;
    setUser(fallback);
    localStorage.setItem('svkm_user', JSON.stringify(fallback));
    localStorage.setItem('svkm_auth_token', `mock_token_${fallback.id}`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('svkm_user');
    localStorage.removeItem('svkm_auth_token');
  };

  const updateCounselorState = (state: CounselorState) => {
    if (user && user.counselor) {
      const updated = {
        ...user,
        counselor: {
          ...user.counselor,
          current_state: state
        }
      };
      setUser(updated);
      localStorage.setItem('svkm_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'MAIN_ADMIN',
        isLoggedIn: !!user,
        loginAs,
        logout,
        updateCounselorState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
