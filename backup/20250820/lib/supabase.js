import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTAzMDQsImV4cCI6MjA3MDcyNjMwNH0.g_HmFQQiuGW2TZRzZ5gqCj098DZy6iwn_xQAE6kEUEI'

// 创建Supabase客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库操作函数
export const dbOperations = {
  // 暴露 supabase 客户端实例
  supabase,
  // 插入数据
  async insert(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
    
    if (error) {
      console.error('插入数据错误:', error)
      throw error
    }
    return result
  },

  // 查询数据
  async select(table, filters = {}) {
    let query = supabase.from(table).select('*')
    
    // 应用过滤条件
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    const { data, error } = await query
    
    if (error) {
      console.error('查询数据错误:', error)
      throw error
    }
    return data
  },

  // 更新数据
  async update(table, id, data) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('更新数据错误:', error)
      throw error
    }
    return result
  },

  // 删除数据
  async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('删除数据错误:', error)
      throw error
    }
    return true
  },

  // 测试连接
  async testConnection() {
    try {
      // 使用简单的RPC调用来测试连接
      const { data, error } = await supabase.rpc('version')
      
      if (error) {
        // 如果RPC调用失败，尝试查询一个可能不存在的表来测试连接
        const { error: testError } = await supabase
          .from('test_connection_table')
          .select('*')
          .limit(1)
        
        // 如果错误是表不存在，说明连接正常
        if (testError && (testError.code === 'PGRST116' || testError.code === '42P01')) {
          console.log('数据库连接成功!')
          return true
        }
        
        console.error('数据库连接测试失败:', testError || error)
        return false
      }
      
      console.log('数据库连接成功!')
      return true
    } catch (err) {
      console.error('连接测试异常:', err)
      return false
    }
  }
}