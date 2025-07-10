import React, { useState } from 'react';
import ApiDetailLayout from './ApiDetailLayout';
import { getCaseData } from '../../api';

// 假设你有一个getUserInfoById的接口方法
// import { getUserInfoById } from '../../api';

const mockResponse = {
    "code": "0",
    "data": {
        "items": [
            {
                "_createdAt": 1752078269273,
                "_createdBy": {
                    "_id": "-1",
                    "_name": {}
                },
                "_id": "1837185083536409",
                "_updatedAt": 1752078269273,
                "_updatedBy": {
                    "_id": "-1",
                    "_name": {}
                }
            }
        ]
    },
    "msg": "success"
}

const CaseApi: React.FC = () => {
  const [paramValues, setParamValues] = useState({
    use_page_token: 'false',
    offset: '0',
    need_total_count: 'false',
    filter: '{}',
    page_token: '',
    page_size: '100',
    query_deleted_record: 'false',
    select: '["_id", "_createdBy", "date_f1e5579a4c6", "text_7ea7d6a3339"]',
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
      // 组装参数，类型转换
      const params = {
        use_page_token: paramValues.use_page_token === 'true',
        offset: Number(paramValues.offset),
        need_total_count: paramValues.need_total_count === 'true',
        filter: paramValues.filter ? JSON.parse(paramValues.filter) : {},
        page_token: paramValues.page_token,
        page_size: Number(paramValues.page_size),
        query_deleted_record: paramValues.query_deleted_record === 'true',
        select: paramValues.select ? JSON.parse(paramValues.select) : [],
      };
      const res = await getCaseData(params);
      setResult(res);
      setLoading(false);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <ApiDetailLayout
      title="获取case数据"
      method="POST"
      path="/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records_query"
      status="已完成"
      description="获取case数据"
      createdAt="2025年4月14日"
      updatedAt="3个月前"
      owner="江禾藜"
      params={[
        { name: 'Authorization', in: 'header', required: true, desc: 'Bearer Token', example: 'T:XXX' },
        { name: 'use_page_token', in: 'body', required: false, desc: '是否使用分页令牌，默认false', example: 'false' },
        { name: 'offset', in: 'body', required: false, desc: '查询起始偏移量，默认0', example: '0' },
        { name: 'need_total_count', in: 'body', required: false, desc: '是否需要返回总记录数，默认false', example: 'false' },
        { name: 'filter', in: 'body', required: false, desc: '查询过滤条件，默认{}', example: '{}' },
        { name: 'page_token', in: 'body', required: false, desc: '分页令牌，默认""', example: '' },
        { name: 'page_size', in: 'body', required: false, desc: '每页记录数，默认100', example: '100' },
        { name: 'query_deleted_record', in: 'body', required: false, desc: '是否查询已删除记录，默认false', example: 'false' },
        { name: 'select', in: 'body', required: false, desc: '需要返回的字段列表', example: '["_id", "_createdBy", "date_f1e5579a4c6", "text_7ea7d6a3339"]' },
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

export default CaseApi; 