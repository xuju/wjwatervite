import service from '@/axios';
import { commandApi } from '@/config';
import { useRequest } from 'ahooks';
import React, { useMemo } from 'react'
import './xq.less'
import { Descriptions, Modal, Image } from 'antd';
interface Props {
    data: any;
    close?: Function;
    title?: string;
}
const status = [
    { name: '值班', filed: "duty" },
    { name: "预警", filed: 'warn' },
    { name: "防洪", filed: 'flood' },
    { name: "内涝积水", filed: 'logging' }
]
export default function XQModal(props: Props) {
    const { data, title = '', close } = props;

    const types = useMemo(() => {
        if (data) {

            const types = status.find(f => f.filed === data.fr_type)
            if (types) {
                return types.name
            } else {
                return data.fr_type
            }

        }

    }, [data])
    const onCancel = () => {
        close && close();
    }
    return (

        <Modal
            title={title}
            className="popup-modal"
            centered
            footer={null}
            visible={data ? true : false}
            onCancel={onCancel}
            width={904}
        >
            {data && <>
                <div className="PopupModal">
                    <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="记录人" >
                            {data.fr_record_person ?? '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="记录人电话" >
                            {data.fr_record_person_phone ?? '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="上报类型" >
                            {types}
                        </Descriptions.Item>
                        <Descriptions.Item label="地点" >
                            {data.address ?? '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="记录时间" >
                            {data.fr_record_time ?? '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="上报内容" span={5}>
                            {data.fr_content ?? '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="图片" span={5}>
                            <Image width={200} src={data.images} />
                            {/* <Image width={200} src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" /> */}
                        </Descriptions.Item>


                        {/* {attrs?.map((item, idx) => {
            return (
              <Descriptions.Item label={item} key={idx}>
                {getValue(data[index], item)}
              </Descriptions.Item>
            );
          })} */}
                    </Descriptions>
                    <div className="PopupModal-btn-wrap">
                        {/* <LeftOutlined className="popup-prev" onClick={prev} />
          {index + 1}/{data.length}
          <RightOutlined className="popup-next" onClick={next} /> */}
                    </div>
                </div>
            </>}
        </Modal>
    )
}
