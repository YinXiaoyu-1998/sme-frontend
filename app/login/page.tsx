'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Layout, Typography, message } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { userApi } from '@/app/services/userApi';
import { getCurrentUser, setCurrentUser } from '@/app/lib/authStore';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isRegister, setIsRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());
  const passwordRules = useMemo(
    () => [
      { required: true, message: '请输入密码' },
      { min: 8, message: '密码至少 8 位' },
      {
        validator: (_: unknown, value?: string) => {
          if (!value) {
            return Promise.resolve();
          }
          const hasUppercase = /[A-Z]/.test(value);
          const hasSymbol = /[^A-Za-z0-9]/.test(value);
          if (!hasUppercase || !hasSymbol) {
            return Promise.reject(new Error('密码需包含至少 1 个大写字母和 1 个符号'));
          }
          return Promise.resolve();
        },
      },
    ],
    [],
  );

  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      if (currentUser) {
        router.replace('/home');
        return;
      }
      try {
        const response = await userApi.refresh();
        if (!isMounted) {
          return;
        }
        setCurrentUserState(response.user);
        router.replace('/home');
      } catch {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, [currentUser, router]);

  const handleToggleMode = () => {
    setIsRegister((prev) => !prev);
    form.resetFields();
  };

  const handleSubmit = async (values: { email: string; password: string; name?: string }) => {
    try {
      setIsSubmitting(true);
      if (isRegister) {
        const response = await userApi.register({
          email: values.email,
          password: values.password,
          name: values.name,
        });
        setCurrentUser(response.user);
        setCurrentUserState(response.user);
        message.success('注册成功');
      } else {
        const response = await userApi.login({
          email: values.email,
          password: values.password,
        });
        setCurrentUserState(response.user);
        message.success('登录成功');
      }
      router.push('/home');
    } catch (error) {
      console.error('Auth failed', error);
      message.error(isRegister ? '注册失败，请稍后重试' : '登录失败，请检查账号密码');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking || currentUser) {
    return null;
  }

  return (
    <Layout
      style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #eef6ff 0%, #eefaf5 100%)',
      }}
    >
      <div style={{ display: 'flex', height: '100%' }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px',
          }}
        >
          <div style={{ maxWidth: 520, textAlign: 'center' }}>
            <Image
              src="/sme_databrain_logo.png"
              alt="SME DataBrain"
              width={360}
              height={360}
              priority
            />
            <Title level={3} style={{ marginTop: 24, color: '#0f4c81' }}>
              企业智脑
            </Title>
            <Text type="secondary">Knowledge Agent for SME</Text>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px',
          }}
        >
          <Card
            title={isRegister ? '注册' : '登录'}
            style={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 16,
              boxShadow: '0 12px 30px rgba(0, 60, 120, 0.12)',
            }}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              {isRegister && (
                <Form.Item
                  label="用户名"
                  name="name"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input placeholder="请输入用户名" />
                </Form.Item>
              )}
              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入正确的邮箱格式' },
                ]}
              >
                <Input placeholder="name@company.com" />
              </Form.Item>
              <Form.Item label="密码" name="password" rules={passwordRules}>
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                block
                style={{ backgroundColor: '#1677ff' }}
              >
                {isRegister ? '注册' : '登录'}
              </Button>
              <Button type="link" block onClick={handleToggleMode} style={{ marginTop: 8 }}>
                {isRegister ? '已有账号？去登录' : '没有账号？注册'}
              </Button>
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                密码需至少 8 位，包含 1 个大写字母和 1 个符号
              </Text>
            </Form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
