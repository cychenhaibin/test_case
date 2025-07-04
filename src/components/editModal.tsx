import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch } from 'antd';
import { editRecord, createRecord } from '../api';

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
        await createRecord({ record: values });
      } else {
        await editRecord(initialData._id, { record: values });
      }
      onOk(values);
    } catch (e) {}
  };

  const renderInputs = (data: any, namePath: (string | number)[] = []) => {
    if (!data || typeof data !== 'object') return null;
    return Object.entries(data).map(([key, value]) => {
      const currentPath = [...namePath, key];
      if (key === 'id' || key === '_id') {
        return (
          <Form.Item label={key} name={currentPath} key={currentPath.join('.')}>
            <Input disabled />
          </Form.Item>
        );
      }
      if (typeof value === 'boolean') {
        return (
          <Form.Item label={key} name={currentPath} key={currentPath.join('.')}>
            <Switch />
          </Form.Item>
        );
      }
      if (typeof value === 'number') {
        return (
          <Form.Item label={key} name={currentPath} key={currentPath.join('.')}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        );
      }
      if (Array.isArray(value)) {
        return (
          <div key={currentPath.join('.')} style={{ paddingLeft: 12, borderLeft: '2px solid #eee' }}>
            <b>{key}</b>
            {value.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 8 }}>
                <b>第{idx + 1}项</b>
                {typeof item === 'object' && item !== null
                  ? renderInputs(item, [...currentPath, idx])
                  : (
                    <Form.Item label={idx} name={[...currentPath, idx]} key={[...currentPath, idx].join('.')}>
                      <Input />
                    </Form.Item>
                  )
                }
              </div>
            ))}
          </div>
        );
      }
      if (typeof value === 'object' && value !== null) {
        return (
          <div key={currentPath.join('.')} style={{ paddingLeft: 12, borderLeft: '2px solid #eee' }}>
            <b>{key}</b>
            {renderInputs(value, currentPath)}
          </div>
        );
      }
      return (
        <Form.Item label={key} name={currentPath} key={currentPath.join('.')}>
          <Input />
        </Form.Item>
      );
    });
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
      <Form form={form} layout="vertical">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {renderInputs(form.getFieldsValue(true))}
        </div>
      </Form>
    </Modal>
  );
};

export default EditModal;
