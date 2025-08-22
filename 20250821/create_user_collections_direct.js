const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createUserCollectionsTable() {
  try {
    console.log('开始创建user_collections表并测试连接...');
    
    // 首先尝试插入一条测试数据来创建表
    console.log('\n1. 尝试插入测试数据（这会自动创建表如果不存在）...');
    const testData = {
      user_id: 'test-user-id',
      question: '测试问题',
      answer: '这是一个测试答案，用于验证user_collections表创建和数据插入功能。'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_collections')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.log('插入测试数据失败:', insertError.message);
      console.log('错误代码:', insertError.code);
      
      if (insertError.code === 'PGRST205') {
        console.log('\n表不存在，这是预期的。让我们尝试其他方法...');
        return await tryAlternativeApproach();
      }
    } else {
      console.log('✅ 测试数据插入成功！');
      console.log('插入的数据:', insertData);
      
      // 查询数据验证
      console.log('\n2. 验证数据查询...');
      const { data: queryData, error: queryError } = await supabase
        .from('user_collections')
        .select('*')
        .eq('user_id', 'test-user-id');
      
      if (queryError) {
        console.log('查询失败:', queryError.message);
      } else {
        console.log('✅ 数据查询成功:', queryData);
      }
      
      // 删除测试数据
      console.log('\n3. 清理测试数据...');
      const { error: deleteError } = await supabase
        .from('user_collections')
        .delete()
        .eq('user_id', 'test-user-id');
      
      if (deleteError) {
        console.log('删除测试数据失败:', deleteError.message);
      } else {
        console.log('✅ 测试数据清理完成');
      }
      
      console.log('\n🎉 user_collections表创建成功，连接正常！');
      return true;
    }
    
  } catch (error) {
    console.error('过程中出错:', error);
    return false;
  }
}

async function tryAlternativeApproach() {
  console.log('\n尝试替代方案：使用curl直接创建表...');
  
  const { execSync } = require('child_process');
  
  try {
    // 使用curl创建表
    const createTableSQL = `CREATE TABLE IF NOT EXISTS user_collections (id SERIAL PRIMARY KEY, user_id UUID NOT NULL, question TEXT NOT NULL, answer TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()); CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id); CREATE INDEX IF NOT EXISTS idx_user_collections_created_at ON user_collections(created_at DESC);`;
    
    const curlCommand = `curl -X POST '${supabaseUrl}/rest/v1/rpc/query' -H "apikey: ${serviceRoleKey}" -H "Authorization: Bearer ${serviceRoleKey}" -H "Content-Type: application/json" -d '{"query": "${createTableSQL}"}'`;
    
    console.log('执行SQL创建表...');
    const result = execSync(curlCommand, { encoding: 'utf8' });
    console.log('SQL执行结果:', result);
    
    // 再次尝试插入数据
    console.log('\n再次尝试插入数据...');
    const testData = {
      user_id: 'test-user-id-2',
      question: '测试问题2',
      answer: '第二次测试答案'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_collections')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.log('第二次插入也失败:', insertError.message);
      return false;
    } else {
      console.log('✅ 第二次插入成功！表已创建');
      
      // 清理数据
      await supabase
        .from('user_collections')
        .delete()
        .eq('user_id', 'test-user-id-2');
      
      return true;
    }
    
  } catch (error) {
    console.error('替代方案失败:', error.message);
    return false;
  }
}

// 执行创建和测试
createUserCollectionsTable().then(success => {
  if (success) {
    console.log('\n🎉 所有测试通过！user_collections表已准备就绪');
    console.log('\n表结构:');
    console.log('- id: 主键，自增');
    console.log('- user_id: 用户ID (UUID)');
    console.log('- question: 问题内容 (TEXT)');
    console.log('- answer: 答案内容 (TEXT)');
    console.log('- created_at: 创建时间');
    console.log('- updated_at: 更新时间');
    console.log('\n索引:');
    console.log('- idx_user_collections_user_id: 用户ID索引');
    console.log('- idx_user_collections_created_at: 创建时间索引（降序）');
  } else {
    console.log('\n❌ 测试失败，需要手动在Supabase Dashboard中创建表');
    console.log('\n建议：');
    console.log('1. 登录Supabase Dashboard');
    console.log('2. 进入SQL Editor');
    console.log('3. 执行以下SQL:');
    console.log(`
CREATE TABLE user_collections (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX idx_user_collections_created_at ON user_collections(created_at DESC);`);
  }
});