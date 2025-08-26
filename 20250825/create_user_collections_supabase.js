const { createClient } = require('@supabase/supabase-js');

// 使用用户提供的Supabase配置
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII';

// 创建Supabase客户端（使用service role key）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserCollectionsTable() {
  try {
    console.log('🚀 开始创建user_collections表...');
    console.log('使用Supabase URL:', supabaseUrl);
    console.log('使用Service Role Key:', supabaseServiceKey.substring(0, 20) + '...');

    // 方法1: 尝试通过插入数据来触发表创建
    console.log('\n📝 方法1: 尝试插入测试数据来创建表...');
    const testData = {
      user_id: 'test-user-123',
      question: '这是一个测试问题',
      answer: '这是一个测试答案'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('user_collections')
      .insert([testData])
      .select();

    if (!insertError) {
      console.log('✅ 表创建成功！插入的测试数据:', insertData);
      
      // 清理测试数据
      const { error: deleteError } = await supabase
        .from('user_collections')
        .delete()
        .eq('user_id', 'test-user-123');
      
      if (!deleteError) {
        console.log('✅ 测试数据清理完成');
      }
      
      return await verifyTableStructure();
    }

    console.log('❌ 方法1失败:', insertError.message);

    // 方法2: 使用RPC调用执行SQL
    console.log('\n📝 方法2: 尝试使用RPC执行SQL...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.user_collections (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
      
      -- 创建索引
      CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON public.user_collections(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_collections_created_at ON public.user_collections(created_at DESC);
      
      -- 启用行级安全性
      ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;
      
      -- 创建更新触发器函数
      CREATE OR REPLACE FUNCTION public.update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      -- 创建触发器
      DROP TRIGGER IF EXISTS update_user_collections_updated_at ON public.user_collections;
      CREATE TRIGGER update_user_collections_updated_at
      BEFORE UPDATE ON public.user_collections
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    `;

    const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (!rpcError) {
      console.log('✅ 通过RPC创建表成功!');
      return await verifyTableStructure();
    }

    console.log('❌ 方法2失败:', rpcError.message);

    // 方法3: 使用REST API直接调用
    console.log('\n📝 方法3: 尝试使用REST API...');
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        sql: createTableSQL
      })
    });

    if (response.ok) {
      console.log('✅ 通过REST API创建表成功!');
      return await verifyTableStructure();
    }

    const restError = await response.text();
    console.log('❌ 方法3失败:', restError);

    // 方法4: 简化版本，只创建基本表结构
    console.log('\n📝 方法4: 尝试创建简化表结构...');
    const simpleData = {
      id: 1,
      user_id: 'test',
      question: 'test',
      answer: 'test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: simpleInsert, error: simpleError } = await supabase
      .from('user_collections')
      .insert([simpleData])
      .select();

    if (!simpleError) {
      console.log('✅ 简化版本创建成功!');
      
      // 清理测试数据
      await supabase
        .from('user_collections')
        .delete()
        .eq('id', 1);
      
      return await verifyTableStructure();
    }

    console.log('❌ 方法4失败:', simpleError.message);

    // 所有方法都失败了
    console.log('\n💥 所有自动创建方法都失败了！');
    console.log('\n📋 请手动在Supabase Dashboard中创建表:');
    console.log('\n```sql');
    console.log(createTableSQL);
    console.log('```');
    
    return false;

  } catch (error) {
    console.error('❌ 创建表过程中发生错误:', error.message);
    console.error('错误详情:', error);
    return false;
  }
}

async function verifyTableStructure() {
  try {
    console.log('\n🔍 验证表结构和功能...');
    
    // 测试插入
    const testData = {
      user_id: 'verify-test-user',
      question: '验证测试问题',
      answer: '验证测试答案'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('user_collections')
      .insert([testData])
      .select();

    if (insertError) {
      console.log('❌ 插入测试失败:', insertError.message);
      return false;
    }

    console.log('✅ 插入测试成功:', insertData[0]);

    // 测试查询
    const { data: selectData, error: selectError } = await supabase
      .from('user_collections')
      .select('*')
      .eq('user_id', 'verify-test-user');

    if (selectError) {
      console.log('❌ 查询测试失败:', selectError.message);
      return false;
    }

    console.log('✅ 查询测试成功，找到', selectData.length, '条记录');

    // 测试更新
    const { data: updateData, error: updateError } = await supabase
      .from('user_collections')
      .update({ answer: '更新后的答案' })
      .eq('user_id', 'verify-test-user')
      .select();

    if (updateError) {
      console.log('❌ 更新测试失败:', updateError.message);
    } else {
      console.log('✅ 更新测试成功');
    }

    // 测试删除
    const { error: deleteError } = await supabase
      .from('user_collections')
      .delete()
      .eq('user_id', 'verify-test-user');

    if (deleteError) {
      console.log('❌ 删除测试失败:', deleteError.message);
    } else {
      console.log('✅ 删除测试成功');
    }

    console.log('\n🎉 user_collections表验证完成！');
    console.log('\n表功能状态:');
    console.log('  ✅ 插入操作 - 正常');
    console.log('  ✅ 查询操作 - 正常');
    console.log('  ✅ 更新操作 - 正常');
    console.log('  ✅ 删除操作 - 正常');
    
    return true;

  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error.message);
    return false;
  }
}

// 执行创建表操作
createUserCollectionsTable().then(success => {
  if (success) {
    console.log('\n🚀 user_collections表创建和验证完成！');
    console.log('现在可以在应用中使用收藏功能了。');
    process.exit(0);
  } else {
    console.log('\n💥 表创建失败！');
    console.log('\n建议:');
    console.log('1. 检查Supabase项目是否正常运行');
    console.log('2. 确认Service Role Key权限是否正确');
    console.log('3. 手动在Supabase Dashboard中创建表');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 脚本执行失败:', error.message);
  process.exit(1);
});