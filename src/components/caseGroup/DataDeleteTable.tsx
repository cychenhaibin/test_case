import React from 'react';
import { Table } from 'antd';
import { diffWords, diffJson } from 'diff';

function renderDiff(original: any, deleted: any) {
  const isString = typeof original === 'string' && typeof deleted === 'string';
  const diff = isString ? diffWords(original, deleted) : diffJson(original, deleted);

  return (
    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {diff.map((part, idx) => {
        // 只高亮 removed 部分
        const highlight = part.removed;
        return (
          <span
            key={idx}
            style={{
              backgroundColor: highlight ? '#ffecec' : undefined,
              color: highlight ? '#b31d28' : undefined,
            }}
          >
            {typeof part.value === 'string'
              ? part.value
              : JSON.stringify(part.value, null, 2)}
          </span>
        );
      })}
    </pre>
  );
}

const columns = [
  {
    title: '原始内容',
    dataIndex: 'original_content',
    key: 'original_content',
    render: (_: any, record: any) =>
      renderDiff(record.original_content, record.delete_content),
    width: '50%',
  },
  {
    title: '删除后内容',
    dataIndex: 'delete_content',
    key: 'delete_content',
    render: (text: string) => (
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify(text, null, 2)}
      </pre>
    ),
    width: '50%',
  },
];

const DataDeleteTable: React.FC<{ data: any[] }> = ({ data }) => {
  const dataSource = data.map((item, idx) => ({ key: idx, ...item }));
  return <Table columns={columns} dataSource={dataSource} bordered pagination={false} scroll={{ x: 'max-content' }} />;
};

export default DataDeleteTable; 