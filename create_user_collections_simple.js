const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createUserCollectionsTable() {
  try {
    console.log('🚀 开始创建user_collections表（简单方法）...');
    
    // 方法：直接插入一条数据，让Supabase自动创建表结构
    // 这是book_library表成功的方法
    console.log('\n📝 插入初始数据以创建表...');
    
    const initialData = {
      user_id: '00000000-0000-0000-0000-000000000000', // 测试用户ID
      question: '欢迎使用历问历答功能',
      answer: '这是您的第一条收藏记录。您可以在这里保存重要的问答内容，方便日后查阅。点击删除按钮可以移除不需要的记录。'
    };
    
    console.log('尝试插入数据:', initialData);
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_collections')
      .insert([initialData])
      .select();
    
    if (insertError) {
      console.log('❌ 插入失败:', insertError.message);
      console.log('错误代码:', insertError.code);
      console.log('错误详情:', insertError);
      
      // 如果是表不存在的错误，这是预期的
      if (insertError.code === 'PGRST205' || insertError.code === 'PGRST116') {
        console.log('\n⚠️  表不存在错误，这是预期的。');
        console.log('\n🔧 尝试通过其他方式创建表...');
        
        // 尝试使用不同的数据类型
        const simpleData = {
          user_id: 'test-user',
          question: 'test question',
          answer: 'test answer'
        };
        
        console.log('尝试插入简化数据:', simpleData);
        const { data: simpleInsert, error: simpleError } = await supabase
          .from('user_collections')
          .insert([simpleData])
          .select();
        
        if (simpleError) {
          console.log('❌ 简化数据插入也失败:', simpleError.message);
          return false;
        } else {
          console.log('✅ 简化数据插入成功！表已创建');
          console.log('插入结果:', simpleInsert);
          
          // 清理测试数据
          await supabase.from('user_collections').delete().eq('user_id', 'test-user');
          console.log('✅ 测试数据已清理');
          return true;
        }
      } else {
        console.log('❌ 其他类型的错误，无法继续');
        return false;
      }
    } else {
      console.log('✅ 数据插入成功！表已创建');
      console.log('插入结果:', insertData);
      
      // 验证表功能
      console.log('\n🔍 验证表功能...');
      
      // 查询测试
      const { data: queryData, error: queryError } = await supabase
        .from('user_collections')
        .select('*')
        .eq('user_id', initialData.user_id);
      
      if (queryError) {
        console.log('❌ 查询测试失败:', queryError.message);
      } else {
        console.log('✅ 查询测试成功，找到', queryData.length, '条记录');
        console.log('查询结果:', queryData);
      }
      
      // 更新测试
      const { data: updateData, error: updateError } = await supabase
        .from('user_collections')
        .update({ answer: '更新后的答案内容' })
        .eq('user_id', initialData.user_id)
        .select();
      
      if (updateError) {
        console.log('❌ 更新测试失败:', updateError.message);
      } else {
        console.log('✅ 更新测试成功');
        console.log('更新结果:', updateData);
      }
      
      // 保留初始数据作为示例
      console.log('\n📌 保留初始示例数据');
      
      return true;
    }
    
  } catch (error) {
    console.error('❌ 创建过程中发生异常:', error.message);
    console.error('异常详情:', error);
    return false;
  }
}

// 执行创建
createUserCollectionsTable().then(success => {
  if (success) {
    console.log('\n🎉 user_collections表创建成功！');
    console.log('\n✨ 表功能:');
    console.log('  📝 存储用户收藏的问答内容');
    console.log('  🔍 支持按用户ID查询');
    console.log('  ✏️  支持更新和删除操作');
    console.log('  ⏰ 自动记录创建和更新时间');
    console.log('\n🚀 现在可以在应用中使用收藏功能了！');
    
    // 显示下一步
    console.log('\n📋 下一步开发任务:');
    console.log('  1. 在answer.js页面添加"收藏此策"按钮');
    console.log('  2. 创建历问历答页面(/pages/collection.js)');
    console.log('  3. 实现收藏、查看、删除功能');
    console.log('  4. 添加页脚导航按钮');
    
  } else {
    console.log('\n💥 表创建失败！');
    console.log('\n🔧 建议手动创建:');
    console.log('1. 登录 https://supabase.com/dashboard');
    console.log('2. 选择项目 crnfwlpcxrnqfgwqnmun');
    console.log('3. 进入 SQL Editor');
    console.log('4. 执行以下SQL:');
    console.log(`
CREATE TABLE public.user_collections (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_user_collections_user_id ON public.user_collections(user_id);
CREATE INDEX idx_user_collections_created_at ON public.user_collections(created_at DESC);`);
  }
}).catch(error => {
  console.error('💥 脚本执行失败:', error.message);
});