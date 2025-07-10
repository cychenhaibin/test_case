import React, { useState } from 'react';
import ApiDetailLayout from './ApiDetailLayout';
import { getTableData } from '../../api';

// 假设你有一个getUserInfoById的接口方法
// import { getUserInfoById } from '../../api';

const mockResponse = {
    "code": "0",
    "data": {
        "apiName": "object_cbb246f2bd1",
        "label": {
            "zh_CN": "全字段",
            "en_US": ""
        },
        "type": "custom",
        "settings": {
            "allowSearchFields": [
                "_id"
            ],
            "displayName": "_id",
            "searchLayout": []
        },
        "fields": [
            {
                "apiName": "_name",
                "label": {
                    "zh_CN": "展示名称",
                    "en_US": "Display Name"
                },
                "type": {
                    "name": "formula",
                    "settings": {
                        "formula": [
                            {
                                "language_code": 2052,
                                "text": "\"\" + [_id]"
                            }
                        ],
                        "returnType": "multilingual"
                    }
                },
                "createdAt": 1750924967708,
                "updatedAt": 1752033171584
            }, 
        ],
        "createdAt": 1750924967708,
        "updatedAt": 1752033171584
    },
    "msg": "success"
}

const MetaApi: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 实际项目中请替换为真实接口调用
  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await getTableData();
      setResult(res);
      setLoading(false);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <ApiDetailLayout
      title="获取数据元对象"
      method="GET"
      path="/api/data/v1/namespaces/package_d6426c__c/meta/objects/object_cbb246f2bd1"
      status="已完成"
      description="获取数据元对象"
      createdAt="2025年4月14日"
      updatedAt="3个月前"
      owner="江禾藜"
      params={[
        { name: 'Authorization', in: 'header', required: true, desc: 'Bearer Token', example: 'T:XXX' },
      ]}
      responseExample={mockResponse}
      onTest={handleTest}
    >
      {error && <div style={{color:'red'}}>错误: {error}</div>}
      {result && (
        <div style={{marginTop:12}}>
          <div style={{fontWeight:600,marginBottom:4}}>返回结果：</div>
          <pre style={{
            background: '#f6f6f6',
            padding: 12,
            borderRadius: 4,
            overflowX: 'auto',
            maxWidth: '100%',
            boxSizing: 'border-box',
            width: '100%',
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </ApiDetailLayout>
  );
};

export default MetaApi; 