// 定义拦截器类型
type RequestInterceptor = (options: RequestInit) => Promise<RequestInit>;
type ResponseInterceptor = (response: Response) => Promise<Response>;

// 定义拦截器存储
interface Interceptors {
  request: RequestInterceptor[];
  response: ResponseInterceptor[];
}

const interceptors: Interceptors = {
  request: [],
  response: []
};

/**
 * 添加请求拦截器
 * @param interceptor 请求拦截器函数
 */
export function addRequestInterceptor(interceptor: RequestInterceptor): void {
  interceptors.request.push(interceptor);
}

/**
 * 添加响应拦截器
 * @param interceptor 响应拦截器函数
 */
export function addResponseInterceptor(interceptor: ResponseInterceptor): void {
  interceptors.response.push(interceptor);
}

/**
 * 封装的fetch函数，支持拦截器
 * @param url 请求URL
 * @param options 请求选项
 * @returns Promise<Response>
 */
export async function customFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  url = "/api" + url;
  let modifiedOptions = { ...options };

  // 应用请求拦截器
  for (const interceptor of interceptors.request) {
    modifiedOptions = await interceptor(modifiedOptions);
  }

  // 执行原始 fetch 请求
  let response = await fetch(url, modifiedOptions);
  // 挂载原始请求信息
  /*(response as any).config = modifiedOptions;
  (response as any).url = url;*/

  if (response.status === 401) {
    // 避免并发多次刷新
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken().finally(() => {
        isRefreshing = false;
      });
    }
    try {
      await refreshPromise;
      // 重新发起原请求
      await customFetch(url, modifiedOptions);
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw e;
    }
  }

  // 应用响应拦截器
  for (const interceptor of interceptors.response) {
    response = await interceptor(response);
  }

  // 检查响应状态
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  // 解析响应数据
  return await response as T;
}

// 初始化默认拦截器
// 添加认证头的请求拦截器
addRequestInterceptor(async (options) => {
  const token = localStorage.getItem('token');
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    } as HeadersInit;
    if (!(options.body instanceof FormData)) {
      // 如果是FormData，删除 Content-Type 头
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json; charset=utf-8',
      };
    }
  }
  return options;
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// 刷新token的函数
async function refreshToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');
  const res = await fetch('/api/users/refresh-token', {
    method: 'GET',
    headers: {
      'RefreshToken': refreshToken
    }
  });
  const data = await res.json();
  if (data.code === 200 && data.data) {
    localStorage.setItem('token', data.data);
    return data.data;
  } else {
    throw new Error('Refresh token failed');
  }
}

// 响应拦截器
addResponseInterceptor(async (response) => {
  
  return response;
});

// 导出默认对象
export default {
  customFetch,
  addRequestInterceptor,
  addResponseInterceptor,
};

