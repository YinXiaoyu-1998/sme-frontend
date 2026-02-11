'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Input, List, Button, message as antMessage } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import type { ChatMessage } from '@/app/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // 引入表格插件
const { Content } = Layout;

// type ChatPanelProps = {
//   messages: ChatMessage[];
//   onSend: (value: string) => void;
// };

export default function ChatPanel({ currentFileId, setCurrentFileId }: { currentFileId: string | null, setCurrentFileId: (fileId: string | null) => void }) {
  const backendUrl = process.env.NEXT_PUBLIC_SME_BACKEND_URL;
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: '您好！我是企业智脑。请上传 Excel 或 PDF 文件，我会帮您分析数据。' },
  ]);
  // ... 状态定义 ...
  const [loading, setLoading] = useState(false); // 增加一个 loading 状态
  const [inputValue, setInputValue] = useState('');
  const [chatId, setChatId] = useState<string | null>('2026-02-11');
  // === 2. 加载历史记录 ===
  const fetchHistory = async (chatId: string) => {
    try {
        const res = await fetch(`${backendUrl}/chat/history?chatId=${chatId}`);
        const history = await res.json();
        // 数据库里的字段是 role/content，跟我们需要的一致
        setMessages(history);
    } catch (e) {
        console.error("加载历史失败", e);
    }
  };

  useEffect(() => {
    if (chatId) {
      fetchHistory(chatId);
    }
  }, [chatId]);
  const handleChat = async (value: string) => {
    if (!value.trim()) return;

    // 1. 先把用户的消息显示在界面上
    const newMessages = [...messages, { role: 'user', content: value }];
    setMessages(newMessages as ChatMessage[]);
    setInputValue('');
    setLoading(true); // 开启加载转圈

    try {
      // 2. 发送请求给 NestJS

      const res = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: value,fileId: currentFileId }),
      });

      const data = await res.json();
      console.log("Test2025 data", data);
      // 3. 把 AI 的回答追加到列表
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: data.answer || '出错了，没收到回答' },
      ]);
    } catch (error) {
      antMessage.error('网络请求失败');
    } finally {
      setLoading(false); // 关闭加载
    }
  };

  return (
    <Layout>
      <Content style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
          <List
            dataSource={messages}
            split={false}
            renderItem={(item) => (
              <List.Item style={{ display: 'block', marginBottom: '10px' }}>
                <div
                  style={{
                    textAlign: item.role === 'user' ? 'right' : 'left',
                  }}
                >
                  <div style={{ marginBottom: '5px', color: '#999', fontSize: '12px' }}>
                    {item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}{' '}
                    {item.role === 'user' ? '我' : 'AI 助手'}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '10px 15px',
                      borderRadius: '8px',
                      backgroundColor: item.role === 'user' ? '#1677ff' : '#fff',
                      color: item.role === 'user' ? '#fff' : '#333',
                      maxWidth: '70%',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    }}
                  >
                    {/* 使用 ReactMarkdown 渲染内容 */}
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} // 启用表格支持
                      components={{
                        // 可选：在这里自定义某些元素的样式
                        // 比如强制让表格有边框
                        table: ({node, ...props}) => <table style={{borderCollapse: 'collapse', width: '100%'}} {...props} />,
                        th: ({node, ...props}) => <th style={{border: '1px solid #ddd', padding: '8px', background: '#f2f2f2'}} {...props} />,
                        td: ({node, ...props}) => <td style={{border: '1px solid #ddd', padding: '8px'}} {...props} />
                      }}
                    >
                      {item.content}
                    </ReactMarkdown>
                    {/* {item.content} */}
                  </span>
                </div>
              </List.Item>
            )}
          />
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px' }}>
          <Input.Search
              placeholder="请输入您的问题..."
              enterButton={<Button type="primary" loading={loading} icon={<SendOutlined />}>发送</Button>}
              size="large"
              onSearch={handleChat} // <--- 绑定我们写的函数
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
        </div>
      </Content>
    </Layout>
  );
}
