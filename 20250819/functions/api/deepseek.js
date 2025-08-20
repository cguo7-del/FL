// Cloudflare Pages Function for DeepSeek API
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: '缺少prompt参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      // 调用DeepSeek API（使用正确的端点）
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DEEPSEEK_API_KEY || 'sk-3dd5328db9d44d9cb4e6e7df02ee4b2d'}`
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
        return new Response(JSON.stringify({ 
          error: `DeepSeek API错误: ${response.status} ${response.statusText}`,
          details: errorText
        }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content;
        return new Response(JSON.stringify({ content }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        console.error('DeepSeek API返回数据格式错误:', data);
        return new Response(JSON.stringify({ error: 'DeepSeek API返回数据格式错误' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

    } catch (fetchError) {
      console.error('DeepSeek API调用失败:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'DeepSeek API调用失败',
        details: fetchError.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('服务器内部错误:', error);
    return new Response(JSON.stringify({ 
      error: '服务器内部错误',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 只允许POST请求
export async function onRequest(context) {
  if (context.request.method === 'POST') {
    return onRequestPost(context);
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}