import service from '@/axios';
import { commandApi } from '@/config';
import catchError from '@/utils';
import { useRequest } from 'ahooks';
import { Button, Col, Dropdown, message, Radio, RadioChangeEvent, Row, Select } from 'antd'
import React, { useState } from 'react'
import './index.less'
const { Option } = Select;

const yearArr = ['2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021']
const monthArr: string[] = [];
for (let i = 1; i <= 12; i++) {
    monthArr.push(i + '月')
}

export default function CommandContrast() {
    const [params, setParams] = useState({ startTime: "", endTime: '' });
    const [value, setValue] = React.useState('降水量');
    const [year, setYear] = useState('2019')
    const { run } = useRequest((params) => service.post(commandApi.getCommandContrast, params), { manual: true })
    const [visible, setVisible] = useState(false);
    const [astData, setAstData] = useState<any>();
    const onChange = (e: RadioChangeEvent) => {

        setValue(e.target.value);
    };
    const handleChange = (value: string, filed: string) => {

        let par: any = { ...params }
        par[filed] = value + '-01-01';
        setParams(par)

    }
    const contrastHandle = async () => {
        if (!params.startTime || !params.endTime) {
            message.warning('请选择对比年份');
            return false;
        }
        const [, result] = await catchError(run(params));
        if (result && result.data.code == 200) {
            let res = result.data.data;
            if (res) {
                setAstData(res)
                setVisible(true)
            } else {
                message.warning('暂无数据')
                setAstData(null)
            }

        }

    }
    const drop = () => {
        const startData = astData ? astData[0] : null;
        const endData = astData ? astData[1] : null;
        return (
            <div className="contrast-drop-content">
                <div className="ast-list-wrap">
                    <div className="ast-name">
                        <div>年度</div>
                        <div>平均降水量(mm)</div>
                        <div>地表水资源量(亿m³)</div>
                        <div>地下水资源量(亿m³)</div>
                        <div>水资源总量(亿m³)</div>
                    </div>
                    <div className="ast-time">
                        <div>{startData?.year}</div>
                        <div>{startData?.drp}</div>
                        <div>{startData?.sws_ww}</div>
                        <div>{startData?.gws_ww}</div>
                        <div>{startData?.total_ww}</div>
                    </div>
                    <div className="ast-time end-time">
                        <div>{endData?.year}</div>
                        <div>{endData?.drp}</div>
                        <div>{endData?.sws_ww}</div>
                        <div>{endData?.gws_ww}</div>
                        <div>{endData?.total_ww}</div>
                    </div>
                </div>

            </div>
        );
    }
    return (
        <div className='command-contrast'>
            <Row style={{ alignItems: 'center' }}>
                <Col style={{ color: '#6FE1F2', fontSize: 18 }}>历年同期监测数据：</Col>
                <Col>
                    <Radio.Group onChange={onChange} value={value}>
                        <Radio value="降水量" style={{ color: '#fff', fontSize: 16, backgroundColor: 'transparent' }}>降水量</Radio>
                        {/* <Radio value="雨量" style={{ color: '#fff', fontSize: 16 }}>雨量</Radio> */}
                    </Radio.Group>
                </Col>
            </Row>
            <Row style={{ marginTop: 8, alignItems: 'center' }}>
                <Col span={8}>
                    <Select defaultValue={params.startTime} style={{ width: 120 }} onChange={(e) => handleChange(e, 'startTime')} className='year-select'>
                        {yearArr.map(item => {
                            return (
                                <Option value={item} key={item}>{item}</Option>
                            );
                        })}
                    </Select>
                </Col>
                <Col span={1} style={{ color: '#fff', marginRight: 10, marginLeft: 15 }}>
                    比
                </Col>
                <Col span={10}>
                    <Select defaultValue={params.endTime} style={{ width: 120 }} onChange={(e) => handleChange(e, 'endTime')} className='year-select'>
                        {yearArr.map(item => {
                            return (
                                <Option value={item} key={item}>{item}</Option>
                            );
                        })}
                    </Select>
                </Col>
                <Col span={3}>
                    {/* <Button style={{ background: '#5E9DF8', borderColor: '#5E9DF8', color: '#fff' }} onClick={contrastHandle}>对比</Button> */}
                    <Dropdown overlay={drop} placement="bottomRight" arrow overlayClassName='ast-drop'>
                        <Button style={{ background: '#5E9DF8', borderColor: '#5E9DF8', color: '#fff' }} onClick={contrastHandle}>对比</Button>
                    </Dropdown>
                </Col>
            </Row>

        </div>
    )
}
