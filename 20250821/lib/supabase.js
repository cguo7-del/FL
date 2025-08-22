import { createClient } from '@supabase/supabase-js'

// Supabase配置 - 支持环境变量和fallback
const supabaseUrl = process.env.SUPABASE_URL || 'https://crnfwlpcxrnqfgwqnmun.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTAzMDQsImV4cCI6MjA3MDcyNjMwNH0.g_HmFQQiuGW2TZRzZ5gqCj098DZy6iwn_xQAE6kEUEI'

// 创建Supabase客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Supabase错误信息本地化
export const localizeSupabaseError = (error) => {
  const errorMessages = {
    'Invalid login credentials': '登录凭证无效，请检查邮箱和密码',
    'Email not confirmed': '邮箱未验证，请检查您的邮箱并点击验证链接',
    'User already registered': '该邮箱已被注册，请使用其他邮箱或直接登录',
    'Password should be at least 6 characters': '密码至少需要6个字符',
    'Signup requires a valid password': '注册需要有效的密码',
    'Invalid email': '邮箱格式不正确',
    'Email rate limit exceeded': '邮件发送频率过高，请稍后再试',
    'Too many requests': '请求过于频繁，请稍后再试',
    'Network request failed': '网络请求失败，请检查网络连接',
    'User not found': '用户不存在',
    'Email already taken': '该邮箱已被使用',
    'Weak password': '密码强度不够，请使用更复杂的密码'
  }
  
  if (error?.message) {
    return errorMessages[error.message] || error.message
  }
  
  return '发生未知错误，请稍后重试'
}

// 认证相关功能
export const authOperations = {
  // 用户注册
  async signUp(email, password, username) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      })
      
      if (error) {
        throw new Error(localizeSupabaseError(error))
      }
      
      return data
    } catch (error) {
      throw new Error(localizeSupabaseError(error))
    }
  },
  
  // 用户登录
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        throw new Error(localizeSupabaseError(error))
      }
      
      return data
    } catch (error) {
      throw new Error(localizeSupabaseError(error))
    }
  },
  
  // 用户登出
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw new Error(localizeSupabaseError(error))
      }
      
      return true
    } catch (error) {
      throw new Error(localizeSupabaseError(error))
    }
  },
  
  // 获取当前用户
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        throw new Error(localizeSupabaseError(error))
      }
      
      return user
    } catch (error) {
      throw new Error(localizeSupabaseError(error))
    }
  },
  
  // 监听认证状态变化
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

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

// 收藏功能相关操作
export const collectionOperations = {
  // 收藏问题和答案
  async saveCollection(userId, question, answer) {
    try {
      const { data, error } = await supabase
        .from('user_collections')
        .insert({
          user_id: userId,
          question: question,
          answer: answer
        })
        .select()
      
      if (error) {
        console.error('收藏保存失败:', error)
        throw error
      }
      
      return data[0]
    } catch (error) {
      console.error('收藏操作异常:', error)
      throw error
    }
  },

  // 获取用户的收藏列表（分页）
  async getUserCollections(userId, page = 1, pageSize = 10) {
    try {
      const offset = (page - 1) * pageSize
      
      const { data, error, count } = await supabase
        .from('user_collections')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .range(offset, offset + pageSize - 1)
      
      if (error) {
        console.error('获取收藏列表失败:', error)
        throw error
      }
      
      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    } catch (error) {
      console.error('获取收藏列表异常:', error)
      throw error
    }
  },

  // 删除收藏项
  async deleteCollections(collectionIds) {
    try {
      const { error } = await supabase
        .from('user_collections')
        .delete()
        .in('id', collectionIds)
      
      if (error) {
        console.error('删除收藏失败:', error)
        throw error
      }
      
      return true
    } catch (error) {
      console.error('删除收藏异常:', error)
      throw error
    }
  },

  // 检查问题和答案是否已被收藏
  async checkIfCollected(userId, question, answerContent = null) {
    try {
      let query = supabase
        .from('user_collections')
        .select('id')
        .eq('user_id', userId)
        .eq('question', question)
      
      // 如果提供了答案内容，则同时检查答案
      if (answerContent) {
        query = query.ilike('answer', `%${answerContent}%`)
      }
      
      const { data, error } = await query.limit(1)
      
      if (error) {
        console.error('检查收藏状态失败:', error)
        throw error
      }
      
      return data && data.length > 0
    } catch (error) {
      console.error('检查收藏状态异常:', error)
      throw error
    }
  }
}