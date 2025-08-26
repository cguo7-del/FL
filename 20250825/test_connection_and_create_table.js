const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

// 使用Service Role Key来创建表
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testConnection() {
  try {
    console.log('测试 Supabase 连接...');
    
    // 使用 SELECT NOW() 测试连接
    const { data, error } = await supabase
      .rpc('exec_sql', { sql: 'SELECT NOW() as current_time' });
    
    if (error) {
      console.error('连接测试失败:', error);
      // 尝试使用简单查询测试
      console.log('尝试使用简单查询测试连接...');
      const { data: testData, error: testError } = await supabase
        .from('book_library')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.error('简单查询也失败:', testError);
        return false;
      } else {
        console.log('连接正常，可以访问现有表');
        return true;
      }
    } else {
      console.log('连接测试成功:', data);
      return true;
    }
  } catch (error) {
    console.error('连接测试出错:', error);
    return false;
  }
}

async function createUserCollectionsTable() {
  try {
    console.log('开始创建 user_collections 表...');
    
    // 创建表的SQL语句
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_collections (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        strategy_category VARCHAR(100),
        book_name VARCHAR(255),
        chapter_name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_collections_category ON user_collections(strategy_category);
      CREATE INDEX IF NOT EXISTS idx_user_collections_created_at ON user_collections(created_at);
      
      -- 创建更新时间触发器
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS update_user_collections_updated_at ON user_collections;
      CREATE TRIGGER update_user_collections_updated_at
        BEFORE UPDATE ON user_collections
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;
    
    // 使用curl执行SQL（效仿book_library的方法）
    const curlCommand = `curl -X POST '${supabaseUrl}/rest/v1/rpc/query' \
      -H "apikey: ${serviceRoleKey}" \
      -H "Authorization: Bearer ${serviceRoleKey}" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=minimal" \
      -d '{"query": "${createTableSQL.replace(/\n/g, ' ').replace(/"/g, '\\"')}"}}'`;
    
    try {
      const result = execSync(curlCommand, { encoding: 'utf8' });
      console.log('SQL执行结果:', result);
    } catch (curlError) {
      console.log('curl执行完成，尝试验证表创建...');
    }
    
    // 验证表是否创建成功
    const { data: tableData, error: selectError } = await supabase
      .from('user_collections')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('验证表创建失败:', selectError);
      // 尝试直接创建表
      console.log('尝试使用Supabase客户端直接创建表...');
      await createTableDirectly();
    } else {
      console.log('表验证成功，可以正常访问 user_collections 表');
    }
    
  } catch (error) {
    console.error('创建表过程中出错:', error);
  }
}

// 直接创建表的备用方法
async function createTableDirectly() {
  try {
    // 使用简单的插入操作来触发表创建
    const testData = {
      user_id: 'test_user',
      question: 'test question',
      answer: 'test answer',
      strategy_category: 'test',
      book_name: 'test',
      chapter_name: 'test'
    };
    
    const { data, error } = await supabase
      .from('user_collections')
      .insert([testData])
      .select();
    
    if (error) {
      console.error('直接创建表失败:', error);
    } else {
      console.log('表创建成功，删除测试数据...');
      // 删除测试数据
      await supabase
        .from('user_collections')
        .delete()
        .eq('user_id', 'test_user');
      console.log('user_collections 表创建完成！');
    }
  } catch (error) {
    console.error('直接创建表出错:', error);
  }
}

// 主函数
async function main() {
  console.log('=== 开始测试连接和创建表 ===');
  
  // 1. 测试连接
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.error('无法连接到 Supabase，停止执行');
    return;
  }
  
  // 2. 创建表
  await createUserCollectionsTable();
  
  console.log('=== 完成 ===');
}

// 执行主函数
main();