import { useLayerContext } from '@/store/layer';
import { Checkbox, Col, message, Row, Tooltip } from 'antd';
import _ from 'lodash';
import React, { useEffect, useMemo } from 'react';
import './index.less';
const LayerTitle = (props: { title: string }) => {
  return (
    <div className="title-icon-wrap">
      <span className="title-icon" />
      <span>{props.title}</span>
    </div>
  );
};

interface LayerControlProps {
  layerList: any[];
}

export default function LayerControl(props: LayerControlProps) {
  const { layerList } = props;

  const { state, dispatch } = useLayerContext();
  const selectedLayers = useMemo(() => {
    if (state && state.list) {
      return state.list;
    } else {
      return [];
    }
  }, [state]);
  const onChange = (checkedValues: any[]) => {
    if (checkedValues.length > 0) {
      let tmp = checkedValues[checkedValues.length - 1];
      if (!tmp.layertype) {
        checkedValues.pop();
        message.destroy();
        message.info(`${tmp.layerzwmc}暂无数据`);
      }
    }
    checkedValues.forEach((item) => {
      if (item.layertype === 'Api') {
        item.url1 = item.url;
      } else {
        let opconfigJ = JSON.parse(item.opconfig);

        item.url1 = opconfigJ?.listUrl ?? '';
      }
    });

    const tem = [...checkedValues];

    if (tem && tem.length > 0) {
      dispatch({ type: 'setCurrent', data: { current: tem.pop() } });
    } else {
      dispatch({ type: 'setCurrent', data: { current: null } });
    }

    dispatch({ type: 'setList', data: { list: checkedValues } });
  };

  return (
    <div className="layer-control-b global-scroll">
      <Checkbox.Group onChange={onChange} value={selectedLayers}>
        {layerList &&
          layerList.map((item, index) => {
            return (
              <Row key={index}>
                <Col span={24}>
                  <LayerTitle title={item.layerzwmc} key={item.id} />
                </Col>
                <Col span={24}>
                  <div className="layer-item-wrap  global-scroll">
                    {item.childs.length > 0 &&
                      item.childs.map((item: { id: string; layerzwmc: string; icon: string }) => {
                        return (
                          <Col span={12} key={`${item.id}_${item.layerzwmc}`}>
                            <Checkbox value={item}>
                              {item.icon && (
                                <img
                                  src={item.icon ?? ''}
                                  alt=""
                                  width="14px"
                                  height="14px"
                                  style={{ margin: '-3px 5px 3px -3px' }}
                                />
                              )}
                              {item.layerzwmc && item.layerzwmc.length > 6 && (
                                <Tooltip title={item.layerzwmc}>
                                  {item.layerzwmc.slice(0, 6)}...
                                </Tooltip>
                              )}
                              {item.layerzwmc && item.layerzwmc.length <= 6 && (
                                <span className="layer-names">{item.layerzwmc}</span>
                              )}
                            </Checkbox>
                          </Col>
                        );
                      })}
                  </div>
                </Col>
              </Row>
            );
          })}
      </Checkbox.Group>
    </div>
  );
}
