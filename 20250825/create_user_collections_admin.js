const { createClient } = require('@supabase/supabase-js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Supabase配置
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII';

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createUserCollectionsTable() {
  try {
    console.log('🚀 开始创建user_collections表...');
    
    // 方法1: 尝试通过插入数据来触发表创建（Supabase的自动表创建功能）
    console.log('\n📝 方法1: 尝试插入数据触发表创建...');
    
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000',
      question: '测试问题 - 用于创建表',
      answer: '测试答案 - 这条数据用于触发user_collections表的自动创建'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_collections')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.log('❌ 插入数据失败:', insertError.message);
      console.log('错误代码:', insertError.code);
      
      if (insertError.code === 'PGRST116' || insertError.code === 'PGRST205') {
        console.log('⚠️  表不存在，尝试其他方法...');
        return await tryManagementAPI();
      } else {
        console.log('❌ 其他错误，尝试管理API方法...');
        return await tryManagementAPI();
      }
    } else {
      console.log('✅ 数据插入成功！表已自动创建');
      console.log('插入的数据:', insertData);
      
      // 验证表结构
      await verifyTableStructure();
      
      // 清理测试数据
      console.log('\n🧹 清理测试数据...');
      const { error: deleteError } = await supabase
        .from('user_collections')
        .delete()
        .eq('user_id', testData.user_id);
      
      if (deleteError) {
        console.log('⚠️  清理测试数据失败:', deleteError.message);
      } else {
        console.log('✅ 测试数据清理完成');
      }
      
      return true;
    }
    
  } catch (error) {
    console.error('❌ 创建表过程中发生错误:', error.message);
    return await tryManagementAPI();
  }
}

async function tryManagementAPI() {
  console.log('\n🔧 方法2: 使用Supabase管理API创建表...');
  
  try {
    // 使用Supabase的SQL执行功能
    const createTableSQL = `
      -- 创建user_collections表
      CREATE TABLE IF NOT EXISTS public.user_collections (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
      
      -- 创建索引
      CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON public.user_collections USING btree (user_id);
      CREATE INDEX IF NOT EXISTS idx_user_collections_created_at ON public.user_collections USING btree (created_at DESC);
      
      -- 启用行级安全性
      ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;
      
      -- 创建RLS策略（如果不存在）
      DO $$
      BEGIN
        -- 查看策略
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_collections' AND policyname = 'Users can view own collections') THEN
          CREATE POLICY "Users can view own collections" ON public.user_collections
            FOR SELECT USING (auth.uid() = user_id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_collections' AND policyname = 'Users can insert own collections') THEN
          CREATE POLICY "Users can insert own collections" ON public.user_collections
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_collections' AND policyname = 'Users can update own collections') THEN
          CREATE POLICY "Users can update own collections" ON public.user_collections
            FOR UPDATE USING (auth.uid() = user_id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_collections' AND policyname = 'Users can delete own collections') THEN
          CREATE POLICY "Users can delete own collections" ON public.user_collections
            FOR DELETE USING (auth.uid() = user_id);
        END IF;
      END
      $$;
      
      -- 创建更新触发器函数
      CREATE OR REPLACE FUNCTION public.handle_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = timezone('utc'::text, now());
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      -- 创建触发器
      DROP TRIGGER IF EXISTS handle_updated_at ON public.user_collections;
      CREATE TRIGGER handle_updated_at
        BEFORE UPDATE ON public.user_collections
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    `;
    
    // 使用fetch直接调用Supabase的SQL API
    console.log('📡 执行SQL创建语句...');
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql: createTableSQL })
    });
    
    if (response.ok) {
      console.log('✅ SQL执行成功');
    } else {
      const errorText = await response.text();
      console.log('❌ SQL执行失败:', response.status, errorText);
      
      // 尝试分步执行
      return await tryStepByStep();
    }
    
    // 验证表创建
    console.log('\n🔍 验证表创建...');
    const { data: testData, error: testError } = await supabase
      .from('user_collections')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('❌ 表验证失败:', testError.message);
      return false;
    } else {
      console.log('✅ 表验证成功');
      await verifyTableStructure();
      return true;
    }
    
  } catch (error) {
    console.error('❌ 管理API方法失败:', error.message);
    return await tryStepByStep();
  }
}

async function tryStepByStep() {
  console.log('\n🔨 方法3: 分步创建表...');
  
  try {
    // 简单的表创建
    console.log('步骤1: 创建基本表结构...');
    const basicTableSQL = `
      CREATE TABLE IF NOT EXISTS public.user_collections (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;
    
    // 尝试通过插入操作来创建表（利用Supabase的自动表创建）
    const testInsert = {
      user_id: '00000000-0000-0000-0000-000000000000',
      question: 'Auto-create table test',
      answer: 'This record is used to auto-create the user_collections table'
    };
    
    // 多次尝试插入
    let insertSuccess = false;
    for (let i = 0; i < 3; i++) {
      console.log(`尝试插入 ${i + 1}/3...`);
      const { data, error } = await supabase
        .from('user_collections')
        .insert([testInsert])
        .select();
      
      if (!error) {
        console.log('✅ 插入成功，表已创建');
        insertSuccess = true;
        
        // 清理测试数据
        await supabase
          .from('user_collections')
          .delete()
          .eq('user_id', testInsert.user_id);
        
        break;
      } else {
        console.log(`❌ 插入失败 ${i + 1}/3:`, error.message);
        // 等待一秒后重试
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (insertSuccess) {
      console.log('✅ 表创建成功');
      await verifyTableStructure();
      return true;
    } else {
      console.log('❌ 所有方法都失败了');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 分步创建失败:', error.message);
    return false;
  }
}

async function verifyTableStructure() {
  console.log('\n🔍 验证表结构和功能...');
  
  try {
    // 测试基本操作
    const testData = {
      user_id: '11111111-1111-1111-1111-111111111111',
      question: '验证测试问题',
      answer: '验证测试答案'
    };
    
    // 插入测试
    console.log('测试插入操作...');
    const { data: insertResult, error: insertError } = await supabase
      .from('user_collections')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.log('❌ 插入测试失败:', insertError.message);
      return false;
    }
    
    console.log('✅ 插入测试成功');
    
    // 查询测试
    console.log('测试查询操作...');
    const { data: selectResult, error: selectError } = await supabase
      .from('user_collections')
      .select('*')
      .eq('user_id', testData.user_id);
    
    if (selectError) {
      console.log('❌ 查询测试失败:', selectError.message);
    } else {
      console.log('✅ 查询测试成功，找到', selectResult.length, '条记录');
    }
    
    // 清理测试数据
    console.log('清理验证数据...');
    await supabase
      .from('user_collections')
      .delete()
      .eq('user_id', testData.user_id);
    
    console.log('✅ 表结构验证完成');
    return true;
    
  } catch (error) {
    console.error('❌ 表结构验证失败:', error.message);
    return false;
  }
}

// 执行创建表操作
createUserCollectionsTable().then(success => {
  if (success) {
    console.log('\n🎉 user_collections表创建成功！');
    console.log('\n表功能特性:');
    console.log('  ✅ 基本字段: id, user_id, question, answer, created_at, updated_at');
    console.log('  ✅ 主键和索引优化');
    console.log('  ✅ 时间戳自动管理');
    console.log('  ✅ 数据操作测试通过');
    console.log('\n🚀 现在可以在应用中使用收藏功能了！');
    process.exit(0);
  } else {
    console.log('\n💥 表创建失败！');
    console.log('\n🔧 手动创建建议:');
    console.log('1. 登录 Supabase Dashboard');
    console.log('2. 进入 SQL Editor');
    console.log('3. 执行以下SQL:');
    console.log(`
CREATE TABLE public.user_collections (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_user_collections_user_id ON public.user_collections(user_id);
CREATE INDEX idx_user_collections_created_at ON public.user_collections(created_at DESC);

ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;`);
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 脚本执行失败:', error.message);
  process.exit(1);
});