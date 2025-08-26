import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTable() {
  console.log('🚀 开始创建book_library表...');
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS book_library (
      id SERIAL PRIMARY KEY,
      book_name VARCHAR(255) NOT NULL,
      strategy_category VARCHAR(100) NOT NULL,
      chapter_name VARCHAR(255) NOT NULL,
      chapter_content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec', {
      sql: createTableSQL
    });
    
    if (error) {
      console.error('❌ 创建表失败:', error);
      return false;
    }
    
    console.log('✅ book_library表创建成功!');
    return true;
  } catch (err) {
    console.error('❌ 执行SQL时出错:', err);
    return false;
  }
}

// 执行创建表
createTable().then(success => {
  if (success) {
    console.log('\n✅ 表创建完成，现在可以运行 create_table_final.js 插入数据');
  } else {
    console.log('\n❌ 表创建失败，请检查错误信息');
  }
  process.exit(success ? 0 : 1);
});