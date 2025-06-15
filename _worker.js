export default {
  async fetch(request, env) {
    // 1. 获取用户访问的URL对象
    let url = new URL(request.url);

    // 2. 【核心】将主机名替换为您的R2公共地址
    url.hostname = 'pub-772368ffda6d4136b022ac6b373aebe5.r2.dev'; 

    // 3. 用修改后的URL去创建一个新的请求，发往R2
    const r2Request = new Request(url, request);
    const r2Response = await fetch(r2Request);

    // 4. 【新增的】为从R2获取的响应，添加我们自定义的CORS响应头
    // 创建一个基于R2响应头、但可修改的新响应头对象
    const newHeaders = new Headers(r2Response.headers);

    // 设置允许跨域访问的来源 (最关键的一步)
    // 这里我直接使用了您的域名，比用"*"更安全
    newHeaders.set('Access-Control-Allow-Origin', '*');
    
    // 设置允许的请求方法
    newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    
    // 设置允许的请求头
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type');

    // 5. 返回一个新的响应：使用从R2获取到的原始内容，但附上我们修改过的新响应头
    return new Response(r2Response.body, {
      status: r2Response.status,
      statusText: r2Response.statusText,
      headers: newHeaders
    });
  }
};
