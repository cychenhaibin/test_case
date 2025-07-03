import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { getTableData } from '../api';

interface FieldType {
  apiName: string;
  label: { zh_CN: string; en_US: string };
  type: { name: string; settings: any };
  createdAt: number;
  updatedAt: number;
}

const AntdTableDemo: React.FC = () => {
  const [fields, setFields] = useState<FieldType[]>([]);

  useEffect(() => {
    getTableData().then(res => {
      setFields(res.data?.fields || []);
    });
  });


  // 展示字段定义的表格
  const columns = [
    { title: '字段名(apiName)', dataIndex: 'apiName', key: 'apiName' },
    { title: '中文名', dataIndex: ['label', 'zh_CN'], key: 'zh_CN', render: (_: any, record: FieldType) => record.label.zh_CN },
    { title: '英文名', dataIndex: ['label', 'en_US'], key: 'en_US', render: (_: any, record: FieldType) => record.label.en_US },
    { title: '类型', dataIndex: ['type', 'name'], key: 'type', render: (_: any, record: FieldType) => record.type.name },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: number) => new Date(v).toLocaleString() },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', render: (v: number) => new Date(v).toLocaleString() },
  ];

  return (
    <div style={{ width: '100%', padding: '10px', overflowX: 'auto' }}>
      <Table
        dataSource={fields}
        columns={columns}
        rowKey="apiName"
        scroll={{ x: 'max-content' }}
        style={{ minWidth: '100%' }}
      />
    </div>
  );
};

export default AntdTableDemo;
