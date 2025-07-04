import React, { useEffect, useState } from 'react';
import { Table, Checkbox, Button, Space, Input, message, Select } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCaseData, deleteRecord } from '../api';
import { useApiNameStore } from '../store/apiNameStore';
import styles from './csseData.module.scss';
import EditModal from './editModal';
import { useNavigate } from 'react-router-dom';
import defaultNewRecord from './defaultNewRecord';

interface FieldType {
  apiName: string;
  label: { zh_CN: string; en_US: string };
  type: { name: string; settings: any };
  createdAt: number;
  updatedAt: number;
}

const caseData: React.FC = () => {
  const [fields, setFields] = useState<any[]>([]);
  const [settingsKeys, setSettingsKeys] = useState<string[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editCache, setEditCache] = useState<Partial<FieldType>>({});
  const [objectEditCache, setObjectEditCache] = useState<Record<string, string>>({});

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
  const fetchData = () => {
    getCaseData({
      use_page_token: usePageToken,
      offset,
      need_total_count: needTotalCount,
      filter,
      page_token: pageToken,
      page_size: pageSize,
      query_deleted_record: queryDeletedRecord,
      select
    }).then(res => {
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
    });
  };

  // 初次加载自动查询
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);


  const edit = (record: FieldType) => {
    setEditingKey(record.apiName);
    setEditCache({ ...record });
    // 初始化对象类型字段的 JSON 字符串
    const objCache: Record<string, string> = {};
    settingsKeys.forEach(key => {
      const v = record.type.settings?.[key];
      if (typeof v === 'object' && v !== undefined) {
        objCache[key] = JSON.stringify(v, null, 2);
      }
    });
    setObjectEditCache(objCache);
  };


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
            
            <a
              style={{ color: '#f5222d' }}
              onClick={() => handleDelete(record._id)}
            >
              <DeleteOutlined />
            </a>
          </Space>
        );
      }
    },
  ];

  // 直接在渲染前生成 columns
  const tableColumns = React.useMemo(() => {
    if (!fields || fields.length === 0) return [];
    const baseColumns = generateColumns(fields);
    // 判断是否有 _id 字段
    if (fields.some(item => item._id)) {
      return [...baseColumns, ...actionColumns];
    }
    return baseColumns;
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

  return (
    <div className={styles.caseDataWrapper}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={openCreateModal}>新 建</Button>
      </div>
      <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
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
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <label style={{ fontSize: 14 }}>select</label>
            <Select
              mode="multiple"
              value={select}
              onChange={v => setSelect(v)}
              placeholder="select 字段"
            >
              {apiNameList.map(name => (
                <Select.Option key={name} value={name}>{name}</Select.Option>
              ))}
            </Select>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" onClick={fetchData}>查 询</Button>
        </div>
      </div>
      <Table
        dataSource={fields}
        columns={tableColumns}
        rowKey={record => record._id || record.apiName || record.key || JSON.stringify(record)}
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 12 }}
        bordered
      />
      <EditModal
        visible={editModalVisible}
        initialData={editModalData}
        title={editModalTitle}
        mode={editModalTitle === '新建' ? 'create' : 'edit'}
        onOk={data => {
          // 保存/新建逻辑
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