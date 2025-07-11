import json
import time
import logging
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi import Body
from fastapi.middleware.cors import CORSMiddleware
import requests
from openai import OpenAI


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境建议写前端实际地址，如 ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置日志记录
logging.basicConfig(
    level=logging.INFO,  # 设置日志级别为INFO
)

# 获取token
def get_token():
    global access_token
    url = "https://ae-openapi.feishu.cn/auth/v1/appToken"

    headers = {
        "Content-Type": "application/json"
    }

    payload = {
        "clientId": "c_b9899d7d557343cbb2cf",
        "clientSecret": "b6b84be96f764197bf9e1580fd2542f3"
    }

    try:
        response = requests.post(
            url,
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            access_token = response.json()["data"]["accessToken"]
            return True, "Token获取成功"
        else:
            return False, f"Token请求失败，状态码: {response.status_code}, 详情: {response.text}"

    except requests.exceptions.RequestException as e:
        return False, f"Token请求异常: {str(e)}"


# 获取元数据
def get_metadata():
    global meta_json, apiname_list
    if not access_token:
        return False, "未获取到access_token，请先获取token"
    
    url="https://ae-openapi.feishu.cn/api/data/v1/namespaces/package_d6426c__c/meta/objects/object_cbb246f2bd1"

    headers={
        "Authorization": access_token
    }
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            meta_json = response.json()["data"]["fields"]
            apiname_list = [data["apiName"] for data in meta_json]
            return True, "元数据获取成功"
        else:
            return False, f"元数据请求失败，状态码: {response.status_code}, 详情: {response.text}"
    except requests.exceptions.RequestException as e:
        return False, f"元数据请求异常: {str(e)}"

# 生成数据
def Generate(num,flag):
    def call_llm(prompt,model):
        client = OpenAI(
            api_key="sk-5dc2ff90f19744b28d051df281f3a0de",
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
        )
    
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {'role': 'user', 'content': prompt}
            ],
            extra_body={"enable_thinking": False},
            temperature=1.2,
            seed = random.randint(0, 2**31 - 1)
        )
        
        return completion.choices[0].message.content
    
    def generate_china_phone_number(num, unique=False):
        prefix_list = ['139', '138', '137', '136', '135', '134', '147',
                       '150', '151', '152', '157', '158', '159', '170', '178',
                       '182', '183', '184', '187', '188', '189', '199']
        
        phone_set = set()
        phone_list = []
    
        if unique:
            max_unique_count = len(prefix_list) * 10**8
            if num > max_unique_count:
                raise ValueError(f"无法生成超过 {max_unique_count} 个不重复的手机号")
    
            while len(phone_set) < num:
                prefix = random.choice(prefix_list)
                suffix = ''.join(random.choices('0123456789', k=8))
                phone = prefix + suffix
                phone_set.add(phone)
    
            return list(phone_set)
        else:
            for _ in range(num):
                prefix = random.choice(prefix_list)
                suffix = ''.join(random.choices('0123456789', k=8))
                phone_list.append(prefix + suffix)
            return phone_list
    
    def generate_random_date(num,unique):
        start_year=1949
        end_year=2025
        start_date = datetime(start_year, 1, 1)
        end_date = datetime(end_year + 1, 1, 1) - timedelta(days=1)
        delta_days = (end_date - start_date).days
        
        if unique:
            all_dates = [start_date + timedelta(days=i) for i in range(delta_days + 1)]
    
            if num > len(all_dates):
                raise ValueError("所需日期数量超过可用日期范围！")
            random_dates = random.sample(all_dates, k=num)
            return [d.strftime('%Y-%m-%d') for d in random_dates]
        else:
            date_list=[]
            for i in range(num):
                random_days = random.randint(0, delta_days)
                random_date = start_date + timedelta(days=random_days)
                date_list.append(random_date.strftime('%Y-%m-%d'))
            return date_list
    
    def generate_random_text(num):
        response=call_llm(f'返回{num}句非常简短（8个字以内）且意思简单的中文文本，你只需要输出这些文本，所有文本被装进一个[]中。注意不是每个文本放进一个列表中。你的参考输出格式如下（文本内容可以多样化）：["简单说明",...]，而不是["简单说明"]\n ...',model="qwen2.5-32b-instruct")
        print(response)
        return json.loads(response)
    
    def generate_random_email(num):
        response=call_llm(f'返回{num}个邮箱地址，你只需要输出这些邮箱地址，所有邮箱地址被装进一个列表中。注意不是每个邮箱地址放进一个[]中。你的参考输出格式如下（文本内容可以多样化）：["example@qq.com",...]，而不是["example@qq.com"]\n ...',model="qwen2.5-32b-instruct")
        print(response)
        return json.loads(response)
    
    def generate_random_area(num,unique):
        with open('region.json', 'r', encoding='utf-8') as f:
            region_data = json.load(f)
        region_list=[]
        for data in region_data["data"]["records"]:
            _id=data["id"]
            region_list.append(_id)
        if unique:
            return random.sample(region_list,k=num)
        else:
            return random.choices(region_list,k=num)
    
    def generate_random_integers(n, min_val=0, max_val=100, unique=False):
        if unique:
            if n > (max_val - min_val + 1):
                raise ValueError(f"范围 [{min_val}, {max_val}] 太小，无法生成 {n} 个不重复的整数")
            return [str(x) for x in random.sample(range(min_val, max_val + 1), k=n)]
        else:
            return [str(random.randint(min_val, max_val)) for _ in range(n)]
            
    def generate_random_floats(n, min_val=0.0, max_val=100.0, unique=False, precision=2):
        if min_val > max_val:
            raise ValueError("min_val 必须小于等于 max_val")
    
        floats = []
        
        if unique:
            seen = set()
            while len(floats) < n:
                num = round(random.uniform(min_val, max_val), precision)
                if num not in seen:
                    seen.add(num)
                    floats.append(num)
        else:
            floats = [round(random.uniform(min_val, max_val), precision) for _ in range(n)]
        
        return floats
    
    def generate_multilingual_text(num):
        response=call_llm(f'返回{num}句非常简短（8个字以内）且意思简单的中英文文本，你只需要输出这些文本，所有文本被装进一个[]中。注意不是每个文本放进一个列表中。你的参考输出格式如下（文本内容可以多样化）：[{{"zh_cn":"简单说明","en_us":"simple declaration"}},...]，而不是[{{"zh_cn":"简单说明","en_us":"simple declaration"}}]\n ...',model="qwen2.5-32b-instruct")
        print(response)
        return json.loads(response)
    
    def generate_random_options(num):
        option_list=["option_52d86948bb9","option_2d86948bb9d"]
        return random.choices(option_list, k=num)
    
    def generate_random_formula(normal_text_data):
        return [text+"test" for text in normal_text_data]
    
    def generate_rich_text(num):
        response=call_llm(f'返回{num}句简短的富文本，你只需要输出这些富文本，所有富文本被装进一个列表中。注意不是每个富文本放进一个[]中。你的参考输出格式如下（文本内容可以多样化）：["一句富文本",...]，而不是["一句富文本"]\n ...',model="qwen2.5-32b-instruct")
        print(response)
        response=json.loads(response)
        ans=[]
        for text in response:
            ans.append(
                {
                    "config": [],
                    "preview": "",
                    "raw": text
                }
            )
        return ans
    
    def generate_random_decimal(num):
        float_list=generate_random_floats(n=num,precision=9)
        return [str(x) for x in float_list]
    
    normal_text_datas=generate_random_text(num)
    rich_text_datas=generate_rich_text(num)
    email_datas=generate_random_email(num)
    area_datas=generate_random_area(num,unique=False)
    date_datas=generate_random_date(num=num,unique=False)
    phone_datas=generate_china_phone_number(num,unique=False)
    int_datas=generate_random_integers(n=num)
    float_datas=generate_random_floats(n=num)
    multilingual_text_datas=generate_multilingual_text(num)
    option_datas=generate_random_options(num)
    rich_text_datas=generate_rich_text(num)
    formula_text=generate_random_formula(normal_text_datas)
    decimal_datas=generate_random_decimal(num)

    records = []
    prob=0.33
    if flag:
        for i in range(num):
            record = {
                "record": {
                    "phone_73c280f2783": None if random.random()< prob else{
                        "dialing_code": "+86",
                        "country_code": "CN",
                        "number": phone_datas[i]
                    },
                    "region_83b49d9a446": None if random.random()< prob else{
                        "_id": area_datas[i]
                    },
                    "decimal_a446e77c109": None if random.random()< prob else decimal_datas[i],
                    "number_a33398bfae5": None if random.random()< prob else float_datas[i],
                    "attachment_75204baa676": [],
                    "richText_76d22d35024": None if random.random()< prob else rich_text_datas[i],
                    "multilingual_24673c280f2":None if random.random()< prob else multilingual_text_datas[i] ,
                    "lookup_6a2675204ba": {
                        "_id": "100"
                    },
                    "date_398bfae52d8": None if random.random()< prob else date_datas[i],
                    "subObject_6e77c1097a9": None if random.random()< prob else [
                        {
                            "text_36bb17b5c7d": normal_text_datas[i]
                        }
                    ],
                    "option_e52d86948bb": None if random.random()< prob else option_datas[i],
                    "text_7ea7d6a3339": None if random.random()< prob else normal_text_datas[i],
                    "avatar_280f2783b49": {},
                    "bigint_7d6a33398bf":None if random.random()< prob else int_datas[i],
                    "boolean_e206a267520":None if random.random()< prob else random.choice([True,False]),
                    "email_f2783b49d9a": None if random.random()< prob else email_datas[i],
                    
                }
            }
            records.append(record)
    else:
        for i in range(num):
            record = {
                "record": {
                    "phone_73c280f2783": {
                        "dialing_code": "+86",
                        "country_code": "CN",
                        "number": phone_datas[i]
                    },
                    "region_83b49d9a446": {
                        "_id": area_datas[i]
                    },
                    "decimal_a446e77c109": decimal_datas[i],
                    "number_a33398bfae5":float_datas[i],
                    "attachment_75204baa676": [],
                    "richText_76d22d35024": rich_text_datas[i],
                    "multilingual_24673c280f2":multilingual_text_datas[i] ,
                    "lookup_6a2675204ba": {
                        "_id": "100"
                    },
                    "date_398bfae52d8": date_datas[i],
                    "subObject_6e77c1097a9": [
                        {
                            "text_36bb17b5c7d": normal_text_datas[i]
                        }
                    ],
                    "option_e52d86948bb":option_datas[i],
                    "text_7ea7d6a3339": normal_text_datas[i],
                    "avatar_280f2783b49": {},
                    "bigint_7d6a33398bf": int_datas[i],
                    "boolean_e206a267520": random.choice([True,False]),
                    "email_f2783b49d9a": email_datas[i],
                    
                }
            }
            records.append(record)
        
    
    return records
def Insert(records):
    
    url = "https://ae-openapi.feishu.cn/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records"
    headers = {
        "Authorization": access_token,
        "Content-Type": "application/json"
    }
    
    ids=[]
    for record in records:
        payload=record
        response = requests.post(
            url,
            headers=headers,
            json=payload  # 自动序列化为JSON并设置Content-Type
        )
        
        # print(f"Status Code: {response.status_code}")
        # print(f"Response: {response.json()}")
        ids.append(response.json()["data"]["id"])
    return ids

def Select(select_ids):
    url = "https://ae-openapi.feishu.cn/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records_query"
    
    headers = {
        "Authorization": access_token,
        "Content-Type": "application/json",
        "Cookie": "QXV0aHpDb250ZXh0=7e77904e36644e7dbce4abf06d0c219b; passport_trace_id=7520184035662888979; passport_web_did=7520184035642589187; swp_csrf_token=1dbee929-66c1-49e0-8c43-79fdb6774991; t_beda37=045a99a0883b774cd31bc9a06c9bc267a86651416592aa11d46671627a69901c"
    }
    
    payload = {
        "use_page_token": False,
        "offset": 0,
        "need_total_count": False,
        "filter": {},
        "page_token": "",
        "page_size": 500,
        "query_deleted_record": False,
        "select":apiname_list
    }
    
    response = requests.post(
        url,
        headers=headers,
        json=payload  # 自动序列化为JSON
    )
    response=response.json()
    datas=[]   
    for data in response["data"]["items"]:
        if data["_id"] in select_ids:
            datas.append(data)

    return datas

def Edit(ids,num,flag):
    if num==1:
        edit_ids=random.sample(ids,k=num)
        records=Generate(num,flag)
    else:
        edit_ids=random.sample(ids,k=num//2)
        records=Generate(num//2,flag)
    original_content=Select(edit_ids)
    for _id,record in zip(edit_ids,records):
        url=f"https://ae-openapi.feishu.cn/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records/{_id}"
        headers={
            "Authorization":access_token,
            "Content-Type":"application/json"
        }
        payload=record
        response = requests.patch(
            url,
            headers=headers,
            json=payload  # 自动序列化为JSON并设置Content-Type
        )

        # print(f"Status Code: {response.status_code}")
        # print(f"Response: {response.json()}")
    return edit_ids,original_content

def Delete(ids,num):
    if num==1:
        delete_ids=random.sample(ids,k=num)
    else:
        delete_ids=random.sample(ids,k=num//2)
    original_content=Select(delete_ids)
    for _id in delete_ids:
        url= f'https://ae-openapi.feishu.cn/v1/data/namespaces/package_d6426c__c/objects/object_cbb246f2bd1/records/{_id}'
        headers={
            "Authorization":access_token,
            "Content-Type":"application/json"
        }
        response = requests.delete(
            url,
            headers=headers  # 自动序列化为JSON并设置Content-Type
        )
        # print(f"Status Code: {response.status_code}")
        # print(f"Response: {response.json()}")
    return delete_ids,original_content

@app.post("/test")
async def test(num: int = Body(..., embed=True),flag: bool = Body(..., embed=True)):
    logs = []
    records = []  # 新增，保证作用域
    # 步骤1: 获取Token
    logging.info({"type": "info", "message": "开始获取Token"})
    success, msg = get_token()
    logging.info({"type": "success" if success else "error", "message": msg})
    if not success:
        return {"status": "error", "logs": logs}
    
    # 步骤2: 获取元数据
    logging.info({"type": "info", "message": "开始获取元数据"})
    success, msg = get_metadata()
    logging.info({"type": "success" if success else "error", "message": msg})
    if not success:
        return {"status": "error", "logs": logs}
    
    # 步骤3: 生成数据
    logging.info({"type": "info", "message": f"开始生成{num}条数据"})
    try:
        records = Generate(num,flag)
        logging.info({"type": "success", "message": f"{num}条数据生成完成"})
    except Exception as e:
        logging.info({"type": "error", "message": f"数据生成失败: {str(e)}"})
        return {"status": "error"}
    
    # 步骤4: 插入数据
    logging.info({"type": "info", "message": "开始插入数据"})
    insert_ids = Insert(records)
    logging.info({"type": "success", "message": "插入数据成功"})
    
    # 步骤5: 查询数据
    logging.info({"type": "info", "message": "开始查询数据"})
    select_response = Select(insert_ids)
    if select_response:
        logging.info({"type": "success","message": f"查询到刚刚插入的数据，具体如下：\n{select_response}"})

    #  步骤6: 编辑数据
    logging.info({"type": "info", "message": "开始编辑数据"})
    edit_ids,edit_original_content=Edit(insert_ids,num,flag)
    logging.info({"type": "success", "message": "编辑数据成功"})
    
    # 步骤7: 查询数据
    logging.info({"type": "info", "message": "开始查询数据"})
    edit_select_response = Select(edit_ids)
    if select_response:
        logging.info({"type": "success","message": f"查询到刚刚编辑的数据，具体如下：\n{select_response}"})
        
    #  步骤8：删除数据
    logging.info({"type": "info", "message": "开始删除数据"})
    delete_ids,delete_original_content=Delete(insert_ids,num)
    logging.info({"type": "success", "message": "删除数据成功"})    
    
    # 步骤9: 查询数据
    logging.info({"type": "info", "message": "开始查询数据"})
    delete_select_response = Select(delete_ids)
    if delete_select_response==[]:#返回为空列表字符串
        logging.info({"type": "success","message": f"查询不到刚刚删除的数据，完成删除。"})
    else:
        logging.info({"type": "error","message": f"查询到刚刚删除的数据，删除未完成。"})
    
    return {
        "status":"success",
        "message":"智能测试流程完成",
        "result":[{"generate":records},
                  {"edit":{"original_content":edit_original_content,"edit_content":edit_select_response}},
                  {"delete":{"original_content":delete_original_content,"delete_content":delete_select_response}}]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)