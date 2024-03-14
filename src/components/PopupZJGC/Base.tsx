import React, { useEffect } from 'react';
import { Form, Input, Button, Select, Row, Col, DatePicker, Space } from 'antd';
import TextArea from 'rc-textarea';
interface IProps {
  data: IPorjtctFormType;
}
export default function Base(props: IProps) {
  const [form] = Form.useForm();
  const { data } = props;
  useEffect(() => {
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (!value) data[key] = '';
      });

      form.setFieldsValue(data);
    }
  }, [data]);

  return (
    <div className="popup-zjgc-base">
      <Form form={form} className="base-form-controller" layout="inline">
        <Form.Item name="name" label="项目名称" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="create_tm" label="填报时间" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="nature" label="项目性质" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="pscale" label="批复投资(万元)" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="ptype" label="工程类别" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="stm" label="拟/开工时间" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="total_duration" label="总工期(月)" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="etm" label="拟/建成时间" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>

        <Form.Item name="isppp" label="是否为PPP项目" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="adcd" label="行政区划" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>

        <Form.Item name="cur_level" label="当前所属阶段" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="status" label="项目建设动态" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="x" label="经度" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="y" label="纬度" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="address" label="建设详细地址" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="design_unit" label="设计单位" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>

        <Form.Item name="supervise_unit" label="监理单位" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="construction_unit" label="施工单位" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="fzr" label="负责人" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="fzrtel" label="负责人电话" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="lxr" label="联系人" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="lxrtel" label="联系人电话" style={{ width: '48%' }}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="lxrtel" label="联系人电话" style={{ width: '98%' }}>
          <TextArea autoSize={{ minRows: 2, maxRows: 2 }} disabled />
        </Form.Item>
      </Form>
    </div>
  );
}
