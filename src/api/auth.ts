const BASE_URL = import.meta.env.VITE_API_BASE;
console.log('VITE_API_BASE', BASE_URL);
export async function login(clientId: string, clientSecret: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/auth/v1/appToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret }),
  });
  const data = await res.json();
  if (data.code === '0' && data.data?.accessToken) {
    return data;
  } else {
    throw new Error(data.msg || '登录失败');
  }
}

export async function requestWithToken(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('accessToken');
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Authorization': token || '',
    },
  });
}