// DeepSeek API代理端点
export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: '缺少prompt参数' });
    }

    try {
      // 调用DeepSeek API（使用正确的端点）
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-3dd5328db9d44d9cb4e6e7df02ee4b2d'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API响应错误:', response.status, response.statusText, errorText);
        return res.status(response.status).json({ 
          error: `DeepSeek API错误: ${response.status} ${response.statusText}`,
          details: errorText
        });
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content;
        return res.status(200).json({ content });
      } else {
        console.error('DeepSeek API返回数据格式错误:', data);
        return res.status(500).json({ error: 'DeepSeek API返回数据格式错误' });
      }

    } catch (fetchError) {
      console.error('DeepSeek API调用失败:', fetchError);
      return res.status(500).json({ 
        error: 'DeepSeek API调用失败',
        details: fetchError.message 
      });
    }

  } catch (error) {
    console.error('服务器内部错误:', error);
    return res.status(500).json({ 
      error: '服务器内部错误',
      details: error.message 
    });
  }
}