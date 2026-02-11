'use client'; // 必须加这一行，因为我们用了 AntD 的交互组件

import React, { useState } from 'react';
import { Layout } from 'antd';
import DataCenterSider from '@/app/components/DataCenterSider';
import ChatPanel from '@/app/components/ChatPanel';
import type { ChatMessage } from '@/app/types/chat';

export default function Home() {
  // 模拟一些聊天记录，为了让你看到效果
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);


  return (
    // 最外层布局：全屏高度
    <Layout style={{ height: '100vh' }}>
      {/* === 左侧：数据控制区 === */}
      <DataCenterSider currentFileId={currentFileId} setCurrentFileId={setCurrentFileId} />

      {/* === 右侧：智能对话区 === */}
      <ChatPanel currentFileId={currentFileId} setCurrentFileId={setCurrentFileId} />
    </Layout>
  );
}
