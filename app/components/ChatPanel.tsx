'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Layout, Input, List, Button, Spin, message as antMessage } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { ChatMessage } from '@/app/types/chat';
import { chatApi } from '@/app/services/chatApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // 引入表格插件
import { getCurrentUser } from '@/app/lib/authStore';
const { Content } = Layout;

// type ChatPanelProps = {
//   messages: ChatMessage[];
//   onSend: (value: string) => void;
// };

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: '您好！我是企业智脑。请上传 Excel 或 PDF 文件，我会帮您分析数据。' },
  ]);
  // ... 状态定义 ...
  const [loading, setLoading] = useState(false); // 增加一个 loading 状态
  const [inputValue, setInputValue] = useState('');
  const currentUser = getCurrentUser();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isPngFile = (mimeType: string, filename: string) => {
    return mimeType === 'image/png' || filename.toLowerCase().endsWith('.png');
  };

  const isCsvFile = (mimeType: string, filename: string) => {
    return mimeType === 'text/csv'
      || mimeType === 'application/csv'
      || filename.toLowerCase().endsWith('.csv');
  };
  // === 2. 加载历史记录 ===
  const fetchHistory = async (userId: string) => {
    try {
      const history = await chatApi.getHistory(userId);
      // 数据库里的字段是 role/content，跟我们需要的一致
      setMessages(history);
    } catch (e) {
      console.error("加载历史失败", e);
      antMessage.error('加载历史失败');
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchHistory(currentUser?.id ?? '');
    }
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);
  const handleChat = async (value: string) => {
    if (!value.trim()) return;

    // 1. 先把用户消息和 AI 加载占位展示出来
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: value },
      { role: 'ai', content: '', isLoading: true },
    ]);
    setInputValue('');
    setLoading(true); // 开启加载转圈

    try {
      // 2. 发送请求给 NestJS
      const { answer, generatedFiles } = await chatApi.sendMessage({
        message: value,
        userId: currentUser?.id ?? '',
      });
      // 3. 用真实返回替换 AI 加载占位消息
      setMessages((prev) => {
        let loadingIndex = -1;
        for (let i = prev.length - 1; i >= 0; i -= 1) {
          if (prev[i].role === 'ai' && prev[i].isLoading) {
            loadingIndex = i;
            break;
          }
        }

        const nextAiMessage: ChatMessage = {
          role: 'ai',
          content: answer || '出错了，没收到回答',
          generatedFiles: generatedFiles ?? [],
        };

        if (loadingIndex === -1) {
          return [...prev, nextAiMessage];
        }

        const next = [...prev];
        next[loadingIndex] = nextAiMessage;
        return next;
      });
    } catch (error) {
      antMessage.error('网络请求失败');
      setMessages((prev) => {
        let loadingIndex = -1;
        for (let i = prev.length - 1; i >= 0; i -= 1) {
          if (prev[i].role === 'ai' && prev[i].isLoading) {
            loadingIndex = i;
            break;
          }
        }
        if (loadingIndex === -1) {
          return prev;
        }
        const next = [...prev];
        next[loadingIndex] = { role: 'ai', content: '请求失败，请稍后重试。' };
        return next;
      });
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
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '10px 15px',
                      borderRadius: '8px',
                      backgroundColor: item.role === 'user' ? '#1677ff' : '#fff',
                      color: item.role === 'user' ? '#fff' : '#333',
                      maxWidth: '70%',
                      textAlign: 'left',
                      overflowWrap: 'anywhere',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      fontSize: '16px',
                      lineHeight: 1.7,
                    }}
                  >
                    {item.isLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Spin size="small" />
                        <span>AI 正在思考中...</span>
                      </div>
                    ) : (
                      <>
                        {/* 使用 ReactMarkdown 渲染内容 */}
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]} // 启用表格支持
                          components={{
                            // 可选：在这里自定义某些元素的样式
                            // 比如强制让表格有边框
                            table: ({ node, ...props }) => (
                              <table style={{ borderCollapse: 'collapse', width: '100%' }} {...props} />
                            ),
                            th: ({ node, ...props }) => (
                              <th style={{ border: '1px solid #ddd', padding: '8px', background: '#f2f2f2' }} {...props} />
                            ),
                            td: ({ node, ...props }) => (
                              <td style={{ border: '1px solid #ddd', padding: '8px' }} {...props} />
                            ),
                          }}
                        >
                          {item.content}
                        </ReactMarkdown>
                        {item.role === 'ai' && (item.generatedFiles?.length ?? 0) > 0 && (
                          <div style={{ marginTop: 12 }}>
                            {item.generatedFiles?.map((file) => {
                              if (!file.url) {
                                return null;
                              }
                              if (isPngFile(file.mimeType, file.filename)) {
                                return (
                                  <div key={file.id} style={{ marginBottom: 12 }}>
                                    <img
                                      src={file.url}
                                      alt={file.filename}
                                      style={{
                                        maxWidth: '100%',
                                        borderRadius: 8,
                                        border: '1px solid #d9e8ff',
                                      }}
                                    />
                                  </div>
                                );
                              }
                              if (isCsvFile(file.mimeType, file.filename)) {
                                // increase the size of the text inside the button.
                                return (
                                  <a
                                    key={file.id}
                                    href={file.url}
                                    download={file.filename}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ display: 'block', marginBottom: 10, maxWidth: '100%' }}
                                  >
                                    <Button
                                      icon={<FileExcelOutlined />}
                                      size="large"
                                      style={{
                                        maxWidth: '100%',
                                        height: 'auto',
                                        whiteSpace: 'normal',
                                        textAlign: 'left',
                                        fontSize: '20px',
                                      }}
                                    >
                                      下载 CSV: {file.filename}
                                    </Button>
                                  </a>
                                );
                              }
                              return null;
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
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
