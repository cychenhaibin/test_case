import React, { useState } from 'react';
import ApiDetailLayout from './ApiDetailLayout';
import { deleteRecords } from '../../api';

// 假设你有一个getUserInfoById的接口方法
// import { getUserInfoById } from '../../api';

const mockResponse = {
  "code": "0",
  "data": {
    "items": [
      {
        "_id": "1837184559935498",
        "success": true
      },
      {
        "_id": "1837184841527304",
        "success": true
      }
    ]
  },
  "msg": "success"
}

const DeleteBatchApi: React.FC = () => {
  const [paramValues, setParamValues] = useState({
    ids: '1837184217805880,1837184543031305',
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
      // 取 ids 字符串，按逗号分割为数组
      const idsArray = (paramValues.ids || '').split(',').map(id => id.trim()).filter(Boolean);
      const res = await deleteRecords(idsArray);
      setResult(res);
      setLoading(false);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <ApiDetailLayout
      title="批量删除case数据"
      method="DELETE"
      path="/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records_batch"
      status="已完成"
      description="根据ids批量删除case数据"
      createdAt="2025年4月14日"
      updatedAt="3个月前"
      owner="江禾藜"
      params={[
        { name: 'Authorization', in: 'header', required: true, desc: 'Bearer Token', example: 'T:XXX' },
        { name: 'ids', in: 'body', required: true, desc: '数据ID数组', example: '1837184217805880,1837184543031305' },
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

export default DeleteBatchApi; 