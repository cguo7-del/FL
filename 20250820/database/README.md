# Supabase 数据库设置说明

## 创建 conversations 表

由于我们的应用需要存储问答对话数据，您需要在 Supabase 数据库中创建 `conversations` 表。

### 步骤 1：登录 Supabase 控制台

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 登录您的账户
3. 选择您的项目：`crnfwlpcxrnqfgwqnmun`

### 步骤 2：执行 SQL 脚本

1. 在左侧菜单中点击 **"SQL Editor"**
2. 点击 **"New Query"** 创建新查询
3. 将 `create_conversations_table.sql` 文件中的所有内容复制粘贴到查询编辑器中
4. 点击 **"Run"** 按钮执行脚本

### 步骤 3：验证表创建

1. 在左侧菜单中点击 **"Table Editor"**
2. 您应该能看到新创建的 `conversations` 表
3. 表中应该包含以下字段：
   - `id` (bigserial, 主键)
   - `question` (text, 非空)
   - `answer` (text, 非空)
   - `created_at` (timestamp with time zone)
   - `updated_at` (timestamp with time zone)

### 步骤 4：检查权限设置

1. 在 **"Authentication"** > **"Policies"** 中
2. 确认 `conversations` 表有以下策略：
   - Allow public read access
   - Allow public insert access
   - Allow public update access
   - Allow public delete access

### 完成后

执行完 SQL 脚本后，您的应用就可以正常使用数据库功能了：
- 在问答页面 (`/ask`) 提交问题时，数据会自动保存到数据库
- 访问测试页面 (`/test-db`) 可以验证所有 CRUD 操作
- 数据库连接状态会显示为"已连接"

## 表结构说明

### conversations 表字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGSERIAL | 主键，自动递增 |
| question | TEXT | 用户提出的问题 |
| answer | TEXT | AI 生成的回答 |
| created_at | TIMESTAMP | 记录创建时间 |
| updated_at | TIMESTAMP | 记录更新时间 |

### 功能特性

- **自动时间戳**：创建和更新时间自动管理
- **全文搜索索引**：支持对问题内容进行快速搜索
- **行级安全策略**：配置了适当的访问权限
- **示例数据**：包含两条示例问答记录

## 故障排除

如果遇到权限问题，请确保：
1. 使用的是正确的 Anon Key
2. RLS 策略已正确设置
3. 表的权限配置正确

如果仍有问题，可以在 Supabase 控制台的 **"Logs"** 部分查看详细错误信息。