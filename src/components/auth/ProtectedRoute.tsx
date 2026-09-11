import React from 'react';
import { useAuth } from '../../security/authContext';
import { AuthScreen } from './AuthScreen';
import { Shield, RefreshCw } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // 1. Loading screen while resolving authoritative session state (prevents authentication flash)
  if (loading) {
    return (
      <div 
        id="nexa-auth-loading-gate"
        className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100"
      >
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 animate-pulse">
            <Shield className="w-8 h-8" />
          </div>
          <RefreshCw className="w-20 h-20 text-blue-500/40 animate-spin absolute" />
        </div>
        <h2 className="text-base font-bold tracking-tight text-white mb-1">
          NEXA Secure Gatekeeper
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Verifying cryptographic session attestation...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated user -> Show Sign In / Sign Up Gatekeeper
  if (!isAuthenticated || !user) {
    return <AuthScreen />;
  }

  // 3. Authenticated user -> Render Protected NEXA Workspace
  return <>{children}</>;
};
