import React, { useState } from 'react';
import './csseData.module.scss';
// 假设 apiCommon 下有这些组件，实际请根据你的目录调整
import MetaApi from './apiCommon/MetaApi';
import GenerateApi from './apiCommon/GenerateApi';
import CaseApi from './apiCommon/CaseApi';
import DeleteApi from './apiCommon/DeleteApi';
import DeleteBatchApi from './apiCommon/DeleteBatchApi';
import EditApi from './apiCommon/EditApi';  
import CreateApi from './apiCommon/CreateApi';
// ...可以继续引入其他接口组件

const apiMenu = [
    {
        key: 'meta',
        label: (
            <>
                <span style={{ color: '#17b26a', fontWeight: 'bold' }}>GET</span> 获取对象元数据
            </>
        ),
        component: <MetaApi />
    },
    {
        key: 'generate',
        label: (
            <>
                <span style={{ color: '#ef6820', fontWeight: 'bold' }}>POST</span> 智能生成测试数据
            </>
        ),
        component: <GenerateApi />
    },
    {
        key: 'case',
        label: (
            <>
                <span style={{ color: '#ef6820', fontWeight: 'bold' }}>POST</span> 获取case数据
            </>
        ),
        component: <CaseApi />
    },
    {
        key: 'delete',
        label: (
            <>
                <span style={{ color: '#f04438', fontWeight: 'bold' }}>DELETE</span> 删除单个case数据
            </>
        ),
        component: <DeleteApi />
    },
    {
        key: 'deleteBatch',
        label: (
            <>
                <span style={{ color: '#f04438', fontWeight: 'bold' }}>DELETE</span> 批量删除case数据
            </>
        ),
        component: <DeleteBatchApi />
    },
    {
        key: 'edit',
        label: (
            <>
                <span style={{ color: '#1890ff', fontWeight: 'bold' }}>PATCH</span> 编辑case数据
            </>
        ),
        component: <EditApi />
    },
    {
        key: 'create',
        label: (
            <>
                <span style={{ color: '#ef6820', fontWeight: 'bold' }}>POST</span> 新增case数据
            </>
        ),
        component: <CreateApi />
    },
    // ...继续添加其他接口
];

const ApiData: React.FC = () => {
    const [selectedKey, setSelectedKey] = useState(apiMenu[0].key);

    const renderContent = () => {
        const item = apiMenu.find((m) => m.key === selectedKey);
        return item ? item.component : null;
    };

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            {/* 左侧菜单 */}
            <div style={{ width: 250, borderRight: '1px solid #eee', padding: 16 }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {apiMenu.map((menu) => (
                        <li
                            key={menu.key}
                            className={`api-menu-item${selectedKey === menu.key ? ' selected' : ''}`}
                            onClick={() => setSelectedKey(menu.key)}
                        >
                            {menu.label}
                        </li>
                    ))}
                </ul>
            </div>
            {/* 右侧内容区 */}
            <div style={{ flex: 1 ,width: 'calc(100% - 250px)'}}>{renderContent()}</div>
        </div>
    );
};

export default ApiData;
