const { createClient } = require('@supabase/supabase-js')

// Supabase配置
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII'

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createUserCollectionsTable() {
  try {
    console.log('开始创建user_collections表...')
    
    // 首先检查 book_library 表的结构
    console.log('检查 book_library 表结构...')
    const { data: bookData, error: bookError } = await supabase
      .from('book_library')
      .select('*')
      .limit(1)
    
    if (bookError) {
      console.error('无法访问 book_library 表:', bookError)
      return
    }
    
    console.log('book_library 表结构:', bookData[0] ? Object.keys(bookData[0]) : '无数据')
    
    // 尝试使用 REST API 直接创建表
    console.log('尝试通过 REST API 创建表...')
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.user_collections (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        source_book TEXT,
        source_chapter TEXT,
        strategy_category TEXT,
        collected_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON public.user_collections(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_collections_strategy ON public.user_collections(strategy_category);
    `
    
    // 尝试通过 fetch 直接调用 Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql: createTableSQL })
    })
    
    if (response.ok) {
      console.log('表创建成功！')
    } else {
      const errorText = await response.text()
      console.log('REST API 创建失败:', errorText)
      
      // 如果 REST API 失败，尝试插入数据的方法
      console.log('尝试通过插入数据创建表...')
      
      const testData = {
        user_id: 'test-user',
        question: '测试问题',
        answer: '测试答案',
        source_book: '测试书籍',
        source_chapter: '测试章节',
        strategy_category: '测试分类',
        collected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('user_collections')
        .insert([testData])
      
      if (error) {
        console.error('插入数据创建表失败:', error)
        
        // 最后尝试：模仿 book_library 的数据结构
        console.log('尝试模仿 book_library 表结构...')
        const simpleData = {
          'user_id': 'test-user',
          'question': '测试问题',
          'answer': '测试答案'
        }
        
        const { data: simpleResult, error: simpleError } = await supabase
          .from('user_collections')
          .insert([simpleData])
        
        if (simpleError) {
          console.error('简单结构创建也失败:', simpleError)
        } else {
          console.log('简单结构创建成功！')
        }
      } else {
        console.log('通过插入数据创建表成功！')
        
        // 清理测试数据
        await supabase
          .from('user_collections')
          .delete()
          .eq('user_id', 'test-user')
      }
    }
    
    // 验证表是否存在
    console.log('验证表是否创建成功...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_collections')
      .select('*')
      .limit(1)
    
    if (verifyError) {
      console.error('表验证失败:', verifyError)
    } else {
      console.log('user_collections 表创建成功！')
    }
    
  } catch (error) {
    console.error('创建表时发生错误:', error)
  }
}

// 执行函数
createUserCollectionsTable()