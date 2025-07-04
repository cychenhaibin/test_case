import React, { useEffect, useState } from 'react';
import { Table, Checkbox, Button, Space, Input, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getTableData } from '../api';
import { useApiNameStore } from '../store/apiNameStore';
import { useNavigate } from 'react-router-dom';
interface FieldType {
  apiName: string;
  label: { zh_CN: string; en_US: string };
  type: { name: string; settings: any };
  createdAt: number;
  updatedAt: number;
}

const metaData: React.FC = () => {
  const [fields, setFields] = useState<FieldType[]>([]);
  const [settingsKeys, setSettingsKeys] = useState<string[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editCache, setEditCache] = useState<Partial<FieldType>>({});
  const [objectEditCache, setObjectEditCache] = useState<Record<string, string>>({});
  const setApiNameList = useApiNameStore(state => state.setApiNameList);
  const navigate = useNavigate();
  useEffect(() => {
    getTableData().then(res => {
      if (res.code === 'k_ident_013000') {
        navigate('/login');
        return;
      }
      const data = res.data?.fields || [];
      setFields(data);
      setApiNameList(data.map((item: FieldType) => item.apiName));

      // 收集所有 settings 字段名
      const keysSet = new Set<string>();
      data.forEach((item: FieldType) => {
        Object.keys(item.type.settings || {}).forEach(key => keysSet.add(key));
      });
      setSettingsKeys(Array.from(keysSet));
    });
  }, []);

  // 编辑相关方法
  const isEditing = (record: FieldType) => record.apiName === editingKey;

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

  const cancel = () => {
    setEditingKey(null);
    setEditCache({});
    setObjectEditCache({});
  };

  const save = (apiName: string) => {
    // 检查对象类型字段的 JSON 是否有效
    let parsedSettings: Record<string, any> = { ...editCache.type?.settings };
    for (const key of settingsKeys) {
      if (objectEditCache[key] !== undefined) {
        try {
          parsedSettings[key] = JSON.parse(objectEditCache[key]);
        } catch (e) {
          message.error(`字段 ${key} 不是有效的 JSON 格式！`);
          return;
        }
      }
    }
    setFields(prev => prev.map(item => {
      if (item.apiName === apiName) {
        return {
          ...item,
          ...editCache,
          label: {
            zh_CN: editCache.label?.zh_CN ?? item.label.zh_CN,
            en_US: editCache.label?.en_US ?? item.label.en_US
          },
          type: {
            ...item.type,
            ...editCache.type,
            settings: {
              ...item.type.settings,
              ...editCache.type?.settings,
              ...parsedSettings
            }
          }
        };
      }
      return item;
    }));
    setEditingKey(null);
    setEditCache({});
    setObjectEditCache({});
  };

  // 基础字段
  const baseColumns = [
    {
      title: '字段名(apiName)',
      dataIndex: 'apiName',
      key: 'apiName',
      fixed: 'left' as const,
      render: (_: any, record: FieldType) =>
        isEditing(record) ? (
          <Input
            value={editCache.apiName}
            onChange={e => setEditCache(cache => ({
              ...cache,
              apiName: e.target.value
            }))}
            style={{ width: '100%' }}
          />
        ) : (
          record.apiName
        )
    },
    {
      title: '中文名',
      dataIndex: ['label', 'zh_CN'],
      key: 'zh_CN',
      render: (_: any, record: FieldType) =>
        isEditing(record) ? (
          <Input
            value={editCache.label?.zh_CN}
            onChange={e => setEditCache(cache => ({
              ...cache,
              label: {
                ...cache.label,
                zh_CN: e.target.value,
                en_US: cache.label?.en_US ?? record.label.en_US
              }
            }))}
            style={{ width: '100%' }}
          />
        ) : (
          record.label.zh_CN
        )
    },
    {
      title: '英文名',
      dataIndex: ['label', 'en_US'],
      key: 'en_US',
      render: (_: any, record: FieldType) =>
        isEditing(record) ? (
          <Input
            value={editCache.label?.en_US}
            onChange={e => setEditCache(cache => ({
              ...cache,
              label: {
                ...cache.label,
                zh_CN: cache.label?.zh_CN ?? record.label.zh_CN,
                en_US: e.target.value
              }
            }))}
            style={{ width: '100%' }}
          />
        ) : (
          record.label.en_US
        )
    },
    {
      title: '类型',
      dataIndex: ['type', 'name'],
      key: 'type',
      render: (_: any, record: FieldType) =>
        isEditing(record) ? (
          <Input
            value={editCache.type?.name}
            onChange={e => setEditCache(cache => ({
              ...cache,
              type: {
                ...cache.type,
                name: e.target.value,
                settings: cache.type?.settings ?? record.type.settings
              }
            }))}
            style={{ width: '100%' }}
          />
        ) : (
          record.type.name
        )
    },
  ];

  // 动态 settings 字段
  const dynamicColumns = settingsKeys.map(key => ({
    title: key,
    key,
    render: (_: any, record: FieldType) => {
      const editing = isEditing(record);
      // 判断原始数据该字段是否存在
      const originalValue = record.type.settings?.[key];
      const value = editing ? editCache.type?.settings?.[key] : originalValue;
      if (originalValue === undefined) {
        return '-';
      }
      if (editing) {
        if (typeof value === 'object') {
          // 用于对象类型字段的 JSON 编辑
          const cacheValue = objectEditCache[key] ?? JSON.stringify(value, null, 2);
          return <Input.TextArea
            value={cacheValue}
            autoSize={{ minRows: 2, maxRows: 6 }}
            onChange={e => setObjectEditCache(cache => ({ ...cache, [key]: e.target.value }))}
          />;
        }
        if (typeof value === 'boolean') {
          return <Checkbox checked={value} onChange={e => setEditCache(cache => ({
            ...cache,
            type: {
              ...cache.type,
              name: cache.type?.name ?? record.type.name,
              settings: {
                ...cache.type?.settings,
                [key]: e.target.checked
              }
            }
          }))} />;
        }
        return <Input value={value} onChange={e => setEditCache(cache => ({
          ...cache,
          type: {
            ...cache.type,
            name: cache.type?.name ?? record.type.name,
            settings: {
              ...cache.type?.settings,
              [key]: e.target.value
            }
          }
        }))} style={{ width: '100%' }} />;
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    }
  }));

  // 时间字段
  const timeColumns = [
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: number) => new Date(v).toLocaleString() },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', render: (v: number) => new Date(v).toLocaleString() },
  ];

  // 操作字段
  // const actionColumns = [
  //   {
  //     title: '操作',
  //     dataIndex: 'action',
  //     key: 'action',
  //     fixed: 'right' as const,
  //     render: (_: any, record: FieldType) => {
  //       const editable = isEditing(record);
  //       return (
  //         <Space size="middle">
  //           {editable ? (
  //             <>
  //               <a style={{ color: '#52c41a' }} onClick={() => save(record.apiName)}>保存</a>
  //               <a style={{ color: '#aaa' }} onClick={cancel}>取消</a>
  //             </>
  //           ) : (
  //             <a style={{ color: '#1890ff' }} onClick={() => edit(record)}><EditOutlined /></a>
  //           )}
  //           <a style={{ color: '#f5222d' }}><DeleteOutlined /></a>
  //         </Space>
  //       );
  //     }
  //   },
  // ];

  const columns = [...baseColumns, ...dynamicColumns, ...timeColumns];

  return (
    <Table
      dataSource={fields}
      columns={columns}
      rowKey="apiName"
      scroll={{ x: 'max-content' }}
      pagination={{ pageSize: 12 }}
      bordered
    />
  );
};

export default metaData;
