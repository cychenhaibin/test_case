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

export async function getCaseData(params: any) {
    const res = await requestWithToken(
        `${BASE_URL}/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records_query`,
        { 
            method: 'POST',
            body: JSON.stringify(params),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    const data = await res.json();
    return data;
}

export async function deleteRecord(_id: string) {
    const res = await requestWithToken(
        `${BASE_URL}/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records/${_id}`,
        { method: 'DELETE' }
    );
    const data = await res.json();
    if (data.code !== '0') {
        throw new Error(data.msg || '删除失败');
    }
    return data;
}

export async function editRecord(_id: string, params: any) {
    const res = await requestWithToken(
        `${BASE_URL}/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records/${_id}`,
        { 
            method: 'PATCH',
            body: JSON.stringify(params),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    const data = await res.json();
    return data;
}

export async function createRecord(params: any) {
    const res = await requestWithToken(
        `${BASE_URL}/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records`,
        { 
            method: 'POST',
            body: JSON.stringify(params),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    const data = await res.json();
    return data;
}