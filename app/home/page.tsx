'use client';

import { useEffect, useState } from 'react';
import { Avatar, Dropdown, Layout, message } from 'antd';
import type { MenuProps } from 'antd';
import { useRouter } from 'next/navigation';
import DataCenterSider from '@/app/components/DataCenterSider';
import ChatPanel from '@/app/components/ChatPanel';
import { getCurrentUser } from '@/app/lib/authStore';
import { userApi } from '@/app/services/userApi';

const { Header } = Layout;

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const ensureSession = async () => {
      if (currentUser) {
        if (isMounted) {
          setIsChecking(false);
        }
        return;
      }
      try {
        const response = await userApi.refresh();
        if (!isMounted) {
          return;
        }
        setCurrentUserState(response.user);
        setIsChecking(false);
      } catch {
        if (isMounted) {
          router.replace('/login');
        }
      }
    };

    void ensureSession();

    return () => {
      isMounted = false;
    };
  }, [currentUser, router]);

  if (isChecking || !currentUser) {
    return null;
  }

  const displayName = currentUser.name?.trim() || currentUser.email;
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await userApi.logout();
    } catch (error) {
      console.error('Logout failed', error);
      message.error('退出登录失败，请重试');
      return;
    }
    setCurrentUserState(null);
    message.success('已退出登录');
    router.replace('/login');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'name',
      label: <span style={{ color: '#0f4c81', fontWeight: 600 }}>{displayName}</span>,
      disabled: true,
    },
    {
      key: 'email',
      label: <span style={{ color: '#4b5563' }}>{currentUser.email}</span>,
      disabled: true,
    },
    {
      key: 'logout',
      label: <span style={{ color: '#1677ff' }}>退出登录</span>,
      onClick: () => {
        void handleLogout();
      },
    },
  ];

  return (
    <Layout style={{ height: '100vh' }}>
      <Header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5f0ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}
      >
        <span style={{ color: '#0f4c81', fontSize: 22, fontWeight: 700 }}>企业智脑</span>
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <Avatar
            style={{
              cursor: 'pointer',
              backgroundColor: '#22c55e',
              color: '#ffffff',
              fontWeight: 700,
            }}
            size={40}
          >
            {avatarInitial}
          </Avatar>
        </Dropdown>
      </Header>
      <Layout style={{ flex: 1 }}>
        <DataCenterSider />
        <ChatPanel />
      </Layout>
    </Layout>
  );
}
