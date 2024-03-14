import React, { useEffect, useImperativeHandle, useMemo } from 'react';
import { Button, Col, DatePicker, Form, Input, Row } from 'antd';
const { RangePicker } = DatePicker;
import './index.less';
import moment from 'moment';
import DateFormat from '@/utils/dateFormat';

const SearchPanel = (props: { callbackValue: any; params: any; cref: any }) => {
  const { params, cref } = props;
  const showTime = useMemo(() => {
    if (params) {
      const opconfig = JSON.parse(params.opconfig ?? {});
      if (opconfig.time) return true;
    }
    return false;
  }, [params]);

  const [form] = Form.useForm();
  useImperativeHandle(cref, () => {
    return {
      form
    };
  });
  const onFinish = (values: any) => {
    if (!values.sj) {
      values.sj = [
        moment(DateFormat.getYesterday8(), 'YYYY-MM-DD HH:mm'),
        moment(DateFormat.getDay8(), 'YYYY-MM-DD HH:mm')
      ];
    }
    let o = {
      beginTime: values.sj[0].format('YYYY-MM-DD HH:mm:ss'),
      endTime: values.sj[1].format('YYYY-MM-DD HH:mm:ss'),
      name: values.name,
      pageIndex: 0,
      pageSize: 10,
      bigtype: 0
    };
    props.callbackValue(o);
  };
  useEffect(() => {
    form.resetFields();
  }, []);

  return (
    <div className="searchpanel">
      <Form
        name="search_form"
        onFinish={onFinish}
        form={form}
        initialValues={{
          sj: [
            moment(DateFormat.getYesterday8(), 'YYYY-MM-DD HH:mm'),
            moment(DateFormat.getDay8(), 'YYYY-MM-DD HH:mm')
          ],
          name: ''
        }}
      >
        {showTime && (
          <Row>
            <Form.Item name="sj" label="时间">
              <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
            </Form.Item>
          </Row>
        )}
        <Row>
          <Col span={18}>
            <Form.Item name="name" label="名称">
              <Input style={{ color: '#fff' }} />
            </Form.Item>
          </Col>
          <Col span={1} />
          <Col span={5}>
            <Button htmlType="submit" style={{ right: '0' }}>
              搜索
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default SearchPanel;
