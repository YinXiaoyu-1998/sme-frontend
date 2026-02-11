'use client';

import React, { useState } from 'react';
import { Layout, Card, Upload, List, Typography, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFilesResponse } from '@/app/types/api';

const { Sider } = Layout;
const { Dragger } = Upload;
const { Title, Text } = Typography;

export default function DataCenterSider({ currentFileId, setCurrentFileId }: { currentFileId: string | null, setCurrentFileId: (fileId: string | null) => void }) {
  const backendUrl = process.env.NEXT_PUBLIC_SME_BACKEND_URL;
  console.log('backendUrl', backendUrl);

  const handleUploadDone = (file: any) => {
    const response: UploadFilesResponse = file?.response;
    const fileId = response.files[0].id;
    setCurrentFileId(fileId);
    console.log('upload finished', { fileId, response });
  };
  // Add a trigger when the call to files/upload finished
  const uploadProps = {
    name: 'files',
    height: 300,
    multiple: false,
    action: `${backendUrl}/files/upload`,
    onChange(info: any) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} 上传成功`);
        handleUploadDone(info.file);

      } else if (status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
    onDrop(e: any) {
      console.log('Test2025 onDrop', e);
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <Sider
      width={350}
      theme="light"
      style={{ padding: '20px', borderRight: '1px solid #f0f0f0', height: '100%', overflowY: 'auto' }}
    >
      <div style={{ marginBottom: 30 }}>
        <Title level={4}>📚 数据中心</Title>
        <Text type="secondary">上传企业私有数据以构建知识库</Text>
      </div>

      <Dragger {...uploadProps} style={{ marginBottom: 20 }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ color: '#1677ff' }} />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域</p>
        <p className="ant-upload-hint">支持 .xlsx, .pdf 格式</p>
      </Dragger>

      <Card size="small" title="已上传文件" style={{ marginTop: 20 }}>
        <List
          size="small"
          dataSource={['2024销售报表.xlsx', '员工手册V2.pdf']}
          renderItem={(item) => <List.Item>📄 {item}</List.Item>}
        />
      </Card>
    </Sider>
  );
}
