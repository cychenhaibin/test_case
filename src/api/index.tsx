import { requestWithToken } from './auth';
console.log('VITE_API_BASE', import.meta.env.VITE_API_BASE);

// 获取对象元数据
export async function getTableData() {
    const res = await requestWithToken(
        '/api/data/v1/namespaces/package_d6426c__c/meta/objects/object_cbb246f2bd1',
        { method: 'GET' }
    );
    const data = res.data;
    if (data.code !== '0') {
        throw new Error(data.msg || '接口请求失败');
    }
    return data;
}

// 获取case数据
export async function getCaseData(params: any) {
    const res = await requestWithToken(
        '/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records_query',
        { 
            method: 'POST',
            body: JSON.stringify(params),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    const data = res.data;
    return data;
}

// 单个数据删除
export async function deleteRecord(_id: string) {
    const res = await requestWithToken(
        `/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records/${_id}`,
        { method: 'DELETE' }
    );
    const data = res.data;
    if (data.code !== '0') {
        throw new Error(data.msg || '删除失败');
    }
    return data;
}

// 编辑数据
export async function editRecord(_id: string, params: any) {
    const res = await requestWithToken(
        `/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records/${_id}`,
        { 
            method: 'PATCH',
            body: JSON.stringify(params),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    const data = res.data;
    return data;
}

// 新增数据
export async function createRecord(params: any) {
    const res = await requestWithToken(
        '/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records',
        { 
            method: 'POST',
            body: JSON.stringify(params),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    const data = res.data;
    return data;
}

// 批量数据删除
export async function deleteRecords(ids: string[]) {
    const res = await requestWithToken(
        '/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records_batch',
        {
            method: 'DELETE',
            body: JSON.stringify({ ids }),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    const data = res.data;
    if (data.code !== '0') {
        throw new Error(data.msg || '批量删除失败');
    }
    return data;
}