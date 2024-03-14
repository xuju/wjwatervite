import React, { useEffect, useRef } from 'react';
import './index.less';
import MapBox from '@/components/MapBox';
import { useView } from '@/utils/hooks';
import LayerToggle from '@/components/LayerToggle';
import { Checkbox, Col, Row } from 'antd';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import Point from '@arcgis/core/geometry/Point';
const layers = [
  {
    id: '1',
    name: '水域储备区-占',
    // url: 'http://172.16.9.115:6080/arcgis/rest/services/WJWATER/SGC/MapServer',
    url: ' http://2.37.106.209:6080/arcgis/rest/services/WJWATER/SYCB/MapServer',
    sublayers: [
      {
        id: 0
      }
    ]
  },
  {
    id: '2',
    name: '水域储备区-补',
    // url: 'http://172.16.9.115:6080/arcgis/rest/services/WJWATER/SGC/MapServer',
    url: ' http://2.37.106.209:6080/arcgis/rest/services/WJWATER/SYCB/MapServer',
    sublayers: [
      {
        id: 1
      }
    ]
  }
];

export default function LoadLayer() {
  const view = useView();
  const grouplayer = useRef(new GroupLayer());
  useEffect(() => {
    if (view) {
      const mapPoint = new Point({
        x: 120.77560969122031,
        y: 31.027415352096813,
        spatialReference: view.spatialReference
      });
      view.goTo({ target: mapPoint, zoom: 6 });

      view.map.add(grouplayer.current);
    }
  }, [view]);
  const onChange = (record: any[]) => {
    const select = layers.filter((f) => record.includes(f.id));
    const noSelect = layers.filter((f) => !record.includes(f.id));
    select.forEach((item) => {
      const find = grouplayer.current.findLayerById(item.id);
      if (find) {
        find.visible = true;
      } else {
        const layer = new MapImageLayer({
          url: item.url,
          id: item.id,
          title: item.name,
          sublayers: item.sublayers
        });
        grouplayer.current.add(layer);
      }
    });
    noSelect.forEach((item) => {
      const find = grouplayer.current.findLayerById(item.id);
      if (find) {
        find.visible = false;
      }
    });
  };
  return (
    <div className="LoadLayer">
      <MapBox />
      {view && <LayerToggle view={view} style={{ right: '1rem' }} />}
      <div className="layer-tree">
        <div className="title-icon-wrap">
          <span className="title-icon"></span>
          <span>水经济部署</span>
        </div>
        <div className="layer-list">
          <Checkbox.Group style={{ width: '100%' }} className="custom-checkbox" onChange={onChange}>
            <Row>
              {layers.map((item) => {
                return (
                  <Col span={24} key={item.name}>
                    <Checkbox value={item.id}>{item.name}</Checkbox>
                  </Col>
                );
              })}
            </Row>
          </Checkbox.Group>
        </div>
      </div>
    </div>
  );
}
