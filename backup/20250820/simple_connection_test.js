const { createClient } = require('@supabase/supabase-js');

// 配置信息
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTAzMDQsImV4cCI6MjA3MDcyNjMwNH0.g_HmFQQiuGW2TZRzZ5gqCj098DZy6iwn_xQAE6kEUEI';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII';

console.log('🔍 Supabase连接测试');
console.log('=' .repeat(40));

async function testConnections() {
  // 测试1: 匿名客户端
  console.log('\n1. 测试匿名客户端连接...');
  try {
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // 尝试执行一个简单的RPC调用
    const { data, error } = await anonClient.rpc('version');
    
    if (error) {
      console.log(`❌ 匿名客户端错误: ${error.message}`);
    } else {
      console.log('✅ 匿名客户端连接成功');
    }
  } catch (err) {
    console.log(`❌ 匿名客户端异常: ${err.message}`);
  }
  
  // 测试2: Service Role客户端
  console.log('\n2. 测试Service Role客户端连接...');
  try {
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // 尝试执行一个简单的RPC调用
    const { data, error } = await serviceClient.rpc('version');
    
    if (error) {
      console.log(`❌ Service Role错误: ${error.message}`);
    } else {
      console.log('✅ Service Role连接成功');
    }
  } catch (err) {
    console.log(`❌ Service Role异常: ${err.message}`);
  }
  
  // 测试3: 尝试创建book_library表
  console.log('\n3. 测试创建book_library表...');
  try {
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // 尝试插入测试数据来创建表
    const { data, error } = await serviceClient
      .from('book_library')
      .insert({
        book_name: '测试书籍',
        strategy_category: '测试分类',
        chapter_name: '测试章节',
        chapter_content: '测试内容'
      })
      .select();
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('⚠️  book_library表不存在，需要手动创建');
      } else {
        console.log(`❌ 插入数据错误: ${error.message}`);
      }
    } else {
      console.log('✅ book_library表存在且可以插入数据');
      
      // 删除测试数据
      await serviceClient
        .from('book_library')
        .delete()
        .eq('book_name', '测试书籍');
      console.log('✅ 测试数据已清理');
    }
  } catch (err) {
    console.log(`❌ 表测试异常: ${err.message}`);
  }
  
  // 测试4: 检查现有表
  console.log('\n4. 检查数据库中的现有表...');
  try {
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // 尝试查询系统表来获取表列表
    const { data, error } = await serviceClient
      .rpc('get_table_list');
    
    if (error) {
      console.log(`⚠️  无法获取表列表: ${error.message}`);
      
      // 尝试直接查询一些常见表
      const tables = ['conversations', 'book_library', 'users'];
      for (const table of tables) {
        try {
          const { data: tableData, error: tableError } = await serviceClient
            .from(table)
            .select('*')
            .limit(1);
          
          if (!tableError) {
            console.log(`✅ 找到表: ${table}`);
          }
        } catch (e) {
          // 忽略错误
        }
      }
    } else {
      console.log('✅ 成功获取表列表:', data);
    }
  } catch (err) {
    console.log(`❌ 表检查异常: ${err.message}`);
  }
}

// 运行测试
testConnections().then(() => {
  console.log('\n🎯 测试完成');
}).catch(error => {
  console.error(`\n💥 测试失败: ${error.message}`);
});