import React, { useState, useEffect } from 'react';
import { dbOperations } from '../lib/supabase';
import styles from '../styles/Ask.module.css';

const TestDB = () => {
  const [connectionStatus, setConnectionStatus] = useState('测试中...');
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (message, success = true) => {
    setTestResults(prev => [...prev, { message, success, time: new Date().toLocaleTimeString() }]);
  };

  const runDatabaseTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // 1. 测试连接
      addTestResult('开始测试数据库连接...');
      const isConnected = await dbOperations.testConnection();
      if (isConnected) {
        addTestResult('✅ 数据库连接成功');
        setConnectionStatus('已连接');
      } else {
        addTestResult('❌ 数据库连接失败', false);
        setConnectionStatus('连接失败');
        return;
      }

      // 2. 测试插入数据
      addTestResult('测试插入数据...');
      const testData = {
        question: '这是一个测试问题',
        answer: '这是一个测试回答',
        created_at: new Date().toISOString()
      };
      
      try {
        const insertResult = await dbOperations.insert('conversations', testData);
        addTestResult('✅ 数据插入成功');
        
        // 3. 测试查询数据
        addTestResult('测试查询数据...');
        const selectResult = await dbOperations.select('conversations', { question: '这是一个测试问题' });
        if (selectResult && selectResult.length > 0) {
          addTestResult(`✅ 数据查询成功，找到 ${selectResult.length} 条记录`);
          
          // 4. 测试更新数据
          if (selectResult[0].id) {
            addTestResult('测试更新数据...');
            const updateResult = await dbOperations.update('conversations', selectResult[0].id, {
              answer: '这是更新后的测试回答'
            });
            addTestResult('✅ 数据更新成功');
            
            // 5. 测试删除数据
            addTestResult('测试删除数据...');
            await dbOperations.delete('conversations', selectResult[0].id);
            addTestResult('✅ 数据删除成功');
          }
        } else {
          addTestResult('❌ 数据查询失败', false);
        }
      } catch (error) {
        addTestResult(`❌ 数据库操作失败: ${error.message}`, false);
      }
      
    } catch (error) {
      addTestResult(`❌ 测试过程中出现错误: ${error.message}`, false);
      setConnectionStatus('测试失败');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // 页面加载时自动运行测试
    runDatabaseTests();
  }, []);

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>方略 - 数据库测试</div>
        <div className={styles.navLinks}>
          <a href="/" className={styles.navLink}>返回首页</a>
          <a href="/ask" className={styles.navLink}>问答页面</a>
          <div className={styles.dbStatus}>数据库: {connectionStatus}</div>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.questionForm}>
          <h1>Supabase 数据库测试</h1>
          <p>这个页面用于测试 Supabase 数据库的连接和基本 CRUD 操作。</p>
          
          <button 
            onClick={runDatabaseTests} 
            disabled={isRunning}
            className={styles.submitButton}
            style={{ marginBottom: '2rem' }}
          >
            {isRunning ? '测试进行中...' : '重新运行测试'}
          </button>

          <div style={{ 
            background: '#f5f5f5', 
            padding: '1rem', 
            borderRadius: '8px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            <h3>测试结果:</h3>
            {testResults.length === 0 ? (
              <p>暂无测试结果</p>
            ) : (
              testResults.map((result, index) => (
                <div 
                  key={index} 
                  style={{ 
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #ddd',
                    color: result.success ? '#4CAF50' : '#f44336'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>[{result.time}]</span> {result.message}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 方略. 数据库测试页面.</p>
      </footer>
    </div>
  );
};

export default TestDB;