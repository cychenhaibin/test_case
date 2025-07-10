import React from 'react';
import { Table } from 'antd';
import { diffWords, diffJson } from 'diff';

function renderDiff(original: any, edited: any, mode: 'left' | 'right') {
  const isString = typeof original === 'string' && typeof edited === 'string';
  const diff = isString ? diffWords(original, edited) : diffJson(original, edited);

  return (
    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {diff.map((part, idx) => {
        // left: 只高亮 removed，right: 只高亮 added
        const highlight =
          (mode === 'left' && part.removed) || (mode === 'right' && part.added);
        return (
          <span
            key={idx}
            style={{
              backgroundColor: highlight
                ? mode === 'left'
                  ? '#ffecec'
                  : '#d4fcbc'
                : undefined,
              color: highlight
                ? mode === 'left'
                  ? '#b31d28'
                  : '#22863a'
                : undefined,
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
      renderDiff(record.original_content, record.edit_content, 'left'),
    width: '50%',
  },
  {
    title: '编辑后内容',
    dataIndex: 'edit_content',
    key: 'edit_content',
    render: (_: any, record: any) =>
      renderDiff(record.original_content, record.edit_content, 'right'),
    width: '50%',
  },
];

const DataEditTable: React.FC<{ data?: any[] }> = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];
  const dataSource = safeData.map((item, idx) => ({ key: idx, ...item }));
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      bordered
      pagination={false}
      scroll={{ x: 'max-content' }}
    />
  );
};

export default DataEditTable; 