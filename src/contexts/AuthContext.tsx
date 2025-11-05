import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Visualizador';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isVisualizador: boolean;
  canEdit: boolean; // Admin o Editor
  canDelete: boolean; // Solo Admin
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para cargar el perfil del usuario
  async function loadUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  // Función para actualizar el perfil
  async function refreshProfile() {
    if (user?.id) {
      const profile = await loadUserProfile(user.id);
      setUserProfile(profile);
    }
  }

  // Función para cargar perfil cuando cambia el usuario
  async function handleUserChange(newUser: User | null) {
    if (newUser?.id) {
      try {
        const profile = await loadUserProfile(newUser.id);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading profile for user:', error);
        setUserProfile(null);
      }
    } else {
      setUserProfile(null);
    }
  }

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user?.id) {
          const profile = await loadUserProfile(user.id);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error loading initial user:', error);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();

    // Configurar listener de cambios de autenticación - SIN async operations
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const newUser = session?.user || null;
        setUser(newUser);
        
        // Cargar perfil de manera no bloqueante
        if (newUser?.id) {
          handleUserChange(newUser);
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUserProfile(null);
  }

  // Computed properties para roles
  const isAdmin = userProfile?.role === 'Admin';
  const isEditor = userProfile?.role === 'Editor';
  const isVisualizador = userProfile?.role === 'Visualizador';
  const canEdit = isAdmin || isEditor;
  const canDelete = isAdmin;

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile,
      loading, 
      isAdmin,
      isEditor,
      isVisualizador,
      canEdit,
      canDelete,
      signIn, 
      signUp, 
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}