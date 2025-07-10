import React, { useState } from 'react';
import { Button, Divider, InputNumber, Layout, Menu, Select, Spin } from 'antd';
import DataGenerateTable from './caseGroup/DataGenerateTable';
import DataEditTable from './caseGroup/DataEditTable';
import DataDeleteTable from './caseGroup/DataDeleteTable';
import axios from 'axios';
import { formatGenerateData, formatEditData, formatDeleteData } from './formatTableData';

const { Sider, Content } = Layout;

const menuItems = [
  { key: 'generate', label: '生成测试数据集' },
  { key: 'edit', label: '比对智能编辑数据集' },
  { key: 'delete', label: '比对智能删除数据集' },
];


const DataGenerate: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('generate');
  const [num, setNum] = useState<number>();
  const [isEmpty, setIsEmpty] = useState<boolean>();

  const [mockGenerateData, setMockGenerateData] = useState<any[]>([]);
  const [mockEditData, setMockEditData] = useState<any[]>([]);
  const [mockDeleteData, setMockDeleteData] = useState<any[]>([]);

  const [generating, setGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);

  let content = null;
  if (selectedKey === 'generate') {
    content = <DataGenerateTable data={mockGenerateData} />;
  } else if (selectedKey === 'edit') {
    content = <DataEditTable data={mockEditData} />;
  } else if (selectedKey === 'delete') {
    content = <DataDeleteTable data={mockDeleteData} />;
  }

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateSuccess(false);
    // 请求接口case_be/test
    const res = await axios.post('https://47.120.6.54:8080/test', { num, flag: isEmpty ?? false });
    try {
      const result = res.data.result || [];
      setMockGenerateData(formatGenerateData(result[0]?.generate));
      setMockEditData(formatEditData(result[1]?.edit));
      setMockDeleteData(formatDeleteData(result[2]?.delete));
    } catch (error) {
      console.log(error);
    }
    setGenerating(false);
    setGenerateSuccess(true);
    setTimeout(() => setGenerateSuccess(false), 2000); // 2秒后自动消失
  };

  return (
    <Layout style={{ minHeight: 500 }}>
      <Sider width={220} style={{ background: '#fff' }}>
        <div style={{ padding: 12, width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入数据集数量"
            min={1}
            max={20}
            addonAfter="条"
            value={num}
            onChange={v => setNum(v ?? 0)}
          />
          <Select
            style={{ width: '100%' }}
            placeholder="是否生成空值"
            value={isEmpty === undefined ? undefined : String(isEmpty)}
            onChange={v => setIsEmpty(v === 'true')}
          >
            <Select.Option value="true">true</Select.Option>
            <Select.Option value="false">false</Select.Option>
          </Select>
          <Button
            type="primary"
            style={{ width: '100%' }}
            onClick={handleGenerate}
            disabled={num === undefined}
          >
            生成测试数据集
          </Button>
        </div>
        <div style={{paddingLeft: 12}}>
        {generating ? (
          <div>
            <Spin size="small" /> 正在生成中，请稍后...
          </div>
        ) : generateSuccess ? (
          <div style={{ color: 'green' }}>
            生成成功
          </div>
        ) : null}
        </div>
        <Divider />
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={e => setSelectedKey(e.key as string)}
          style={{ height: '100%', borderRight: 0 }}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key}>{item.label}</Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ padding: 24, background: '#fff' }}>{content}</Content>
      </Layout>
    </Layout>
  );
};

export default DataGenerate;
