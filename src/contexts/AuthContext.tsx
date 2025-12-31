"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAdmin: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithApple: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await checkAdminRole(session.user);
            }
            setIsLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await checkAdminRole(session.user);
            } else {
                setIsAdmin(false);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const checkAdminRole = async (user: any) => {
        try {
            if (!user) {
                setIsAdmin(false);
                return;
            }

            // Read from cached metadata
            const cachedRole = user.user_metadata?.role;

            console.log('Admin Check (from cache):', {
                userId: user.id,
                role: cachedRole,
                isAdmin: cachedRole === 'admin'
            });

            if (cachedRole) {
                setIsAdmin(cachedRole === 'admin');
            } else {
                // If no cached role, sync from database
                console.log('No cached role found, syncing from database...');
                setIsAdmin(false); // Default to false until synced
                await refreshRole();
            }
        } catch (err) {
            console.error('Error checking role:', err);
            setIsAdmin(false);
        }
    };

    const refreshRole = async () => {
        try {
            const response = await fetch('/api/auth/sync-role', { method: 'POST' });
            const data = await response.json();

            if (data.success) {
                console.log('Role refreshed from database:', data.role);
                setIsAdmin(data.role === 'admin');

                // Trigger auth state refresh to update user metadata
                await supabase.auth.refreshSession();
            }
        } catch (err) {
            console.error('Error refreshing role:', err);
        }
    };

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const signInWithApple = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'apple',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            // Visual feedback
            // window.alert("Signing out... please wait.");

            // 1. Force local state clear
            setUser(null);
            setSession(null);
            setIsAdmin(false);

            // 2. Nuke cookies manually (Robust Version)
            document.cookie.split(";").forEach((c) => {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            // 3. Clear LocalStorage & SessionStorage
            if (typeof window !== 'undefined') {
                window.localStorage.clear();
                window.sessionStorage.clear();

                // 4. Force Hard Reload
                window.location.href = '/';
            }
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            isLoading,
            isAdmin,
            signInWithGoogle,
            signInWithApple,
            signOut,
            refreshRole
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
