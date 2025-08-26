const { createClient } = require('@supabase/supabase-js');

// 使用Service Role Key
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkBookLibraryTable() {
  try {
    console.log('检查 book_library 表结构...');
    
    // 查看表数据
    const { data, error } = await supabase
      .from('book_library')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('查询 book_library 失败:', error);
      return false;
    } else {
      console.log('book_library 表数据:', data);
      console.log('book_library 表存在且可访问');
      return true;
    }
  } catch (error) {
    console.error('检查表出错:', error);
    return false;
  }
}

async function createUserCollectionsTableLikeBookLibrary() {
  try {
    console.log('\n=== 效仿 book_library 创建 user_collections 表 ===');
    
    // 完全效仿 book_library 的创建方法：直接插入测试数据来触发表创建
    const testData = {
      user_id: 'test_user_123',
      question: '测试问题',
      answer: '测试答案',
      strategy_category: '测试分类',
      book_name: '测试书籍',
      chapter_name: '测试章节'
    };
    
    console.log('尝试插入测试数据来创建表...');
    const { data, error } = await supabase
      .from('user_collections')
      .insert([testData])
      .select();
    
    if (error) {
      console.error('插入数据失败:', error);
      console.log('\n尝试使用更简单的数据结构...');
      
      // 尝试更简单的数据结构
      const simpleData = {
        user_id: 'test',
        question: 'test',
        answer: 'test'
      };
      
      const { data: simpleResult, error: simpleError } = await supabase
        .from('user_collections')
        .insert([simpleData])
        .select();
      
      if (simpleError) {
        console.error('简单数据插入也失败:', simpleError);
        return false;
      } else {
        console.log('简单数据插入成功:', simpleResult);
        // 删除测试数据
        await supabase
          .from('user_collections')
          .delete()
          .eq('user_id', 'test');
        console.log('user_collections 表创建成功！');
        return true;
      }
    } else {
      console.log('插入测试数据成功:', data);
      // 删除测试数据
      await supabase
        .from('user_collections')
        .delete()
        .eq('user_id', 'test_user_123');
      console.log('user_collections 表创建成功！');
      return true;
    }
  } catch (error) {
    console.error('创建表过程出错:', error);
    return false;
  }
}

async function verifyUserCollectionsTable() {
  try {
    console.log('\n=== 验证 user_collections 表 ===');
    
    const { data, error } = await supabase
      .from('user_collections')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('验证失败:', error);
      return false;
    } else {
      console.log('验证成功，表可以正常访问');
      console.log('表数据:', data);
      return true;
    }
  } catch (error) {
    console.error('验证出错:', error);
    return false;
  }
}

// 主函数
async function main() {
  console.log('=== 开始检查和创建表 ===');
  
  // 1. 检查 book_library 表
  const bookLibraryExists = await checkBookLibraryTable();
  
  if (!bookLibraryExists) {
    console.error('book_library 表不存在或无法访问');
    return;
  }
  
  // 2. 创建 user_collections 表
  const created = await createUserCollectionsTableLikeBookLibrary();
  
  if (created) {
    // 3. 验证表创建
    await verifyUserCollectionsTable();
  }
  
  console.log('\n=== 完成 ===');
}

// 执行主函数
main();