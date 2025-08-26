const { createClient } = require('@supabase/supabase-js')

// Supabase配置
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII'

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createUserCollectionsTable() {
  try {
    console.log('开始创建user_collections表...')
    
    // 使用中文字段名，模仿 book_library 表的创建方式
    const testData = [
      {
        '用户ID': 'test-user-1',
        '问题': '什么是仁？',
        '答案': '仁者爱人，是孔子思想的核心概念。',
        '来源书籍': '论语',
        '来源章节': '学而第一',
        '方略经纬': '行正持礼'
      },
      {
        '用户ID': 'test-user-2',
        '问题': '如何理解道？', 
        '答案': '道可道，非常道。道是万物的本源和规律。',
        '来源书籍': '道德经',
        '来源章节': '第一章',
        '方略经纬': '顺势而为'
      }
    ]
    
    console.log('插入测试数据以创建表结构...')
    
    const { data, error } = await supabase
      .from('user_collections')
      .insert(testData)
    
    if (error) {
      console.error('插入数据时出错:', error)
      return
    }
    
    console.log('测试数据插入成功，表已创建！')
    
    // 验证表是否创建成功
    const { data: tableData, error: tableError } = await supabase
      .from('user_collections')
      .select('*')
    
    if (tableError) {
      console.error('验证表创建失败:', tableError)
    } else {
      console.log('表创建验证成功，当前记录数:', tableData.length)
      console.log('表结构:', tableData[0] ? Object.keys(tableData[0]) : '无数据')
    }
    
    // 清理测试数据
    console.log('清理测试数据...')
    const { error: deleteError } = await supabase
      .from('user_collections')
      .delete()
      .in('用户ID', ['test-user-1', 'test-user-2'])
    
    if (deleteError) {
      console.error('清理测试数据失败:', deleteError)
    } else {
      console.log('测试数据清理完成')
    }
    
    console.log('user_collections表创建成功！')
    
  } catch (error) {
    console.error('创建表时发生错误:', error)
  }
}

// 执行函数
createUserCollectionsTable()