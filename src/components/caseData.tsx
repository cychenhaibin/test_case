import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Select, Popover, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCaseData, deleteRecord, deleteRecords } from '../api';
import { useApiNameStore } from '../store/apiNameStore';
import styles from './csseData.module.scss';
import EditModal from './editModal';
import { useNavigate } from 'react-router-dom';
import defaultNewRecord from './defaultNewRecord';
import { createStyles } from 'antd-style';

const useStyle = createStyles(({ css }) => {
  return {
    customTable: css`
      .ant-table {
        .ant-table-container {
          .ant-table-body,
          .ant-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
  };
});

// 工具函数：支持 dataIndex 为 'a.b.0.c' 的取值，支持数组
function getValue(record: any, dataIndex: string) {
  return dataIndex.split('.').reduce((obj, key) => {
    if (!obj) return undefined;
    // 如果是数组且 key 是数字
    if (Array.isArray(obj) && !isNaN(Number(key))) {
      return obj[Number(key)];
    }
    return obj[key];
  }, record);
}

// 工具函数：递归生成 columns（无限递归对象类型字段）
interface ColumnType {
  title: string;
  dataIndex?: string;
  key?: string;
  children?: ColumnType[];
}
function generateColumnsFromData(data: any[], parentKey = ''): ColumnType[] {
  if (!data || data.length === 0) return [];
  const keys = getAllKeys(data);
  return keys.map(key => {
    // 找到第一个非 null/undefined 的值
    const value = data.map(d => d?.[key]).find(v => v !== undefined && v !== null);
    const dataIndex = parentKey ? `${parentKey}.${key}` : key;
    if (value && typeof value === 'object') {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
        // 递归数组第一个元素，dataIndex 路径加 .0
        const children: ColumnType[] = generateColumnsFromData([value[0]], `${dataIndex}.0`);
        if (children.length > 0) {
          return { title: key, children };
        }
      } else if (!Array.isArray(value) && value !== null) {
        const children: ColumnType[] = generateColumnsFromData([value], dataIndex);
        if (children.length > 0) {
          return { title: key, children };
        }
      }
      // 其他情况直接展示
      return { title: key, dataIndex, key: dataIndex };
    } else {
      return { title: key, dataIndex, key: dataIndex };
    }
  });
}

function getAllKeys(data: any[]): string[] {
  const keys = new Set<string>();
  data.forEach(item => {
    Object.keys(item || {}).forEach(k => keys.add(k));
  });
  return Array.from(keys);
}

const caseData: React.FC = () => {
  const [fields, setFields] = useState<any[]>([]);
  const [, setSettingsKeys] = useState<string[]>([]);

  // 新增：所有参数的 state
  const [usePageToken, setUsePageToken] = useState(false);
  const [offset, setOffset] = useState(0);
  const [needTotalCount, setNeedTotalCount] = useState(false);
  const [filter, setFilter] = useState<any>({});
  const [pageToken, setPageToken] = useState('');
  const [pageSize, setPageSize] = useState(100);
  const [queryDeletedRecord, setQueryDeletedRecord] = useState(false);
  const [select, setSelect] = useState<string[]>([]);
  const apiNameList = useApiNameStore(state => state.apiNameList);
  const setOriginalCaseData = useApiNameStore(state => state.setOriginalCaseData);
  const navigate = useNavigate();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalData, setEditModalData] = useState<any>({});
  const [editModalTitle, setEditModalTitle] = useState('编辑');
  // 新增：批量选择和删除相关 state
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const content = (
    <div>只有表格中含有_id字段的行才能批量删除</div>
  );

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys as (string | number)[]);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleBatchDelete = async () => {
    setBatchLoading(true);
    try {
      // 批量删除接口，一次性传递 id 数组
      await deleteRecords(selectedRowKeys.map(String));
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      fetchData();
    } catch (e: any) {
      message.error(e.message || '批量删除失败');
    } finally {
      setBatchLoading(false);
    }
  };

  const isPlainObject = (obj: any) => {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return false;
    return Object.values(obj).every(
      v => typeof v !== 'object' || v === null
    );
  };

  const generateColumns = (data: any[]): any[] => {
    if (!data || data.length === 0) return [];
    const sample = data[0];
    return Object.keys(sample).map(key => {
      const value = sample[key];
      if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === 'object') {
          // 数组对象，嵌套表格
          return {
            title: key,
            dataIndex: key,
            key,
            render: (_: any, record: any) =>
              record[key] && record[key].length > 0 ? (
                <Table
                  className={antdStyles.customTable}
                  columns={generateColumns(record[key])}
                  dataSource={record[key]}
                  pagination={false}
                  rowKey={(row: any, index?: number) => row._id || row.id || index}
                  bordered
                  size="small"
                  style={{ marginInline: 0, marginBlock: 0 }}
                />
              ) : (
                <span>无数据</span>
              )
          };
        } else {
          // 普通数组
          return {
            title: key,
            dataIndex: key,
            key,
            render: (_: any, record: any) => Array.isArray(record[key]) ? record[key].join(', ') : ''
          };
        }
      } else if (typeof value === 'object' && value !== null) {
        // richText 特殊渲染
        if (key.includes('richText') && value.raw) {
          return {
            title: key,
            dataIndex: key,
            key,
            render: (_: any, record: any) =>
              <div dangerouslySetInnerHTML={{ __html: record[key].raw }} />
          };
        }
        if (isPlainObject(value)) {
          // 纯对象，直接 key: value 展示
          return {
            title: key,
            dataIndex: key,
            key,
            render: (_: any, record: any) =>
              <div>
                {Object.entries(record[key]).map(([k, v]) => (
                  <div key={k}><b>{k}:</b> {String(v)}</div>
                ))}
              </div>
          };
        } else {
          // 复杂对象，递归表格
          return {
            title: key,
            dataIndex: key,
            key,
            render: (_: any, record: any) =>
              <Table
                className={antdStyles.customTable}
                columns={generateColumns([record[key]])}
                dataSource={[record[key]]}
                pagination={false}
                rowKey={(row: any, index?: number) => row._id || row.id || index}
                bordered
                size="small"
                style={{ marginInline: 0, marginBlock: 0 }}
              />
          };
        }
      } else if (typeof value === 'boolean') {
        return {
          title: key,
          dataIndex: key,
          key,
          render: (_: any, record: any) => record[key] ? 'true' : 'false'
        };
      } else {
        // 普通字段
        return {
          title: key,
          dataIndex: key,
          key,
          
        };
      }
    });
  };

  // 查询方法
  const fetchData = (params = {
    use_page_token: usePageToken,
    offset,
    need_total_count: needTotalCount,
    filter,
    page_token: pageToken,
    page_size: pageSize,
    query_deleted_record: queryDeletedRecord,
    select
  }) => {
    getCaseData(params).then(res => {
      if (res.code === 'k_ident_013000') {
        navigate('/login');
        return;
      }
      // 过滤掉所有字段都为空的行
      const data = (res.data?.items || []).filter((item: any) =>
        Object.values(item).some(
          v => v !== null && v !== undefined && v !== ''
        )
      );
      setFields(data);
      setOriginalCaseData(res.data?.items || []);
      // 收集所有 settings 字段名
      const keysSet = new Set<string>();
      data.forEach((item: any) => {
        Object.keys(item.type?.settings || {}).forEach((key: string) => keysSet.add(key));
      });
      setSettingsKeys(Array.from(keysSet));
      setLoading(false);
    });
  };

  // 初次加载自动查询
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [usePageToken, offset, needTotalCount, filter, pageToken, pageSize, queryDeletedRecord, select]);


  const handleDelete = async (_id: string) => {
    try {
      await deleteRecord(_id);
      message.success('删除成功');
      fetchData(); // 重新拉取数据刷新表格
    } catch (e: any) {
      message.error(e.message || '删除失败');
    }
  };

  // 操作字段
  const actionColumns = [
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      fixed: 'right' as const,
      render: (_: any, record: any) => {
        if (!record._id) return null;
        return (
          <Space size="middle">
            
            <a style={{ color: '#1890ff' }} onClick={() => openEditModal(record)}><EditOutlined /></a>
            
            <Popconfirm
              title="确定要删除这条数据吗？"
              onConfirm={() => handleDelete(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <a
                style={{ color: '#f5222d' }}
              >
                <DeleteOutlined />
              </a>
            </Popconfirm>
          </Space>
        );
      }
    },
  ];

  // 直接在渲染前生成 columns
  const tableColumns = React.useMemo(() => {
    if (!fields || fields.length === 0) return [];
    const cols = generateColumnsFromData(fields);
    function addRender(col: any): any {
      if (col.children) {
        return { ...col, children: col.children.map(addRender) };
      }
      return {
        ...col,
        render: (_: any, record: any) => {
          const value = getValue(record, col.dataIndex);
          // 针对 _createdAt 和 _updatedAt 字段，转为本地时间字符串
          if (col.dataIndex === '_createdAt' || col.dataIndex === '_updatedAt') {
            if (typeof value === 'number' && !isNaN(value)) {
              return new Date(value).toLocaleString();
            }
            return value || '';
          }
          if (Array.isArray(value)) {
            if (value.length === 0) return '';
            if (typeof value[0] === 'object') return JSON.stringify(value[0]);
            return value.join(', ');
          }
          if (typeof value === 'object' && value !== null) return JSON.stringify(value);
          return value === null || value === undefined ? '' : String(value);
        }
      };
    }
    const finalCols = cols.map(addRender);
    if (fields.some(item => item._id)) {
      return [...finalCols, ...actionColumns];
    }
    return finalCols;
  }, [fields, actionColumns]);

  // 编辑
  const openEditModal = (record: any) => {
    const originalCaseData = useApiNameStore.getState().originalCaseData;
    let origin = null;
    if (record._id) {
      origin = originalCaseData.find((item: any) => item._id === record._id);
    } else if (record.id) {
      origin = originalCaseData.find((item: any) => item.id === record.id);
    }
    setEditModalData(origin || record);
    setEditModalTitle('编辑');
    setEditModalVisible(true);
  };

  // 新建
  const openCreateModal = () => {
    // 可根据实际需要设置默认字段

    setEditModalData(defaultNewRecord);
    setEditModalTitle('新建');
    setEditModalVisible(true);
  };

  const resetFields = () => {
    setUsePageToken(false);
    setOffset(0);
    setNeedTotalCount(false);
    setFilter({});
    setPageToken('');
    setPageSize(500);
    setQueryDeletedRecord(false);
    setSelect([]);
    // fetchData(); // 新增：重置后立即请求数据
  };

  const { styles: antdStyles } = useStyle();

  return (
    <div className={styles.caseDataWrapper}>
      <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <label style={{ fontSize: 14 }}>use_page_toke</label>
            <Select
              value={usePageToken}
              onChange={v => setUsePageToken(v)}
            >
              <Select.Option value={false}>false</Select.Option>
              <Select.Option value={true}>true</Select.Option>
            </Select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <label style={{ fontSize: 14 }}>offset</label>
            <Input
              type="number"
              placeholder="offset"
              value={offset}
              onChange={e => setOffset(Number(e.target.value))}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <label style={{ fontSize: 14 }}>need_total_count</label>
            <Select
              value={needTotalCount}
              onChange={v => setNeedTotalCount(v)}
            >
              <Select.Option value={false}>false</Select.Option>
              <Select.Option value={true}>true</Select.Option>
            </Select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <label style={{ fontSize: 14 }}>filter</label>
            <Select
              value={JSON.stringify(filter)}
              onChange={v => setFilter(JSON.parse(v))}
            >
              <Select.Option value="{}">无过滤条件</Select.Option>
              <Select.Option value='{"text_7ea7d6a3339": "日常文本"}'>status: active</Select.Option>
              <Select.Option value='{"type":"A"}'>type: A</Select.Option>
            </Select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <label style={{ fontSize: 14 }}>page_token</label>
            <Select
              value={pageToken}
              onChange={v => setPageToken(v)}
            >
              <Select.Option value="">空字符串</Select.Option>
              <Select.Option value="token123">token123</Select.Option>
            </Select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <label style={{ fontSize: 14 }}>page_size</label>
            <Input
              type="number"
              placeholder="page_size"
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <label style={{ fontSize: 14 }}>query_deleted_record</label>
            <Select
              value={queryDeletedRecord}
              onChange={v => setQueryDeletedRecord(v)}
            >
              <Select.Option value={false}>false</Select.Option>
              <Select.Option value={true}>true</Select.Option>
            </Select>
          </div>
        </div> */}

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            {/* <label style={{ fontSize: 14 }}>select</label> */}
            <Select
              mode="multiple"
              value={select}
              onChange={v => {
                if (v.includes('__all__')) {
                  // 如果已经全选，则取消全选，否则全选
                  if (select.length === apiNameList.length) {
                    setSelect([]);
                  } else {
                    setSelect(apiNameList);
                  }
                } else {
                  setSelect(v);
                }
              }}
              placeholder="select 字段"
            >
              <Select.Option key="__all__" value="__all__">
                {select.length === apiNameList.length ? '取消全选' : '全选'}
              </Select.Option>
              {apiNameList.map(name => (
                <Select.Option key={name} value={name}>{name}</Select.Option>
              ))}
            </Select>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Popover content={content} trigger="hover">
            <Popconfirm
              title="确定要批量删除选中的数据吗？"
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
              disabled={selectedRowKeys.length === 0 || !fields.some(item => item._id)}
            >
              <Button
                type="primary"
                danger
                // onClick={handleBatchDelete} // 移除原有点击事件
                disabled={selectedRowKeys.length === 0 || !fields.some(item => item._id)}
                loading={batchLoading}
              >
                批量删除
              </Button>
            </Popconfirm>
          </Popover>
            
            {selectedRowKeys.length > 0 ? `选择 ${selectedRowKeys.length} 条数据` : null}
            <Button type="primary" onClick={openCreateModal}>新 建</Button>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Button onClick={resetFields}>重置</Button>
            <Button type="primary" onClick={() => fetchData()}>查 询</Button>
          </div>
        </div>
      </div>
      <Table
        className={antdStyles.customTable}
        rowSelection={rowSelection}
        dataSource={fields}
        columns={tableColumns}
        rowKey={record => record._id || record.apiName || record.key || JSON.stringify(record)}
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 12 }}
        bordered
        loading={loading}
      />
      <EditModal
        visible={editModalVisible}
        initialData={editModalData}
        title={editModalTitle}
        mode={editModalTitle === '新建' ? 'create' : 'edit'}
        onOk={data => {
          // 保存/新建逻辑
          console.log(data)
          // 区分是编辑还是新建
          setEditModalVisible(false);
          // 保存后刷新数据
          fetchData();
        }}
        onCancel={() => setEditModalVisible(false)}
      />
    </div>
  );
};

export default caseData;