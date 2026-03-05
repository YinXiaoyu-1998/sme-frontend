'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout, Card, Upload, List, Typography, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFilesResponse } from '@/app/types/api';
import { filesApi } from '@/app/services/filesApi';
import type { UploadProps } from 'antd';
import { getCurrentUser } from '@/app/lib/authStore';

const { Sider } = Layout;
const { Dragger } = Upload;
const { Title, Text } = Typography;

export default function DataCenterSider() {
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const currentUserId = useMemo(() => getCurrentUser()?.id ?? null, []);

  const fetchFiles = useCallback(async () => {
    if (!currentUserId) {
      setFileNames([]);
      return;
    }
    try {
      setIsLoadingFiles(true);
      const response = await filesApi.listFiles(currentUserId);
      const names = response.files.map((file) => file.originalName || file.filename);
      setFileNames(names);
    } catch (error) {
      setFileNames([]);
      console.error('Failed to fetch file list', error);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    void fetchFiles();
  }, [fetchFiles]);

  const handleUploadDone = (file: any) => {
    const response: UploadFilesResponse = file?.response;
    const fileId = response.files[0]?.id;
    if (!fileId) {
      message.error('上传失败，未收到文件信息');
      return;
    }
    // setCurrentFileId(fileId);
    console.log('upload finished', { fileId, response });
    void fetchFiles();
  };
  // Add a trigger when the call to files/upload finished
  const uploadProps = {
    name: 'files',
    height: 300,
    multiple: false,
    customRequest: (async (options) => {
      const { file, onSuccess, onError } = options;
      if (!currentUserId) {
        const error = new Error('Missing user ID for upload');
        message.error('上传失败，未找到用户信息');
        onError?.(error);
        return;
      }
      try {
        const response = await filesApi.uploadFiles({ files: [file as File], userId: currentUserId });
        onSuccess?.(response);
      } catch (error) {
        onError?.(error as Error);
      }
    }) as UploadProps['customRequest'],
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
          loading={isLoadingFiles}
          dataSource={fileNames}
          renderItem={(item) => <List.Item>📄 {item}</List.Item>}
        />
      </Card>
    </Sider>
  );
}
