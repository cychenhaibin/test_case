import React from 'react';
import { Table } from 'antd';
import { createStyles } from 'antd-style';

const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token as any;
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
  };
});

// 自动生成表头
function getColumnsFromData(data: any[] = []) {
  if (!data.length) return [];
  return Object.keys(data[0]).map(key => ({
    title: key,
    dataIndex: key,
    key,
    render: (text: any) =>
      typeof text === 'object'
        ? <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(text, null, 2)}</pre>
        : String(text),
  }));
}

const DataGenerateTable: React.FC<{ data?: any[] }> = ({ data }) => {
  const { styles } = useStyle();
  const safeData = Array.isArray(data) ? data : [];
  const dataSource = safeData.map((item, idx) => ({ key: idx, ...item }));
  const columns = getColumnsFromData(dataSource);

  return (
    <Table
      className={styles.customTable}
      columns={columns}
      dataSource={dataSource}
      bordered
      size="middle"
      scroll={{ x: 'max-content' }}
      pagination={{ size: 'default' }} // 让分页器变大
    />
  );
};

export default DataGenerateTable;