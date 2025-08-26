-- 创建conversations表来存储问答对话
CREATE TABLE IF NOT EXISTS public.conversations (
    id BIGSERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为conversations表创建更新时间触发器
CREATE TRIGGER conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 启用行级安全策略 (RLS)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有用户查看所有记录
CREATE POLICY "Allow public read access" ON public.conversations
    FOR SELECT USING (true);

-- 创建策略：允许所有用户插入记录
CREATE POLICY "Allow public insert access" ON public.conversations
    FOR INSERT WITH CHECK (true);

-- 创建策略：允许所有用户更新记录
CREATE POLICY "Allow public update access" ON public.conversations
    FOR UPDATE USING (true);

-- 创建策略：允许所有用户删除记录
CREATE POLICY "Allow public delete access" ON public.conversations
    FOR DELETE USING (true);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS conversations_created_at_idx ON public.conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS conversations_question_idx ON public.conversations USING gin(to_tsvector('english', question));

-- 插入一些示例数据
INSERT INTO public.conversations (question, answer) VALUES 
('什么是人工智能？', '人工智能（AI）是计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统。'),
('如何学习编程？', '学习编程可以从选择一门编程语言开始，比如Python或JavaScript，然后通过在线教程、书籍和实践项目来逐步提高技能。');