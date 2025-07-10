import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE;
console.log('VITE_API_BASE', BASE_URL);
export async function login(clientId: string, clientSecret: string): Promise<any> {
  const res = await axios.post(`${BASE_URL}/auth/v1/appToken`, {
    clientId,
    clientSecret,
  }, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = res.data;
  if (data.code === '0' && data.data?.accessToken) {
    return data;
  }
  return data;
}

export async function requestWithToken(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('accessToken');
  let headers: Record<string, string> = {};
  if (options.headers instanceof Headers) {
    options.headers.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (options.headers) {
    headers = { ...options.headers } as Record<string, string>;
  }
  headers['Authorization'] = token || '';

  return axios({
    url,
    method: options.method || 'GET',
    headers,
    data: options.body,
    // 不再展开options，避免不兼容的字段传递给axios
  });
}