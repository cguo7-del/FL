const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

// 直接配置Supabase信息（从lib/supabase.js复制）
const supabaseUrl = 'https://crnfwlpcxrnqfgwqnmun.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTAzMDQsImV4cCI6MjA3MDcyNjMwNH0.g_HmFQQiuGW2TZRzZ5gqCj098DZy6iwn_xQAE6kEUEI';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybmZ3bHBjeHJucWZnd3FubXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE1MDMwNCwiZXhwIjoyMDcwNzI2MzA0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

async function testEnvironmentVariables() {
  console.log(colors.blue('\n🔍 检查环境变量配置...'));
  console.log('=' .repeat(50));
  
  const checks = [
    { name: 'SUPABASE_URL', value: supabaseUrl, required: true },
    { name: 'SUPABASE_ANON_KEY', value: supabaseAnonKey, required: true },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: supabaseServiceKey, required: true },
    { name: 'NODE_ENV', value: process.env.NODE_ENV, required: false }
  ];
  
  let allValid = true;
  
  checks.forEach(check => {
    const status = check.value ? colors.green('✅') : colors.red('❌');
    const valueDisplay = check.value ? 
      (check.value.length > 50 ? check.value.substring(0, 47) + '...' : check.value) : 
      colors.red('未设置');
    
    console.log(`${status} ${check.name}: ${valueDisplay}`);
    
    if (check.required && !check.value) {
      allValid = false;
    }
  });
  
  if (!allValid) {
    console.log(colors.red('\n❌ 必需的环境变量未正确设置'));
    return false;
  }
  
  console.log(colors.green('\n✅ 所有环境变量配置正确'));
  return true;
}

async function testSupabaseAnonConnection() {
  console.log(colors.blue('\n🔍 测试 Supabase 匿名客户端连接...'));
  console.log('=' .repeat(50));
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 测试1: 基本连接测试
    console.log('测试1: 基本连接测试...');
    const { data, error } = await supabase.from('conversations').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(colors.yellow('⚠️  conversations表不存在，但连接正常'));
      } else {
        console.log(colors.red(`❌ 连接错误: ${error.message}`));
        return false;
      }
    } else {
      console.log(colors.green('✅ 匿名客户端连接成功'));
    }
    
    // 测试2: 权限测试
    console.log('测试2: 权限测试...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log(`会话状态: ${authData.session ? '已认证' : '匿名'}`);
    
    return true;
  } catch (error) {
    console.log(colors.red(`❌ 匿名客户端连接失败: ${error.message}`));
    return false;
  }
}

async function testSupabaseServiceRoleConnection() {
  console.log(colors.blue('\n🔍 测试 Supabase Service Role 连接...'));
  console.log('=' .repeat(50));
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 测试1: Service Role权限测试
    console.log('测试1: Service Role权限测试...');
    const { data, error } = await supabase.from('conversations').select('*').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(colors.yellow('⚠️  conversations表不存在，但Service Role连接正常'));
      } else {
        console.log(colors.red(`❌ Service Role连接错误: ${error.message}`));
        return false;
      }
    } else {
      console.log(colors.green('✅ Service Role连接成功'));
    }
    
    // 测试2: 管理员权限测试
    console.log('测试2: 管理员权限测试...');
    try {
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5);
      
      if (schemaError) {
        console.log(colors.yellow(`⚠️  无法查询schema信息: ${schemaError.message}`));
      } else {
        console.log(colors.green(`✅ 找到 ${schemaData.length} 个公共表`));
      }
    } catch (err) {
      console.log(colors.yellow(`⚠️  Schema查询失败: ${err.message}`));
    }
    
    return true;
  } catch (error) {
    console.log(colors.red(`❌ Service Role连接失败: ${error.message}`));
    return false;
  }
}

async function testDirectPostgreSQLConnection() {
  console.log(colors.blue('\n🔍 测试直接 PostgreSQL 数据库连接...'));
  console.log('=' .repeat(50));
  
  // 从Supabase URL提取连接信息
  const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!urlMatch) {
    console.log(colors.red('❌ 无法从Supabase URL提取项目ID'));
    return false;
  }
  
  const projectId = urlMatch[1];
  const connectionConfig = {
    host: `db.${projectId}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  };
  
  console.log(`连接配置:`);
  console.log(`  Host: ${connectionConfig.host}`);
  console.log(`  Port: ${connectionConfig.port}`);
  console.log(`  Database: ${connectionConfig.database}`);
  console.log(`  User: ${connectionConfig.user}`);
  console.log(`  Password: ${connectionConfig.password && connectionConfig.password.length > 0 ? '***已设置***' : '未设置'}`);
  
  if (!connectionConfig.password) {
    console.log(colors.yellow('⚠️  数据库密码未设置，跳过直接PostgreSQL连接测试'));
    console.log(colors.cyan('💡 提示: 设置 SUPABASE_DB_PASSWORD 环境变量来启用此测试'));
    return false;
  }
  
  const client = new Client(connectionConfig);
  
  try {
    console.log('正在连接PostgreSQL数据库...');
    await client.connect();
    console.log(colors.green('✅ PostgreSQL连接成功'));
    
    // 测试基本查询
    console.log('测试基本查询...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log(colors.green(`✅ 当前时间: ${result.rows[0].current_time}`));
    console.log(colors.green(`✅ PostgreSQL版本: ${result.rows[0].pg_version.split(' ')[0]}`));
    
    // 测试表查询
    console.log('查询现有表...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log(colors.green(`✅ 找到 ${tablesResult.rows.length} 个表:`));
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log(colors.yellow('⚠️  未找到任何表'));
    }
    
    await client.end();
    return true;
  } catch (error) {
    console.log(colors.red(`❌ PostgreSQL连接失败: ${error.message}`));
    try {
      await client.end();
    } catch (e) {}
    return false;
  }
}

async function testRESTAPIDirectly() {
  console.log(colors.blue('\n🔍 测试 Supabase REST API 直接调用...'));
  console.log('=' .repeat(50));
  
  try {
    // 测试1: 匿名API调用
    console.log('测试1: 匿名API调用...');
    const anonResponse = await fetch(`${supabaseUrl}/rest/v1/conversations?select=count`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    console.log(`匿名API状态码: ${anonResponse.status}`);
    if (anonResponse.status === 200) {
      console.log(colors.green('✅ 匿名API调用成功'));
    } else if (anonResponse.status === 406) {
      console.log(colors.yellow('⚠️  表不存在，但API端点可访问'));
    } else {
      const errorText = await anonResponse.text();
      console.log(colors.red(`❌ 匿名API调用失败: ${errorText}`));
    }
    
    // 测试2: Service Role API调用
    console.log('测试2: Service Role API调用...');
    const serviceResponse = await fetch(`${supabaseUrl}/rest/v1/conversations?select=count`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    console.log(`Service Role API状态码: ${serviceResponse.status}`);
    if (serviceResponse.status === 200) {
      console.log(colors.green('✅ Service Role API调用成功'));
    } else if (serviceResponse.status === 406) {
      console.log(colors.yellow('⚠️  表不存在，但Service Role API端点可访问'));
    } else {
      const errorText = await serviceResponse.text();
      console.log(colors.red(`❌ Service Role API调用失败: ${errorText}`));
    }
    
    return true;
  } catch (error) {
    console.log(colors.red(`❌ REST API测试失败: ${error.message}`));
    return false;
  }
}

function provideDiagnosticSuggestions(results) {
  console.log(colors.blue('\n🔧 诊断建议和解决方案'));
  console.log('=' .repeat(50));
  
  if (!results.envVars) {
    console.log(colors.red('🚨 环境变量问题:'));
    console.log('  1. 检查 lib/supabase.js 文件是否存在');
    console.log('  2. 确认 SUPABASE_URL 和 SUPABASE_ANON_KEY 已正确设置');
    console.log('  3. 设置 SUPABASE_SERVICE_ROLE_KEY 环境变量');
  }
  
  if (!results.anonConnection) {
    console.log(colors.red('🚨 匿名连接问题:'));
    console.log('  1. 检查 Supabase URL 是否正确');
    console.log('  2. 检查匿名密钥是否有效');
    console.log('  3. 确认项目是否已暂停或删除');
  }
  
  if (!results.serviceConnection) {
    console.log(colors.red('🚨 Service Role连接问题:'));
    console.log('  1. 检查 Service Role 密钥是否正确');
    console.log('  2. 确认密钥权限是否足够');
    console.log('  3. 检查项目设置中的API密钥');
  }
  
  if (!results.pgConnection) {
    console.log(colors.yellow('⚠️  PostgreSQL直接连接问题:'));
    console.log('  1. 设置 SUPABASE_DB_PASSWORD 环境变量');
    console.log('  2. 在Supabase Dashboard > Settings > Database 中找到密码');
    console.log('  3. 确认数据库连接设置允许外部连接');
  }
  
  console.log(colors.cyan('\n💡 通用建议:'));
  console.log('  1. 访问 Supabase Dashboard 检查项目状态');
  console.log('  2. 确认所有API密钥都是最新的');
  console.log('  3. 检查项目是否有任何使用限制');
  console.log('  4. 如果是新项目，确认已完成初始设置');
}

async function runComprehensiveTest() {
  console.log(colors.cyan('🚀 开始全面API连接测试'));
  console.log('=' .repeat(60));
  
  const results = {
    envVars: false,
    anonConnection: false,
    serviceConnection: false,
    pgConnection: false,
    restAPI: false
  };
  
  // 1. 环境变量检查
  results.envVars = await testEnvironmentVariables();
  
  if (results.envVars) {
    // 2. Supabase匿名连接测试
    results.anonConnection = await testSupabaseAnonConnection();
    
    // 3. Supabase Service Role连接测试
    results.serviceConnection = await testSupabaseServiceRoleConnection();
    
    // 4. 直接PostgreSQL连接测试
    results.pgConnection = await testDirectPostgreSQLConnection();
    
    // 5. REST API直接测试
    results.restAPI = await testRESTAPIDirectly();
  }
  
  // 6. 结果总结
  console.log(colors.blue('\n📊 测试结果总结'));
  console.log('=' .repeat(50));
  
  const testResults = [
    { name: '环境变量配置', status: results.envVars },
    { name: 'Supabase匿名连接', status: results.anonConnection },
    { name: 'Supabase Service Role连接', status: results.serviceConnection },
    { name: '直接PostgreSQL连接', status: results.pgConnection },
    { name: 'REST API直接调用', status: results.restAPI }
  ];
  
  testResults.forEach(test => {
    const status = test.status ? colors.green('✅ 通过') : colors.red('❌ 失败');
    console.log(`${status} ${test.name}`);
  });
  
  const passedTests = testResults.filter(test => test.status).length;
  const totalTests = testResults.length;
  
  console.log(colors.cyan(`\n🎯 总体结果: ${passedTests}/${totalTests} 项测试通过`));
  
  if (passedTests === totalTests) {
    console.log(colors.green('🎉 所有连接测试通过！系统配置正确。'));
  } else {
    provideDiagnosticSuggestions(results);
  }
}

// 运行测试
runComprehensiveTest().catch(error => {
  console.error(colors.red(`\n💥 测试过程中发生错误: ${error.message}`));
  process.exit(1);
});