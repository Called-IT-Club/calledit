"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function LoginButton() {
    const { signInWithGoogle, user, signOut, isAdmin } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (user) {
        return (
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity p-1 rounded-full hover:bg-gray-100"
                >
                    <img
                        src={user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://ui-avatars.com/api/?name=${user.user_metadata?.full_name || user.email}&background=random`}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                    />
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-[100]">
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="font-medium text-sm text-gray-900 truncate">{user.user_metadata?.full_name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            <p className={`text-[10px] uppercase font-bold mt-1 ${isAdmin ? 'text-purple-600' : 'text-gray-400'}`}>
                                {isAdmin ? 'Role: Admin' : 'Role: User'}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                signOut();
                            }}
                            className="w-full block text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 bg-white"
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Return null if not logged in - "Make A Call" handles the auth prompt now.
    return null;
}
