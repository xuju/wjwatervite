import { Button, Col, Input, Pagination, Row, Spin } from 'antd'
import React, { ChangeEvent, ChangeEventHandler, useEffect, useMemo, useState } from 'react'
import Title from '../Title'
import './index.less'
import icon from './images/icon.png'
import icon_select from './images/icon1.png'
interface Props {
    data: any;
    clickCallBack?: Function;
}
interface ItemType {
    id: string;
    name: string;
    index: number;
}
export default function CommandLeft(props: Props) {
    const { data, clickCallBack } = props;
    const [page, setPage] = useState(1);
    const [pageSize,] = useState(14)
    const [searchVal, setSearchVal] = useState('');
    const [list, setList] = useState<ItemType[]>([]);
    const [selectId, setSelectId] = useState('');
    useEffect(() => {
        if (data) {
            data.forEach((item: { index: number }, index: number) => item.index = index + 1)
            setList(data)


        }
    }, [data]);
    const onChange = (page: number) => {
        setPage(page)
    }
    const searchOnChange = (e: ChangeEvent<HTMLInputElement>) => {

        setSearchVal(e.target.value)

    }
    const start = useMemo(() => {
        return (page - 1) * pageSize
    }, [page])
    const end = useMemo(() => {
        return (page - 1) * pageSize + pageSize
    }, [page])


    const onSearch = () => {
        setSelectId('');
        setPage(1);
        const datas = [...data];


        if (searchVal) {
            let filter = datas.filter((item: { name: string }) => item.name.includes(searchVal));
            filter.forEach((item: { index: number }, index: number) => item.index = index + 1);

            setList(filter);
        } else {
            setList(datas);
        }
    };
    const onclick = (val: ItemType) => {



        setSelectId(val.id);
        clickCallBack && clickCallBack(val);

    };
    return (
        <div className='command-left'>
            <Title text='易涝点监测' />
            <div className="command-left-wrap">
                <div className="search-wrap">
                    <Row>
                        <Col span={16}>
                            <Input placeholder='请输入监测点名称' onChange={searchOnChange} />
                        </Col>
                        <Col offset={1} span={7}>
                            <Button onClick={onSearch}>搜索</Button>
                        </Col>
                    </Row>
                </div>
                <div className="command-left-list-wrap">
                    <Spin spinning={data ? false : true}>
                        <div className="header">
                            <span className='index'>序号</span>
                            <span className='name'>监测点名称</span>
                        </div>
                        <div className="list-wrap">
                            {list && list.slice(start, end).map((item: ItemType) => {
                                return (
                                    <div className={["list-item", selectId === item.id ? 'select' : ''].join(' ')} key={item.id} onClick={() => onclick(item)}>
                                        <span className='index'>{item.index}</span>
                                        <span className='name'>{item.name}</span>
                                        <span className="icon">
                                            <img src={selectId === item.id ? icon_select : icon} alt={item.name} width='20' height='20' />
                                        </span>
                                    </div>
                                );
                            })}

                        </div>
                    </Spin>
                </div>
                <Pagination size="small" className='command-pagination' total={list.length} showTotal={() => `共${list.length}条数据`} onChange={onChange} current={page} />
            </div>

        </div>
    )
}
