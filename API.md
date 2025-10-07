# API 文档（v1）

本文档根据当前 NestJS API 网关的实现整理，供前端联调使用。随着功能迭代请及时同步更新。

## 通用信息

- **Base URL**：`/`
- **Content-Type**：`application/json`
- **认证**：当前原型阶段未开启鉴权；后续会接入 Bearer JWT。
- **错误处理**：请求校验失败返回 `400 Bad Request`（`class-validator` 自动生成），服务器内部错误返回 `500 Internal Server Error`。

## 1. 健康检查

### `GET /health`

用于探活与监控。

#### 响应

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `string` | 固定为 `"ok"` |
| `timestamp` | `string` | ISO8601 时间戳 |

**示例**

```json
{
  "status": "ok",
  "timestamp": "2024-05-01T08:00:00.000Z"
}
```

## 2. 提交（Submissions）

### 2.1 创建提交 `POST /submissions`

将学生作业图片入队到判分流水线，目前写入内存状态并投递 BullMQ `ocr` 队列。

#### 请求体

| 字段 | 类型 | 是否必填 | 说明 |
| --- | --- | --- | --- |
| `assignmentId` | `string` | ✅ | 作业 ID |
| `studentId` | `string` | ✅ | 学生 ID |
| `images` | `string[]` | ✅ | 作业图片在对象存储中的 key 列表 |
| `subject` | `'zh' \| 'en' \| 'math'` | ⭕️ | 学科标签，默认未指定 |
| `metadata` | `object` | ⭕️ | 终端附加信息 |
| `metadata.clientVersion` | `string` | ⭕️ | 客户端版本号（如 `ios@1.2.3`） |
| `metadata.device` | `string` | ⭕️ | 拍摄设备标识 |

#### 响应体

返回初始的提交状态。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 系统生成的提交 ID |
| `status` | `string` | 当前状态，创建时为 `queued` |
| `receivedAt` | `string` | ISO8601 接收时间戳 |
| `payload` | `object` | 回显原始提交数据 |

**请求示例**

```http
POST /submissions
Content-Type: application/json

{
  "assignmentId": "assignment-123",
  "studentId": "student-456",
  "images": [
    "s3://bucket/submission/page-1.jpg",
    "s3://bucket/submission/page-2.jpg"
  ],
  "subject": "math",
  "metadata": {
    "clientVersion": "ios@1.2.3",
    "device": "ipad-pro-2021"
  }
}
```

**响应示例**

```json
{
  "id": "V1StGXR8_Z5jdHi6B-myT",
  "status": "queued",
  "receivedAt": "2024-05-01T08:00:00.000Z",
  "payload": {
    "assignmentId": "assignment-123",
    "studentId": "student-456",
    "images": [
      "s3://bucket/submission/page-1.jpg",
      "s3://bucket/submission/page-2.jpg"
    ],
    "subject": "math",
    "metadata": {
      "clientVersion": "ios@1.2.3",
      "device": "ipad-pro-2021"
    }
  }
}
```

### 2.2 查询提交状态 `GET /submissions/:id`

用于轮询判分状态（当前返回内存中的模拟数据）。

#### 路径参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 提交 ID |

#### 响应体

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 提交 ID |
| `status` | `string` | 当前状态（如 `queued`、`unknown` 等） |
| `receivedAt` | `string \| null` | 接收时间；未知时为 `null` |
| `payload` | `object \| null` | 若存在则包含原始提交数据 |

**响应示例（存在）**

```json
{
  "id": "V1StGXR8_Z5jdHi6B-myT",
  "status": "queued",
  "receivedAt": "2024-05-01T08:00:00.000Z",
  "payload": {
    "assignmentId": "assignment-123",
    "studentId": "student-456",
    "images": [
      "s3://bucket/submission/page-1.jpg",
      "s3://bucket/submission/page-2.jpg"
    ],
    "subject": "math",
    "metadata": {
      "clientVersion": "ios@1.2.3",
      "device": "ipad-pro-2021"
    }
  }
}
```

**响应示例（未命中）**

```json
{
  "id": "non-existent",
  "status": "unknown",
  "receivedAt": null,
  "payload": null
}
```

---

> 若后续新增鉴权、WebSocket 推送、队列状态回传等功能，请在此文档补充说明。
