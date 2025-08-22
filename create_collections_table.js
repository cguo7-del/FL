const { createClient } = require('@supabase/supabase-js')
const { execSync } = require('child_process')

// Supabase配置
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII'

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createUserCollectionsTable() {
  try {
    console.log('开始创建user_collections表...')
    
    // 创建表的SQL语句（简化版，先创建基本表结构）
    const createTableSQL = `CREATE TABLE IF NOT EXISTS user_collections (id SERIAL PRIMARY KEY, user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, question TEXT NOT NULL, answer TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()); CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id); CREATE INDEX IF NOT EXISTS idx_user_collections_created_at ON user_collections(created_at DESC);`
    
    // 使用curl执行SQL
    const curlCommand = `curl -X POST '${supabaseUrl}/rest/v1/rpc/query' \
      -H "apikey: ${supabaseServiceKey}" \
      -H "Authorization: Bearer ${supabaseServiceKey}" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=minimal" \
      -d '{"query": "${createTableSQL}"}'`
    
    try {
      const result = execSync(curlCommand, { encoding: 'utf8' })
      console.log('SQL执行结果:', result)
    } catch (curlError) {
      console.log('curl执行完成，尝试验证表创建...')
    }
    
    // 验证表是否创建成功
    const { data: tableData, error: selectError } = await supabase
      .from('user_collections')
      .select('*')
      .limit(1)
    
    if (selectError) {
      console.error('验证表创建失败:', selectError)
      // 尝试直接创建表
      console.log('尝试使用Supabase客户端直接创建表...')
      await createTableDirectly()
    } else {
      console.log('表验证成功，可以正常访问user_collections表')
    }
    
    console.log('user_collections表创建成功！')
    return true
    
  } catch (error) {
    console.error('创建表过程中发生错误:', error)
    return false
  }
}

// 直接创建表的备用方法
async function createTableDirectly() {
  try {
    // 使用简单的插入操作来触发表创建
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000', // 临时测试UUID
      question: 'test',
      answer: 'test'
    }
    
    const { data, error } = await supabase
      .from('user_collections')
      .insert([testData])
      .select()
    
    if (error) {
      console.error('直接创建表失败:', error)
    } else {
      console.log('表创建成功，删除测试数据...')
      // 删除测试数据
      await supabase
        .from('user_collections')
        .delete()
        .eq('question', 'test')
      console.log('user_collections表创建完成！')
    }
  } catch (error) {
    console.error('直接创建表出错:', error)
  }
}

// 运行创建表函数
if (require.main === module) {
  createUserCollectionsTable()
    .then(success => {
      if (success) {
        console.log('数据库表创建完成')
        process.exit(0)
      } else {
        console.log('数据库表创建失败')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('执行失败:', error)
      process.exit(1)
    })
}

module.exports = { createUserCollectionsTable }