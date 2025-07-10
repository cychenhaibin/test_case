import React, { useState } from 'react';
import ApiDetailLayout from './ApiDetailLayout';
import { createRecord } from '../../api';

// 假设你有一个getUserInfoById的接口方法
// import { getUserInfoById } from '../../api';

const mockResponse = {
  "code": "0",
  "data": {
    "id": "1837232906493002"
  },
  "msg": "success"
}

const CreateApi: React.FC = () => {
  const [paramValues, setParamValues] = useState({
    _id: '1837183850820648',
    autoid_aa676d22d35: '407',
    text_7ea7d6a3339: 'test',
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
      const res = await createRecord({
        record: {
          autoid_aa676d22d35: paramValues.autoid_aa676d22d35,
          text_7ea7d6a3339: paramValues.text_7ea7d6a3339,
        }
      });
      setResult(res);
      setLoading(false);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <ApiDetailLayout
      title="新增case数据"
      method="POST"
      path="/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records"
      status="已完成"
      description="新增case数据"
      createdAt="2025年4月14日"
      updatedAt="3个月前"
      owner="江禾藜"
      params={[
        { name: 'Authorization', in: 'header', required: true, desc: 'Bearer Token', example: 'T:XXX' },
        { name: 'autoid_aa676d22d35', in: 'body', required: false, desc: '自动编号字段', example: '407' },
        { name: 'text_7ea7d6a3339', in: 'body', required: false, desc: '文本字段', example: 'test' },
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

export default CreateApi; 