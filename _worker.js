// 定义一个处理CORS预检请求（OPTIONS）和添加CORS头部的函数
function handleCors(request, responseHeaders) {
  // 从请求头中获取来源域
  const origin = request.headers.get('Origin');

  // 【安全建议】这里最好替换成您的网站域名，例如 'https://your-wordpress-site.com'
  // 使用 '*' 也可以，但安全性较低。
  responseHeaders.set('Access-Control-Allow-Origin', '*');

  // 如果是预检请求，我们需要设置更多头部信息
  if (request.method === 'OPTIONS') {
    // 允许的请求方法，关键是增加了 PUT 和 POST
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, PUT, POST, HEAD, DELETE, OPTIONS');
    // 允许所有请求头，'*' 对于兼容S3 API的插件（如Media Cloud）来说最省事
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    // 预检请求可以缓存的时间
    responseHeaders.set('Access-Control-Max-Age', '86400');
  } else {
    // 对于非预检请求，我们暴露 ETag 头，某些客户端需要它
    responseHeaders.set('Access-Control-Expose-Headers', 'ETag');
  }
}

export default {
  async fetch(request, env) {
    // 1. 【新增】专门处理 OPTIONS 预检请求
    // 如果是预检请求，我们不访问R2，直接返回带CORS头的空响应
    if (request.method === 'OPTIONS') {
      const headers = new Headers();
      handleCors(request, headers);
      return new Response(null, { headers });
    }

    // 2. 获取用户访问的URL对象
    let url = new URL(request.url);

    // 3. 【核心，保留您的设置】将主机名替换为您的R2公共地址
    url.hostname = 'pub-772368ffda6d4136b022ac6b373aebe5.r2.dev';

    // 4. 用修改后的URL去创建一个新的请求，发往R2
    const r2Request = new Request(url, request);
    const r2Response = await fetch(r2Request);

    // 5. 创建一个基于R2响应、但可修改的新响应头对象
    const newHeaders = new Headers(r2Response.headers);

    // 6. 【调用函数】为响应添加我们自定义的CORS响应头
    handleCors(request, newHeaders);

    // 7. 返回最终的响应
    return new Response(r2Response.body, {
      status: r2Response.status,
      statusText: r2Response.statusText,
      headers: newHeaders
    });
  }
};
