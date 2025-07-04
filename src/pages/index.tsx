import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Tabs } from 'antd';
import MetaData from '../components/metaData.tsx';
import CaseData from '../components/caseData.tsx';

const menuItems = [
    { key: '1', label: '对象元数据' },
    { key: '2', label: 'case展示' },
    // 可以继续添加菜单项
];


const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [activeKey, setActiveKey] = useState('1');
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
        <Layout style={{ minHeight: '100vh', width: '100vw', padding: '40px 100px', background: '#fff' }}>
            <Tabs
                tabPosition="top"
                activeKey={activeKey}
                onChange={setActiveKey}
                items={menuItems.map(item => ({
                    key: item.key,
                    label: item.label,
                    children: (
                        <div style={{ minHeight: 280 }}>
                            {item.key === '1' ? <MetaData /> : <CaseData />}
                        </div>
                    )
                }))}
                style={{ background: '#fff' }}
            />
        </Layout>
    );
};

export default HomePage;
