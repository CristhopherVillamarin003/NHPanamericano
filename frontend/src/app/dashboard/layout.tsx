'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { getSessionCookie } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let bc: BroadcastChannel;
    try {
      bc = new BroadcastChannel('auth_sync');
    } catch (e) {
      // Fallback si no soporta BroadcastChannel
      if (!getSessionCookie('access_token')) {
        router.push('/auth/login');
      } else {
        setAuthorized(true);
      }
      return;
    }

    const token = getSessionCookie('access_token');

    bc.onmessage = (event) => {
      if (event.data === 'request_token') {
        const currentToken = getSessionCookie('access_token');
        const currentEmail = getSessionCookie('user_email');
        if (currentToken) {
          bc.postMessage({ type: 'send_token', token: currentToken, email: currentEmail });
        }
      } else if (event.data.type === 'send_token' && !getSessionCookie('access_token')) {
        sessionStorage.setItem('access_token', event.data.token);
        if (event.data.email) sessionStorage.setItem('user_email', event.data.email);
        if (isMounted) setAuthorized(true);
      } else if (event.data === 'logout') {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user_email');
        router.push('/auth/login');
      }
    };

    if (!token) {
      bc.postMessage('request_token');
      
      const timeoutId = setTimeout(() => {
        if (!getSessionCookie('access_token') && isMounted) {
           router.push('/auth/login');
        }
      }, 500);
      
      return () => { isMounted = false; clearTimeout(timeoutId); bc.close(); };
    } else {
      setAuthorized(true);
      return () => { isMounted = false; bc.close(); };
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="data-table-spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <AppSidebar />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
