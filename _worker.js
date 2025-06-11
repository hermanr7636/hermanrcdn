export default {
  async fetch(request, env) {
    // 1. 获取用户访问的URL
    let url = new URL(request.url);

    // 2. 【核心】将主机名替换为你的R2公共地址
    url.hostname = 'pub-772368ffda6d4136b022ac6b373aebe5.r2.dev'; // ⚠️ 替换成你自己的R2公共地址!

    // 3. 用修改后的URL去请求R2
    let new_request = new Request(url, request);
    return fetch(new_request);
  }
};
