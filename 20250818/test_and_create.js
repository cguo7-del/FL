import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAndCreate() {
  console.log('🔍 检查book_library表是否存在...');
  
  // 尝试查询表
  const { data, error } = await supabase
    .from('book_library')
    .select('*')
    .limit(1);
  
  if (error) {
    if (error.message.includes('Could not find the table')) {
      console.log('❌ book_library表不存在');
      console.log('\n📋 请在Supabase Dashboard的SQL编辑器中执行以下SQL语句:');
      console.log('=' .repeat(60));
      console.log(`CREATE TABLE book_library (
  id SERIAL PRIMARY KEY,
  book_name VARCHAR(255) NOT NULL,
  strategy_category VARCHAR(100) NOT NULL,
  chapter_name VARCHAR(255) NOT NULL,
  chapter_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
      console.log('=' .repeat(60));
      console.log('\n🔗 访问: https://supabase.com/dashboard/project/crnfwlpcxrnqfgwqnmun/sql');
      console.log('\n执行完成后，再运行 create_table_final.js 插入数据');
      return false;
    } else {
      console.error('❌ 查询出错:', error);
      return false;
    }
  } else {
    console.log('✅ book_library表已存在!');
    console.log('📊 当前表中有', data.length, '条记录');
    return true;
  }
}

// 执行测试
testAndCreate().then(exists => {
  if (exists) {
    console.log('\n✅ 可以直接运行 create_table_final.js 插入数据');
  }
  process.exit(0);
});