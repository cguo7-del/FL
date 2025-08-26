const { Client } = require('pg');

// PostgreSQL连接配置
const dbPassword = process.env.SUPABASE_DB_PASSWORD || 'Fl20250818';
const connectionString = `postgresql://postgres.crnfwlpcxrnqfgwqnmun:${dbPassword}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;

console.log('使用数据库密码:', dbPassword.substring(0, 3) + '***');

async function createUserCollectionsTable() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔗 连接到PostgreSQL数据库...');
    await client.connect();
    console.log('✅ 数据库连接成功');

    // 创建user_collections表
    console.log('\n📝 创建user_collections表...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_collections (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    await client.query(createTableSQL);
    console.log('✅ user_collections表创建成功');

    // 创建索引
    console.log('\n📊 创建索引...');
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_collections_created_at ON user_collections(created_at DESC);'
    ];

    for (const indexSQL of createIndexes) {
      await client.query(indexSQL);
    }
    console.log('✅ 索引创建成功');

    // 启用行级安全性
    console.log('\n🔒 启用行级安全性...');
    await client.query('ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;');
    console.log('✅ 行级安全性已启用');

    // 创建RLS策略
    console.log('\n🛡️  创建RLS策略...');
    const policies = [
      `CREATE POLICY IF NOT EXISTS "Users can view own collections" ON user_collections
       FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can insert own collections" ON user_collections
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can update own collections" ON user_collections
       FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can delete own collections" ON user_collections
       FOR DELETE USING (auth.uid() = user_id);`
    ];

    for (const policy of policies) {
      try {
        await client.query(policy);
      } catch (policyError) {
        // 忽略策略已存在的错误
        if (!policyError.message.includes('already exists')) {
          console.log(`⚠️  策略创建警告: ${policyError.message}`);
        }
      }
    }
    console.log('✅ RLS策略创建完成');

    // 创建更新触发器
    console.log('\n⚡ 创建更新触发器...');
    const triggerFunction = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;
    
    const trigger = `
      CREATE TRIGGER IF NOT EXISTS update_user_collections_updated_at
      BEFORE UPDATE ON user_collections
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;
    
    await client.query(triggerFunction);
    await client.query(trigger);
    console.log('✅ 更新触发器创建成功');

    // 验证表创建
    console.log('\n🔍 验证表结构...');
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'user_collections'
      ORDER BY ordinal_position;
    `);
    
    console.log('表结构:');
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });

    // 测试插入和查询
    console.log('\n🧪 测试数据操作...');
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000',
      question: '测试问题',
      answer: '测试答案'
    };
    
    const insertResult = await client.query(
      'INSERT INTO user_collections (user_id, question, answer) VALUES ($1, $2, $3) RETURNING *',
      [testData.user_id, testData.question, testData.answer]
    );
    console.log('✅ 测试数据插入成功:', insertResult.rows[0]);
    
    // 查询测试数据
    const selectResult = await client.query(
      'SELECT * FROM user_collections WHERE user_id = $1',
      [testData.user_id]
    );
    console.log('✅ 测试数据查询成功:', selectResult.rows);
    
    // 清理测试数据
    await client.query(
      'DELETE FROM user_collections WHERE user_id = $1',
      [testData.user_id]
    );
    console.log('✅ 测试数据清理完成');

    console.log('\n🎉 user_collections表创建和配置完成！');
    console.log('\n表功能:');
    console.log('  ✅ 基本表结构 (id, user_id, question, answer, created_at, updated_at)');
    console.log('  ✅ 索引优化 (user_id, created_at)');
    console.log('  ✅ 行级安全性 (RLS)');
    console.log('  ✅ 用户权限策略');
    console.log('  ✅ 自动更新时间戳');
    console.log('  ✅ 数据操作测试通过');
    
    return true;
    
  } catch (error) {
    console.error('❌ 创建表过程中发生错误:', error.message);
    console.error('错误详情:', error);
    return false;
  } finally {
    try {
      await client.end();
      console.log('\n🔌 数据库连接已关闭');
    } catch (e) {
      console.error('关闭连接时出错:', e.message);
    }
  }
}

// 执行创建表操作
createUserCollectionsTable().then(success => {
  if (success) {
    console.log('\n🚀 数据库表创建任务完成！');
    console.log('现在可以在应用中使用user_collections表进行收藏功能开发。');
    process.exit(0);
  } else {
    console.log('\n💥 数据库表创建失败！');
    console.log('请检查:');
    console.log('1. 数据库连接配置是否正确');
    console.log('2. SUPABASE_DB_PASSWORD环境变量是否设置');
    console.log('3. 网络连接是否正常');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 脚本执行失败:', error.message);
  process.exit(1);
});