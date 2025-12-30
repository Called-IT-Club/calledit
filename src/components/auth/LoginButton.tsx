"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function LoginButton() {
    const { signInWithGoogle, signInWithApple, signInAsGuest, user, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const handleGuestLogin = async () => {
        try {
            await signInAsGuest();
        } catch (error) {
            console.error('Guest login failed:', error);
        }
    };

    if (user) {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <img
                        src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border border-gray-200"
                    />
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-primary flex items-center gap-2"
            >
                <span>Sign In</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 flex flex-col gap-1 p-2">
                    <button
                        onClick={() => signInWithGoogle()}
                        className="btn bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2 w-full"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                        <span>Sign in with Google</span>
                    </button>
                    <button
                        onClick={() => signInWithApple()}
                        className="btn bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2 w-full"
                    >
                        <img src="https://www.svgrepo.com/show/445136/apple.svg" className="w-4 h-4" alt="Apple" />
                        <span>Sign in with Apple</span>
                    </button>
                    <div className="h-px bg-gray-100 my-1" />
                    <button
                        onClick={handleGuestLogin}
                        className="btn bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center gap-2 w-full text-sm"
                    >
                        Continue as Guest 👤
                    </button>
                </div>
            )}
        </div>
    );
}
