import React, { useState } from 'react';
import ApiDetailLayout from './ApiDetailLayout';
import { deleteRecord } from '../../api';

// 假设你有一个getUserInfoById的接口方法
// import { getUserInfoById } from '../../api';

const mockResponse = {
  "code": "0",
  "data": {
      "items": [
          {
              "_id": "1837183850820648",
              "success": true
          }
      ]
  },
  "msg": "success"
}

const DeleteApi: React.FC = () => {
  const [paramValues, setParamValues] = useState({
    _id: '1837183850820648',
  });
  const [result, setResult] = useState<any>(null);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 实际项目中请替换为真实接口调用
  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await deleteRecord(paramValues._id);
      setResult(res);
      setLoading(false);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <ApiDetailLayout
      title="删除单个case数据"
      method="DELETE"
      path="/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records/${_id}"
      status="已完成"
      description="删除单个case数据"
      createdAt="2025年4月14日"
      updatedAt="3个月前"
      owner="江禾藜"
      params={[
        { name: 'Authorization', in: 'header', required: true, desc: 'Bearer Token', example: 'T:XXX' },
        { name: '_id', in: 'path', required: true, desc: '数据ID', example: '1837183850820648' },
      ]}
      responseExample={mockResponse}
      onTest={handleTest}
      paramValues={paramValues}
      setParamValues={(values) => setParamValues({ ...paramValues, ...values })}
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

export default DeleteApi; 