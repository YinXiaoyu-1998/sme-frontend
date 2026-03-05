import { RequestClient } from "@/app/lib/request";
import type { ChatMessage, GeneratedFile } from "@/app/types/chat";

type ChatHistoryMessage = {
  id: string;
  content: string;
  role: "user" | "ai" | "assistant" | "system";
  createdAt: string;
  chatId: string | null;
  fileId: string | null;
  generatedFiles?: GeneratedFile[];
};


// {
//   "id": "871f1be2-91b7-4f5f-9489-6b78ca3e9117",
//   "content": "根据2026年2月24日的销售数据，我为您整理了销量最高的10款菜品及其对应的销售额，并生成了柱状图。\n\n### 分析结论：\n*   **销量冠军**：“高品质大串羔羊肉”以 **112份** 的销量位居榜首，销售额达到 **1460.57元**。\n*   **销售额冠军**：“老西安·牛肉泡馍（1.2两熟肉）”虽然销量排名第五（43份），但单品价格较高，贡献了最高的销售额 **1626.25元**。\n*   **核心单品**：“热汤·招牌刀削面”和“酥脆肉夹馍”表现均衡，不仅销量高（分别为42份和65份），销售额也都突破了1000元大关，是门店的流量与营收双重担当。\n\n### 关键数据（按销量降序）：\n1.  **高品质大串羔羊肉**：销量 112 | 销售额 1460.57元\n2.  **酥脆肉夹馍**：销量 65 | 销售额 1025.42元\n3.  **秘制鸡翅**：销量 47 | 销售额 560.93元\n4.  **秘制小排**：销量 45 | 销售额 542.04元\n5.  **老西安·牛肉泡馍（1.2两熟肉）**：销量 43 | 销售额 1626.25元\n6.  **热汤·招牌刀削面**：销量 42 | 销售额 1095.60元\n7.  **蒜蓉烤乳山3-4两生蚝**：销量 36 | 销售额 431.75元\n8.  **辣椒烤牛肉粒**：销量 36 | 销售额 290.00元\n9.  **鱼豆腐**：销量 35 | 销售额 179.95元\n10. **大串秘制牛大筋**：销量 31 | 销售额 279.00元\n\n***\n\n**您可能还想了解：**\n1. 销量前三的菜品在午餐和晚餐时段的表现有何差异？\n2. “老西安·牛肉泡馍”的高销售额主要来自堂食还是外卖订单？\n3. 像“鱼豆腐”这样低单价高销量的菜品，通常是作为哪些主食的搭配售出的？",
//   "role": "ai",
//   "createdAt": "2026-03-01T11:02:47.252Z",
//   "userId": "69d930fb-2359-4012-8897-5a13d6e2c10e",
//   "chatId": null,
//   "fileId": null,
//   "generatedFiles": [
//       {
//           "id": "86cdf30c-84a2-4d26-8db7-9705d0b5f58d",
//           "messageId": "871f1be2-91b7-4f5f-9489-6b78ca3e9117",
//           "fileType": "chart",
//           "mimeType": "image/png",
//           "filename": "86cdf30c-84a2-4d26-8db7-9705d0b5f58d_2026年2月24日销量Top10菜品销售额统计.png",
//           "path": "/Users/xiaoyuyin/Desktop/YXY_DEV/SME/sme-backend/generats/86cdf30c-84a2-4d26-8db7-9705d0b5f58d_2026年2月24日销量Top10菜品销售额统计.png",
//           "url": "http://localhost:4000/generated/86cdf30c-84a2-4d26-8db7-9705d0b5f58d_2026%E5%B9%B42%E6%9C%8824%E6%97%A5%E9%94%80%E9%87%8FTop10%E8%8F%9C%E5%93%81%E9%94%80%E5%94%AE%E9%A2%9D%E7%BB%9F%E8%AE%A1.png",
//           "size": 76335,

//           "createdAt": "2026-03-01T10:58:53.556Z",
//           "updatedAt": "2026-03-01T11:02:47.284Z"
//       }
//   ]
// }

type ChatAnswerResponse = {
  answer: string;
  generatedFiles?: GeneratedFile[];
};

const backendBaseUrl = process.env.NEXT_PUBLIC_SME_BACKEND_URL ?? "";

const requestClient = new RequestClient({
  baseURL: backendBaseUrl,
  getAuthToken: () => null,
  getSessionId: () => null,
});

export class ChatApi {
  constructor(private request: RequestClient = requestClient) {}

  async getHistory(userId: string) {
    const history = await this.request.get<ChatHistoryMessage[]>("/chat/history", {
      params: { userId },
    });
    return history.map((item) => ({
      role: item.role === "assistant" ? "ai" : (item.role as ChatMessage["role"]),
      content: item.content,
      generatedFiles: item.generatedFiles,
    }));
  }

  async sendMessage({ message, fileId, userId }: { message: string; fileId?: string | null; userId: string }) {
    const response = await this.request.post<
      ChatAnswerResponse,
      { message: string; fileId?: string | null; userId: string }
    >("/chat", {
      message,
      fileId,
      userId,
    });
    return response;
  }
}

export const chatApi = new ChatApi();
