import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import AntdTableDemo from '../components/AntdTableDemo.tsx';

const { Sider, Content } = Layout;

const menuItems = [
    { key: '1', label: '获取对象元数据' },
    // 可以继续添加菜单项
];


const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    useEffect(() => {
        const t = localStorage.getItem('accessToken');
        if (!t) {
            navigate('/login');
        } else {
            setToken(t);
        }
    }, [navigate]);
    if (!token) return null;
    return (
        <Layout style={{ minHeight: '100vh', width: '100vw' }}>
            <Sider width={200} style={{ background: '#fff' }}>
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    style={{ height: '100%', borderRight: 0 }}
                    items={menuItems}
                />
            </Sider>
            <Layout style={{ width: '100%', padding: '0 12px' }}>
                <div style={{ minHeight: 280 }}>
                    <AntdTableDemo />
                </div>
            </Layout>
        </Layout>
    );
};

export default HomePage;
