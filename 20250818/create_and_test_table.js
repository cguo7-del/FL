const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAndTestTable() {
  try {
    console.log('开始创建book_library表并测试连接...');
    
    // 首先尝试插入一条测试数据来创建表
    console.log('\n1. 尝试插入测试数据（这会自动创建表如果不存在）...');
    const testData = {
      book_name: '测试书籍',
      strategy_category: '行正持礼',
      chapter_name: '测试章节',
      chapter_content: '这是一个测试内容，用于验证表创建和数据插入功能。'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('book_library')
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
        .from('book_library')
        .select('*')
        .eq('book_name', '测试书籍');
      
      if (queryError) {
        console.log('查询失败:', queryError.message);
      } else {
        console.log('✅ 数据查询成功:', queryData);
      }
      
      // 删除测试数据
      console.log('\n3. 清理测试数据...');
      const { error: deleteError } = await supabase
        .from('book_library')
        .delete()
        .eq('book_name', '测试书籍');
      
      if (deleteError) {
        console.log('删除测试数据失败:', deleteError.message);
      } else {
        console.log('✅ 测试数据清理完成');
      }
      
      console.log('\n🎉 book_library表创建成功，连接正常！');
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
    const createTableSQL = `CREATE TABLE IF NOT EXISTS book_library (id SERIAL PRIMARY KEY, book_name VARCHAR(255) NOT NULL, strategy_category VARCHAR(100) NOT NULL, chapter_name VARCHAR(255) NOT NULL, chapter_content TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());`;
    
    const curlCommand = `curl -X POST '${supabaseUrl}/rest/v1/rpc/query' -H "apikey: ${serviceRoleKey}" -H "Authorization: Bearer ${serviceRoleKey}" -H "Content-Type: application/json" -d '{"query": "${createTableSQL}"}'`;
    
    console.log('执行SQL创建表...');
    const result = execSync(curlCommand, { encoding: 'utf8' });
    console.log('SQL执行结果:', result);
    
    // 再次尝试插入数据
    console.log('\n再次尝试插入数据...');
    const testData = {
      book_name: '测试书籍2',
      strategy_category: '行正持礼',
      chapter_name: '测试章节2',
      chapter_content: '第二次测试内容'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('book_library')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.log('第二次插入也失败:', insertError.message);
      return false;
    } else {
      console.log('✅ 第二次插入成功！表已创建');
      
      // 清理数据
      await supabase
        .from('book_library')
        .delete()
        .eq('book_name', '测试书籍2');
      
      return true;
    }
    
  } catch (error) {
    console.error('替代方案失败:', error.message);
    return false;
  }
}

// 执行创建和测试
createAndTestTable().then(success => {
  if (success) {
    console.log('\n🎉 所有测试通过！book_library表已准备就绪');
    console.log('\n接下来可以插入四大方略经纬的书籍数据了。');
  } else {
    console.log('\n❌ 测试失败，需要手动在Supabase Dashboard中创建表');
    console.log('\n建议：');
    console.log('1. 登录Supabase Dashboard');
    console.log('2. 进入SQL Editor');
    console.log('3. 执行以下SQL:');
    console.log(`
CREATE TABLE book_library (
  id SERIAL PRIMARY KEY,
  book_name VARCHAR(255) NOT NULL,
  strategy_category VARCHAR(100) NOT NULL,
  chapter_name VARCHAR(255) NOT NULL,
  chapter_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
  }
});