import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  

  const onFinish = async (values: { clientId: string; clientSecret: string }) => {
    setLoading(true);
    try {
      const res = await login(values.clientId, values.clientSecret);
      if (res?.code === '0') {
        localStorage.setItem('accessToken', res?.data.accessToken);
        console.log(res?.data.accessToken);
        message.success({content: '登录成功', key: 'login'});
        navigate('/index');
      } else {
        message.error({content: res?.msg || '登录失败', key: 'login'});
      }
    } catch (e: any) {
      console.log(e);
      message.error({content: e || '登录失败', key: 'login'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Form layout="vertical" onFinish={onFinish} style={{ width: 350 }}>
        <Form.Item name="clientId" label="Client ID" rules={[{ required: true, message: '请输入Client ID' }]}>
          <Input placeholder="请输入Client ID" />
        </Form.Item>
        <Form.Item name="clientSecret" label="Client Secret" rules={[{ required: true, message: '请输入Client Secret' }]}>
          <Input.Password placeholder="请输入Client Secret" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
