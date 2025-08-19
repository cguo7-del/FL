const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

// 使用Service Role Key来创建表
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createBookLibraryTable() {
  try {
    console.log('开始创建book_library表...');
    
    // 创建表的SQL语句
    const createTableSQL = `CREATE TABLE IF NOT EXISTS book_library (id SERIAL PRIMARY KEY, book_name VARCHAR(255) NOT NULL, strategy_category VARCHAR(100) NOT NULL, chapter_name VARCHAR(255) NOT NULL, chapter_content TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()); CREATE INDEX IF NOT EXISTS idx_book_library_strategy ON book_library(strategy_category); CREATE INDEX IF NOT EXISTS idx_book_library_book_name ON book_library(book_name);`;
    
    // 使用curl执行SQL
    const curlCommand = `curl -X POST '${supabaseUrl}/rest/v1/rpc/query' \
      -H "apikey: ${serviceRoleKey}" \
      -H "Authorization: Bearer ${serviceRoleKey}" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=minimal" \
      -d '{"query": "${createTableSQL}"}'`;
    
    try {
      const result = execSync(curlCommand, { encoding: 'utf8' });
      console.log('SQL执行结果:', result);
    } catch (curlError) {
      console.log('curl执行完成，尝试验证表创建...');
    }
    
    // 验证表是否创建成功
    const { data: tableData, error: selectError } = await supabase
      .from('book_library')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('验证表创建失败:', selectError);
      // 尝试直接创建表
      console.log('尝试使用Supabase客户端直接创建表...');
      await createTableDirectly();
    } else {
      console.log('表验证成功，可以正常访问book_library表');
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
      book_name: 'test',
      strategy_category: 'test',
      chapter_name: 'test',
      chapter_content: 'test'
    };
    
    const { data, error } = await supabase
      .from('book_library')
      .insert([testData])
      .select();
    
    if (error) {
      console.error('直接创建表失败:', error);
    } else {
      console.log('表创建成功，删除测试数据...');
      // 删除测试数据
      await supabase
        .from('book_library')
        .delete()
        .eq('book_name', 'test');
      console.log('book_library表创建完成！');
    }
  } catch (error) {
    console.error('直接创建表出错:', error);
  }
}

// 执行创建表函数
createBookLibraryTable();