-- 创建user_collections表
CREATE TABLE IF NOT EXISTS user_collections (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_created_at ON user_collections(created_at DESC);

-- 启用行级安全策略
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的收藏
CREATE POLICY "Users can view own collections" ON user_collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON user_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON user_collections
  FOR DELETE USING (auth.uid() = user_id);

-- 创建触发器函数来自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_user_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_user_collections_updated_at
  BEFORE UPDATE ON user_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_user_collections_updated_at();