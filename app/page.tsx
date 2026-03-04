'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/app/lib/authStore';
import { userApi } from '@/app/services/userApi';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const resolveSession = async () => {
      if (getCurrentUser()) {
        router.replace('/home');
        return;
      }
      try {
        await userApi.refresh();
        router.replace('/home');
      } catch {
        router.replace('/login');
      }
    };

    void resolveSession();
  }, [router]);

  return null;
}
