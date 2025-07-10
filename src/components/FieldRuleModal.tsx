// src/components/FieldRuleModal.tsx
import { Modal, Table } from "antd";

const columns = [
    { title: "字段类型", dataIndex: "field", key: "field", width: 120 },
    { title: "类型", dataIndex: "type", key: "type", width: 50 },
    { title: "备注", dataIndex: "remark", key: "remark", width: 200 },
    { title: "可设置必填", dataIndex: "required", key: "required", width: 60 },
    { title: "可设置唯一", dataIndex: "unique", key: "unique", width: 60 },
    { title: "阐值", dataIndex: "value", key: "value", width: 200 },
];

// 这里仅举例部分数据，实际可补全
const data = [

    {
        "key": 1,
        "field": "_id",
        "type": "int",
        "remark": "记录ID",
        "required": "",
        "unique": "",
        "value": ""
    },
    {
        "key": 2,
        "field": "datetime_bfae52d8694",
        "type": "int",
        "remark": "「日期时间」，日期时间字段，使用 Unix 时间戳",
        "required": "✅",
        "unique": "",
        "value": ""
    },
    {
        "key": 3,
        "field": "avatar_280f2783b49",
        "type": "object",
        "remark": "「头像/标识」，头像/标识字段",
        "required": "",
        "unique": "",
        "value": ""
    },
    {
        "key": 4,
        "field": "boolean_e20a627650",
        "type": "bool",
        "remark": "「布尔」，布尔字段",
        "required": "✅ 默认",
        "unique": "",
        "value": ""
    },
    {
        "key": 5,
        "field": "autoid_ea57d622d53",
        "type": "string",
        "remark": "「自动编号」，自动编号字段，为空时将根据规则自动生成编号",
        "required": "",
        "unique": "",
        "value": ""
    },
    {
        "key": 6,
        "field": "rollup_22d35024673",
        "type": "float",
        "remark": "「汇总」，汇总字段，返回类型为数字",
        "required": "",
        "unique": "",
        "value": ""
    },
    {
        "key": 7,
        "field": "date_398bf8e52d8",
        "type": "string",
        "remark": "「日期」，日期字段",
        "required": "✅",
        "unique": "",
        "value": ""
    },
    {
        "key": 8,
        "field": "extractSubObject_7c19707a97b",
        "type": "object",
        "remark": "「多值取单值」，多值取单值字段，关联单条记录",
        "required": "",
        "unique": "",
        "value": ""
    },
    {
        "key": 9,
        "field": "multilingual_24762c280f2",
        "type": "object",
        "remark": "「多语言文本」，多语言文本字段",
        "required": "✅",
        "unique": "✅",
        "value": ""
    },
    {
        "key": 10,
        "field": "phone_73c280f2783",
        "type": "object",
        "remark": "「手机号码」，手机号码字段",
        "required": "✅",
        "unique": "✅",
        "value": ""
    },
    {
        "key": 11,
        "field": "lookup_5a2675204ba",
        "type": "object",
        "remark": "「关联对象」，关联对象字段，关联「行政区划」对象，关联单条记录",
        "required": "✅",
        "unique": "",
        "value": ""
    },
    {
        "key": 12,
        "field": "referenceField_35024073c28",
        "type": "object",
        "remark": "「引用字段」，引用字段字段",
        "required": "",
        "unique": "",
        "value": ""
    },
    {
        "key": 13,
        "field": "option_652869c88bb",
        "type": "object",
        "remark": "「选项」，选项字段，包含以下选项：选项1，API 名称为 option_52d869c88b9；选项2，API 名称为 option_2a689c88b59",
        "required": "✅",
        "unique": "",
        "value": ""
    },
    {
        "key": 14,
        "field": "attachment_75204baa576",
        "type": "object",
        "remark": "「文件列表」，文件字段",
        "required": "✅",
        "unique": "",
        "value": ""
    },
    {
        "key": 15,
        "field": "email_f2783b49d9a",
        "type": "string",
        "remark": "「邮箱」，邮箱字段",
        "required": "✅",
        "unique": "✅",
        "value": ""
    },
    {
        "key": 16,
        "field": "richtext_7e642355024",
        "type": "object",
        "remark": "「富文本」，富文本字段",
        "required": "✅",
        "unique": "",
        "value": ""
    },
    {
        "key": 17,
        "field": "decimal_e4fe677c109",
        "type": "string",
        "remark": "「定精度」，数字字段",
        "required": "✅",
        "unique": "✅",
        "value": "高精度数字，用户可输入整数不超过 18 位、小数不超过 9 位的数字"
    },
    {
        "key": 18,
        "field": "region_53b49b9da46",
        "type": "object",
        "remark": "「行政区划」，行政区划字段",
        "required": "✅",
        "unique": "",
        "value": ""
    },
    {
        "key": 19,
        "field": "biginteger_7a6633398bf",
        "type": "string",
        "remark": "「整数」，数字字段",
        "required": "✅",
        "unique": "✅",
        "value": "用户只能输入不超过 18 位的整数"
    },
    {
        "key": 20,
        "field": "number_a333b86e65",
        "type": "float",
        "remark": "「浮点数」，数字字段",
        "required": "✅",
        "unique": "✅",
        "value": ""
    },
    {
        "key": 21,
        "field": "subObject_b67c71097a9",
        "type": "object[]",
        "remark": "「子对象」，子对象字段，关联多条记录",
        "required": "✅",
        "unique": "",
        "value": ""
    },
    {
        "key": 22,
        "field": "text_58b17b557d",
        "type": "string",
        "remark": "「文本」，文本字段",
        "required": "✅",
        "unique": "✅",
        "value": "关闭「多行文本」时，最多可输入 255 个字符，开启「多行文本」后，将按照长文本存储，最多可输入 100,000 个字符"
    },
    {
        "key": 23,
        "field": "formula_94baa67d222",
        "type": "string",
        "remark": "「公式」，公式字段，返回类型为文本",
        "required": "",
        "unique": "",
        "value": ""
    }

];

const FieldRuleModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => (
    <Modal
        title="字段规则"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={1200}
    >
        <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ y: 600 }}
            bordered
            size="small"
        />
    </Modal>
);

export default FieldRuleModal;
