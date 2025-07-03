import { requestWithToken } from './auth';
const BASE_URL = import.meta.env.VITE_API_BASE;
console.log('VITE_API_BASE', BASE_URL);
export async function getTableData() {
    const res = await requestWithToken(
        `${BASE_URL}/api/data/v1/namespaces/package_d6426c__c/meta/objects/object_cbb246f2bd1`,
        { method: 'GET' }
    );
    const data = await res.json();
    if (data.code !== '0') {
        throw new Error(data.msg || '接口请求失败');
    }
    return data;
}