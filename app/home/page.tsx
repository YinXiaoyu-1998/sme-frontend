'use client';

import { useEffect, useState } from 'react';
import { Avatar, Button, Dropdown, Layout, message, Popconfirm } from 'antd';
import type { MenuProps } from 'antd';
import { useRouter } from 'next/navigation';
import { DeleteOutlined } from '@ant-design/icons';
import DataCenterSider from '@/app/components/DataCenterSider';
import ChatPanel from '@/app/components/ChatPanel';
import { getCurrentUser } from '@/app/lib/authStore';
import { chatApi } from '@/app/services/chatApi';
import { userApi } from '@/app/services/userApi';

const { Header } = Layout;

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());
  const [isChecking, setIsChecking] = useState(true);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const [chatResetKey, setChatResetKey] = useState(0);

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

  const handleClearChat = async () => {
    if (!currentUser) {
      return;
    }

    try {
      setIsClearingChat(true);
      const result = await chatApi.clearHistory(currentUser.id);
      setChatResetKey((value) => value + 1);
      message.success(`已清空 ${result.deletedMessages} 条聊天记录`);
    } catch (error) {
      console.error('Clear chat failed', error);
      message.error('清空聊天失败，请重试');
    } finally {
      setIsClearingChat(false);
    }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Popconfirm
            title="清空当前聊天？"
            description="会删除数据库中的聊天记录和生成文件记录，上传的数据文件会保留。"
            okText="清空"
            cancelText="取消"
            okButtonProps={{ danger: true, loading: isClearingChat }}
            onConfirm={handleClearChat}
          >
            <Button danger icon={<DeleteOutlined />} loading={isClearingChat}>
              清空聊天
            </Button>
          </Popconfirm>
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
        </div>
      </Header>
      <Layout style={{ flex: 1 }}>
        <DataCenterSider />
        <ChatPanel resetKey={chatResetKey} />
      </Layout>
    </Layout>
  );
}
