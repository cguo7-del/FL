const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.mMCVXnY4JaeUZcUAcXPnHox3rqtM_eO18dx6aW1xFII';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testConnection() {
  try {
    console.log('测试Supabase连接...');
    
    // 尝试查询现有的conversations表来测试连接
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('conversations表查询失败:', error.message);
      console.log('这可能是正常的，如果表不存在的话');
    } else {
      console.log('✅ Supabase连接成功！');
      console.log('conversations表查询结果:', data);
      return true;
    }
    
    // 尝试执行一个简单的RPC调用来测试连接
    console.log('\n尝试执行SELECT NOW()查询...');
    try {
      // 使用原生SQL查询
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          sql: 'SELECT NOW() as current_time'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ SELECT NOW()查询成功:', result);
        return true;
      } else {
        const errorText = await response.text();
        console.log('SELECT NOW()查询失败:', errorText);
      }
    } catch (rpcError) {
      console.log('RPC调用失败:', rpcError.message);
    }
    
    // 最后尝试：检查Supabase客户端是否正确初始化
    console.log('\n检查Supabase客户端配置...');
    console.log('URL:', supabaseUrl);
    console.log('Service Role Key前10位:', serviceRoleKey.substring(0, 10) + '...');
    
    return false;
    
  } catch (error) {
    console.error('连接过程中出错:', error);
    return false;
  }
}

// 执行连接测试
testConnection().then(success => {
  if (success) {
    console.log('\n✅ Supabase连接测试通过，可以继续创建表');
  } else {
    console.log('\n❌ Supabase连接测试失败，请检查配置');
  }
});