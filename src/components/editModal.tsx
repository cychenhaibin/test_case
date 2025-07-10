import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, message } from 'antd';
import { editRecord, createRecord } from '../api';
import { useApiNameStore } from '../store/apiNameStore';
import styles from './csseData.module.scss';

interface EditModalProps {
  visible: boolean;
  initialData: Record<string, any>;
  onOk: (data: Record<string, any>) => void;
  onCancel: () => void;
  title?: string;
  mode?: 'create' | 'edit';
}

const EditModal: React.FC<EditModalProps> = ({
  visible,
  initialData,
  onOk,
  onCancel,
  title = '编辑',
  mode = 'edit',
}) => {
  const [form] = Form.useForm();
  const originalCaseData = useApiNameStore(state => state.originalCaseData);
  const [_, forceUpdate] = React.useState({});

  // 根据 initialData._id 找到对应的 case
  const currentCase = React.useMemo(() => {
    if (!initialData || !initialData._id) return null;
    return originalCaseData.find((item: any) => item._id === initialData._id) || null;
  }, [originalCaseData, initialData]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue(initialData || {});
    }
  }, [initialData, form, visible]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (mode === 'create') {
        const res = await createRecord({ record: values });
        if (res.code === 0) {
          message.success(res.msg);
        } else {
          message.error(res.msg);
        }
      } else {
        const res = await editRecord(initialData._id, { record: values });
        if (res.code === 0) {
          message.success(res.msg);
        } else {
          message.error(res.msg);
        }
      }
      onOk(values);
    } catch (e) {}
  };

  // 渲染最外层字段
  const renderFlatInputs = (data: any) => {
    if (!data || typeof data !== 'object') return null;
    return Object.keys(data).map((key) => {
      const value = data[key];
      const isReadonly = key.startsWith('_') || key === 'id' || key === '_id';

      // 跳过所有以 _ 开头的字段
      if (key.startsWith('_')) {
        return null;
      }

      // 对象/数组类型
      if (typeof value === 'object' && value !== null) {
        if (isReadonly) {
          return (
            <Form.Item label={key} name={key} key={key}>
              <Input.TextArea value={JSON.stringify(value, null, 2)} autoSize disabled />
            </Form.Item>
          );
        }
        return (
          <Form.Item
            label={key}
            name={key}
            key={key}
            getValueProps={v => ({
              value: typeof v === 'string' ? v : (v ? JSON.stringify(v, null, 2) : '')
            })}
            getValueFromEvent={e => {
              try {
                return JSON.parse(e.target.value);
              } catch {
                return e.target.value;
              }
            }}
            rules={[
              {
                validator: (_, val) => {
                  if (typeof val === 'string') {
                    try {
                      JSON.parse(val);
                      return Promise.resolve();
                    } catch {
                      return Promise.reject('请输入合法的 JSON');
                    }
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input.TextArea autoSize />
          </Form.Item>
        );
      }

      // 其他类型
      if (isReadonly) {
        if (typeof value === 'boolean') {
          return (
            <Form.Item label={key} name={key} key={key}>
              <Switch checked={!!value} disabled />
            </Form.Item>
          );
        }
        if (typeof value === 'number') {
          return (
            <Form.Item label={key} name={key} key={key}>
              <InputNumber style={{ width: '100%' }} disabled />
            </Form.Item>
          );
        }
        return (
          <Form.Item label={key} name={key} key={key}>
            <Input disabled />
          </Form.Item>
        );
      }
      if (typeof value === 'boolean') {
        return (
          <Form.Item label={key} name={key} key={key}>
            <Switch />
          </Form.Item>
        );
      }
      if (typeof value === 'number') {
        return (
          <Form.Item label={key} name={key} key={key}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        );
      }
      return (
        <Form.Item label={key} name={key} key={key}>
          <Input />
        </Form.Item>
      );
    });
  };

  // 对比差异，高亮不同字段
  const isDiff = (key: string, original: any, edited: any) => {
    // 对象/数组类型用 JSON 字符串对比
    console.log(key, original, edited);
    if (typeof original === 'object' && original !== null) {
      return JSON.stringify(original) !== JSON.stringify(edited);
    }
    return original !== edited;
  };

  // 获取表单当前值，未编辑时用原始值
  const getComparedValue = (key: string) => {
    const editedValue = form.getFieldValue(key);
    if (editedValue === undefined) return currentCase?.[key];
    return editedValue;
  };

  // 获取所有字段（以 initialData 为主，补充 currentCase）
  const allKeys = React.useMemo(() => {
    const keys = new Set<string>();
    if (currentCase) Object.keys(currentCase).forEach(k => keys.add(k));
    if (initialData) Object.keys(initialData).forEach(k => keys.add(k));
    return Array.from(keys).filter(key => !key.startsWith('_'));
  }, [currentCase, initialData]);

  // 格式化展示
  const formatValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      return <pre style={{ margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>;
    }
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (value === null || value === undefined) return '';
    return String(value);
  };

  return (
    <Modal
      width={1000}
      title={title}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      {mode === 'edit' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* 左侧：原始数据 */}
          <div>
            {allKeys.map(key => (
              <div
                key={key}
                className={isDiff(key, currentCase?.[key], getComparedValue(key)) ? styles.diffHighlight : undefined}
                style={{ marginBottom: 24, borderRadius: 4 }}
              >
                <div style={{ fontWeight: 500, marginBottom: 8 }}>{key}</div>
                <div
                  style={{
                    border: '1px solid #d9d9d9',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    minHeight: 16,
                    height: '100%',
                    padding: '4px 11px',
                    borderRadius: 6,
                    color: (currentCase?.[key] === null || currentCase?.[key] === undefined || currentCase?.[key] === '') ? '#bfbfbf' : undefined
                  }}
                >
                  {formatValue(currentCase?.[key]) || <span style={{ color: '#bfbfbf' }}>--</span>}
                </div>
              </div>
            ))}
          </div>
          {/* 右侧：可编辑表单 */}
          <Form
            form={form}
            layout="vertical"
            onValuesChange={() => forceUpdate({})}
          >
            {allKeys.map(key => {
              const value = initialData[key];
              // 只读字段已被过滤
              // 对象/数组类型
              if (typeof value === 'object' && value !== null) {
                return (
                  <Form.Item
                    label={key}
                    name={key}
                    key={key}
                    getValueProps={v => ({
                      value: typeof v === 'string' ? v : (v ? JSON.stringify(v, null, 2) : '')
                    })}
                    getValueFromEvent={e => {
                      try {
                        return JSON.parse(e.target.value);
                      } catch {
                        return e.target.value;
                      }
                    }}
                    rules={[
                      {
                        validator: (_, val) => {
                          if (typeof val === 'string') {
                            try {
                              JSON.parse(val);
                              return Promise.resolve();
                            } catch {
                              return Promise.reject('请输入合法的 JSON');
                            }
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                    className={isDiff(key, currentCase?.[key], getComparedValue(key)) ? styles.diffHighlight : undefined}
                    style={{ borderRadius: 4 }}
                  >
                    <Input.TextArea autoSize />
                  </Form.Item>
                );
              }
              if (typeof value === 'boolean') {
                return (
                  <Form.Item label={key} name={key} key={key} className={isDiff(key, currentCase?.[key], getComparedValue(key)) ? styles.diffHighlight : undefined} style={{ borderRadius: 4 }}>
                    <Switch />
                  </Form.Item>
                );
              }
              if (typeof value === 'number') {
                return (
                  <Form.Item label={key} name={key} key={key} className={isDiff(key, currentCase?.[key], getComparedValue(key)) ? styles.diffHighlight : undefined} style={{ borderRadius: 4 }}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                );
              }
              return (
                <Form.Item label={key} name={key} key={key} className={isDiff(key, currentCase?.[key], getComparedValue(key)) ? styles.diffHighlight : undefined} style={{ borderRadius: 4 }}>
                  <Input />
                </Form.Item>
              );
            })}
          </Form>
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {renderFlatInputs(currentCase || initialData)}
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default EditModal;
