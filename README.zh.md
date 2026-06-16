# SME Frontend

这是 SME 小产品的前端应用，负责提供登录、文件上传、对话分析和 AI 生成结果展示的用户界面。

## 这个服务是做什么的

`sme-frontend` 是整个产品的用户入口。用户在这里登录、上传 Excel/PDF、查看已上传文件、通过聊天方式提问，并查看后端返回的文本分析和图表结果。

## 主要功能

- 邮箱密码登录
- 数据中心工作台
- Excel / PDF 文件上传
- 已上传文件列表展示
- 面向业务分析场景的聊天界面
- Markdown 风格回答渲染
- 聊天消息中的图表图片和导出文件展示
- 清空当前聊天，并同步删除后端中的聊天记录

## 技术栈概览

- Next.js 16（App Router）
- React 19
- TypeScript
- Ant Design 6
- Axios
- React Markdown + `remark-gfm`
- Tailwind CSS 4

## 目录说明

- `app/login`：登录页
- `app/home`：主工作台页面
- `app/components`：聊天面板、上传区和公共组件
- `app/services`：后端接口封装
- `app/store`：登录态管理

## 本地开发

安装依赖：

```bash
npm ci
```

启动开发服务器：

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:3000
```

## 环境变量

本地通常使用 `.env.local`：

```bash
NEXT_PUBLIC_SME_BACKEND_URL=http://localhost:4000
```

## 常用命令

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## 与其他服务的关系

- 所有业务请求都发往 `sme-backend`
- 图表和导出文件的访问 URL 由 `sme-backend` 提供
- 前端本身不直接连接 PostgreSQL、Redis 或 LLM 服务
