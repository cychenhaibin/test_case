import axios from 'axios';

// 这里用环境变量，支持多环境切换
const baseURL = 'https://ae-openapi.feishu.cn';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;