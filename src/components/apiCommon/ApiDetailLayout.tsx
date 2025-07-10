import { Button, Input, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

interface Param {
  name: string;
  in: 'header' | 'path' | 'query' | 'body';
  required?: boolean;
  desc?: string;
  example?: string;
}

interface ApiDetailLayoutProps {
  title: string;
  method: string;
  path: string;
  status?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  owner?: string;
  params?: Param[];
  responseExample?: any;
  onTest?: () => void;
  children?: React.ReactNode;
  // 新增：所有参数的值和 setter
  paramValues?: Record<string, string>;
  setParamValues?: (values: Record<string, string>) => void;
}

const methodColor: Record<string, string> = {
  GET: '#17b26a',
  POST: '#ef6820',
  PUT: '#1890ff',
  DELETE: '#f04438',
  PATCH: '#1890ff',
};

const ApiDetailLayout: React.FC<ApiDetailLayoutProps> = ({
  title,
  method,
  path,
  // status,
  description,
  // createdAt,
  // updatedAt,
  // owner,
  params = [],
  responseExample,
  onTest,
  children,
  paramValues = {},
  setParamValues,
}) => {
  // 渲染参数输入框
  const renderParamInput = (param: Param) => {
    if (param.name === 'Authorization') return param.example;
    if (!setParamValues) return param.example;
    return (
      <Input
        type="text"
        value={paramValues[param.name] ?? param.example ?? ''}
        onChange={e => {
          setParamValues({ ...paramValues, [param.name]: e.target.value });
        }}
        placeholder={param.desc || param.name}
        style={{ padding: 4, borderRadius: 4, width: '100%', border: '1px solid #ccc' }}
      />
    );
  };

  const dynamicColumns: ColumnsType<Param> = [
    { title: '参数名', dataIndex: 'name', key: 'name' },
    { title: '位置', dataIndex: 'in', key: 'in' },
    { title: '必需', dataIndex: 'required', key: 'required', render: (v) => (v ? '是' : '否') },
    { title: '说明', dataIndex: 'desc', key: 'desc' },
    {
      title: '示例/输入',
      dataIndex: 'example',
      key: 'example',
      render: (_, record) => renderParamInput(record)
    }
  ];
  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #f0f1f2', padding: 24, margin: '0 auto' }}>
      {/* 顶部信息 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between' }}>
        <span style={{ fontSize: 22, fontWeight: 600, marginRight: 16 }}>{title}</span>
        {onTest && (
          <Button type="primary" onClick={onTest}>运行 / 调试</Button>
        )}
      </div>
      <div style={{width: 'fit-content', display: 'flex', alignItems: 'center', marginBottom: 16, background: '#f6f6f6', padding: '4px', borderRadius: 6}}>
        <span style={{ background: methodColor[method] || '#ccc', color: '#fff', borderRadius: 4, padding: '2px 10px', fontWeight: 600, marginRight: 8 }}>{method}</span>
        <span style={{ color: '#444', fontFamily: 'monospace', fontSize: 15, marginRight: 12 }}>{path}</span>
        {/* {status && <span style={{ background: '#f4f4f4', color: '#888', borderRadius: 4, padding: '2px 8px', fontSize: 13 }}>{status}</span>} */}
      </div>
      {/* 基本信息 */}
      {/* <div style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>
        {createdAt && <>创建时间: {createdAt} &nbsp;&nbsp;</>}
        {updatedAt && <>修改时间: {updatedAt} &nbsp;&nbsp;</>}
        {owner && <>负责人: {owner}</>}
      </div> */}
      {/* 接口说明 */}
      {description && <div style={{ marginBottom: 18, color: '#444' }}>{description}</div>}
      {/* 请求参数 */}
      {params.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>请求参数</div>
          <Table
            columns={dynamicColumns}
            dataSource={params}
            rowKey="name"
            size="small"
            pagination={false}
            bordered
            style={{ background: '#fafbfc' }}
          />
        </div>
      )}
      {/* 响应示例 */}
      {responseExample && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>响应示例</div>
          <pre style={{ background: '#f6f6f6', padding: 12, borderRadius: 4, fontSize: 13 }}>{JSON.stringify(responseExample, null, 2)}</pre>
        </div>
      )}
      {/* 运行/调试按钮 */}
      
      {/* 额外内容 */}
      {children}
    </div>
  );
};

export default ApiDetailLayout; 