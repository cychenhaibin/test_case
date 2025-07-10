import React, { useState } from 'react';
import ApiDetailLayout from './ApiDetailLayout';
import axios from 'axios';
import { Spin } from 'antd';

// 假设你有一个getUserInfoById的接口方法
// import { getUserInfoById } from '../../api';

// const mockResponse = {
//   "code": "0",
//   "data": {
//       "items": [
//           {
//               "_id": "1837183850820648",
//               "success": true
//           }
//       ]
//   },
//   "msg": "success"
// }

const GenerateApi: React.FC = () => {
  const [paramValues, setParamValues] = useState({
    num: 1,
    flag: false,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 实际项目中请替换为真实接口调用
  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post('/case_be/test', paramValues);
      setResult(res.data);
      setLoading(false);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <ApiDetailLayout
      title="生成测试数据集"
      method="POST"
      path="/case_be/test"
      status="已完成"
      description="生成测试数据集"
      createdAt="2025年4月14日"
      updatedAt="3个月前"
      owner="江禾藜"
      params={[
        { name: 'Authorization', in: 'header', required: true, desc: 'Bearer Token', example: 'T:XXX' },
        { name: 'num', in: 'body', required: true, desc: '数据集数量', example: '1' },
        { name: 'flag', in: 'body', required: true, desc: '是否生成空值', example: 'true' },
      ]}
      // responseExample={mockResponse}
      onTest={handleTest}
      paramValues={{
        num: String(paramValues.num),
        flag: String(paramValues.flag),
      }}
      setParamValues={values => setParamValues({
        ...paramValues,
        ...Object.fromEntries(Object.entries(values).map(([k, v]) => [k, typeof v === 'string' ? v : String(v)]))
      })}
    >
      <div>
        {loading && (
          <div>
            <Spin size="small" /> 正在生成中，请稍后...
          </div>
        )}
        {result && (
          <div style={{ color: 'green' }}>
            生成成功
          </div>
        )}
      </div>
      {error && <div style={{ color: 'red' }}>错误: {error}</div>}
      {result && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>返回结果：</div>
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

export default GenerateApi; 