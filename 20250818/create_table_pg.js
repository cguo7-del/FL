const { Client } = require('pg');

const client = new Client({
  host: 'db.crnfwlpcxrnqfgwqnmun.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Fanglue0723',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTable() {
  console.log('🚀 连接PostgreSQL数据库...');
  
  try {
    await client.connect();
    console.log('✅ 数据库连接成功!');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS book_library (
        id SERIAL PRIMARY KEY,
        book_name VARCHAR(255) NOT NULL,
        strategy_category VARCHAR(100) NOT NULL,
        chapter_name VARCHAR(255) NOT NULL,
        chapter_content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log('📝 执行创建表SQL...');
    const result = await client.query(createTableSQL);
    console.log('✅ book_library表创建成功!');
    
    // 检查表是否存在
    const checkTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'book_library';
    `);
    
    if (checkTable.rows.length > 0) {
      console.log('✅ 确认表已存在于数据库中');
    } else {
      console.log('❌ 表创建后未找到');
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    return false;
  } finally {
    await client.end();
    console.log('🔌 数据库连接已关闭');
  }
  
  return true;
}

// 执行创建表
createTable().then(success => {
  if (success) {
    console.log('\n✅ 表创建完成，现在可以运行 create_table_final.js 插入数据');
  } else {
    console.log('\n❌ 表创建失败，请检查错误信息');
  }
  process.exit(success ? 0 : 1);
});