// 水经济部署
import ConomyLeft from '@/components/Conomy/ConomyLeft';
import ConomyRight from '@/components/Conomy/ConomyRight';
import LayerToggle from '@/components/LayerToggle';
import MapBox from '@/components/MapBox';
import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import pointImg from './images/湖泊定位.png';
import QueryTask from '@arcgis/core/tasks/QueryTask';
import Query from '@arcgis/core/rest/support/Query';
import BufferParameters from '@arcgis/core/rest/support/BufferParameters';
import GeometryService from '@arcgis/core/tasks/GeometryService';
import IdentifyTask from '@arcgis/core/tasks/IdentifyTask';
import IdentifyParameters from '@arcgis/core/tasks/support/IdentifyParameters';
import './index.less';
import { waterConomy } from '@/config';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Legend from '@arcgis/core/widgets/Legend';
import useRequest from '@ahooksjs/use-request';
import service from '@/axios';
import Geometry from '@arcgis/core/geometry/Geometry';
import Symbol from '@arcgis/core/symbols/Symbol';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import {
  addPoint,
  addText,
  createHeat,
  queryByBufferData,
  queryByBufferDataAll,
  queryHeat,
  typeArr
} from './fun';
import { LeftSquareTwoTone } from '@ant-design/icons';
import { Button, message, Modal, Switch } from 'antd';
import BasicsPopup from '@/components/Basics/BasicsPopup';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { useLayerContext } from '@/store/layer';
import LayerControl from '@/components/Demon/LayerControl';
import WatchPoint from '@/components/Demon/WatchPoint';

let symbol: any = {
  type: 'picture-marker',
  url: pointImg,
  width: 36,
  height: 53
};

const mockPeople = [
  { type: '绿色太浦河', permanent: 195627, flow: 466908 },
  { type: '美丽元荡', permanent: 26549, flow: 84357 },
  { type: '水韵汾湖', permanent: 33863, flow: 167204 }
];

const removePopup = () => {
  let dom = document.getElementById('demon-coustom-popup-wrap');
  dom && dom.remove();
};
function Watereconomy() {
  //顶部分类
  const [topType, setTopType] = useState(typeArr[0]);
  const [view, setView] = useState<MapView>();
  //图层管理组
  const [graphicLayer] = useState<GraphicsLayer>(new GraphicsLayer());
  const [layerControl, setLayerControl] = useState(true);
  //缩放级别
  const [zoom, setZoom] = useState(0);
  //右侧分类
  const [pointType, setPointType] = useState<IDemonTypeList>();
  const [buffers, setBuffers] = useState<Graphic>();
  const { data } = useRequest(() => service.get(waterConomy.getFullScreen), {
    formatResult: (r) => r.data.data
  });

  //监测点位
  const [pointControl, setPointControl] = useState(true);

  //全景查看
  const [pointMarker] = useState(new GraphicsLayer({ id: 'pointMarker' }));

  const [otherPointMarker] = useState(new GraphicsLayer({ id: 'otherPointMarker' }));

  const [modalTitle, setModalTitle] = useState<any>();

  const [heatData, setHeatData] = useState<any[]>();

  const [echartsOptions, setEchartOptions] = useState<any[]>();
  const { dispatch: layerDispatch } = useLayerContext();
  useEffect(() => {
    layerDispatch({ type: 'setCurrentLayer', data: { currentLayer: '午夜蓝' } });
  }, []);
  useEffect(() => {
    if (view && topType) {
      removeHeatLayer();
      pointMarker.removeAll();
      graphicLayer.removeAll();

      const find = typeArr.find((f) => f.name === topType.name);

      if (find) {
        //查出每个湖对应的多边形
        let queryTask = new QueryTask({
          url: waterConomy.queryPolygon + find?.layerId
        });
        let query = new Query();
        query.returnGeometry = true;
        query.outFields = ['*'];
        query.where = '1=1'; // Return all cities with a population greater than 1 million

        queryTask
          .execute(query)
          .then(function (results) {
            var peakResults = results.features.map(async function (feature) {
              feature.symbol = {
                type: 'simple-fill', // autocasts as new SimpleFillSymbol()
                color: [0, 255, 255, 0.5],
                style: 'solid',
                outline: {
                  // autocasts as new SimpleLineSymbol()
                  color: [0, 255, 255, 1],
                  width: 3
                }
              } as any;
              //中心点添加图标
              let center = (feature as any).geometry.centroid;

              let graphic = new Graphic({
                geometry: center,
                symbol: symbol
              });
              view.goTo({ center, zoom: 5 });

              graphicLayer.addMany([feature, graphic]);

              return feature;
            });

            return results.features[0].geometry;
          })
          .then((res) => {
            //根据湖的多边形生成缓冲区范围
            let buffer = new BufferParameters({
              bufferSpatialReference: view.spatialReference,
              distances: [3000],
              geodesic: true,
              geometries: [res],
              outSpatialReference: view.spatialReference,
              unit: 'meters' //米
            });
            //利用服务生成缓冲区范围
            let geometry = new GeometryService({ url: waterConomy.bufferUrl });
            let bufferPolygon = geometry.buffer(buffer).then((resultBuffer) => {
              return resultBuffer;
            });
            return bufferPolygon;
          })
          .then((res) => {
            // Create a symbol for rendering the graphic
            const fillSymbol = {
              type: 'simple-fill', // autocasts as new SimpleFillSymbol()
              color: [227, 139, 79, 0.8],
              outline: {
                // autocasts as new SimpleLineSymbol()
                color: 'red',
                width: 1
              }
            };
            let polygon = new Graphic({
              geometry: res[0],
              symbol: fillSymbol,
              attributes: {
                type: topType
              }
            });
            setBuffers(polygon);
            // graphicLayer.addMany([polygon]);
            return polygon;
          })
          .then((polygon: any) => {
            return queryByBufferDataAll({ view, bufferGeometry: polygon.geometry }).then((res) => {
              return res;
            });
          })
          .then((res) => {
            let echart: any[] = [];
            if (res && res.length > 0) {
              res.forEach((item: any, index) => {
                let group: any = _.groupBy(item, 'layerName');
                for (const key in group) {
                  echart.push({
                    name: key,
                    value: group[key].length,
                    type: item[0]?.type ?? ''
                  });
                }
              });
              //把周边人口暂时替换为模拟数据，注释以下代码为真实数据
              const findMockData = mockPeople.find((item) => item.type === topType.name);
              _.remove(echart, (item) => item.name === '户籍人口');
              _.remove(echart, (item) => item.name === '流动人口');
              if (findMockData) {
                echart.push({ name: '户籍人口', value: findMockData.flow, type: '周边人口' });
                echart.push({ name: '流动人口', value: findMockData.permanent, type: '周边人口' });
              }

              setEchartOptions(echart);
              res.flat().forEach((item: any) => {
                item.category = topType;
              });
              setHeatData(res.flat());
            }
          });
      }
      view.map.add(graphicLayer, 1);

      view.watch('scale', function (newValue, oldValue, propertyName, target: any) {
        setZoom(parseInt(target.zoom));
      });
    }
  }, [view, topType]);
  useEffect(() => {
    if (zoom && view) {
      const heatLayer = view.map.findLayerById('heatmaplayer');

      if (zoom >= 6) {
        if (heatLayer) heatLayer.visible = false;
        otherPointMarker.visible = true;
      } else {
        removePopup();
        if (heatLayer) heatLayer.visible = true;
        otherPointMarker.visible = false;
      }
    }
  }, [zoom]);
  const renderPosition = (mapPoint: Point, data: any[], dom: HTMLElement) => {
    if (!view) return false;
    let screetPoint = view.toScreen(mapPoint);

    dom.style.left = screetPoint.x + 'px';
    dom.style.top = screetPoint.y + 'px';
    ReactDOM.render(<BasicsPopup data={data} />, dom);
  };
  const showHeat = useMemo(() => {
    if (zoom >= 6) {
      return false;
    } else {
      return true;
    }
  }, [zoom]);
  const removeHeatLayer = () => {
    if (!view) return false;
    let heatMapLayer = view.map.findLayerById('heatmaplayer');
    if (heatMapLayer) view.map.remove(heatMapLayer);
  };
  useEffect(() => {
    removeHeatLayer();
    pointMarker.removeAll();
    otherPointMarker.removeAll();
    removePopup();
  }, [topType]);
  useEffect(() => {
    removeHeatLayer();
    pointMarker.removeAll();
    otherPointMarker.removeAll();
    removePopup();
    if (view && buffers && pointType) {
      if (pointType.name === '全景查看' && data) {
        let graphicArr = data.map((item: any) => {
          item.type = pointType.name;
          return addPoint(view, item, pointType.pointImg);
        });
        let graphicTextArr = data.map((item: any) => {
          item.type = pointType.name;
          return addText(view, item, pointType.pointImg);
        });
        pointMarker.addMany(graphicArr);
        pointMarker.addMany(graphicTextArr);
        view.map.add(pointMarker, 10);
      } else {
        if (pointType.name == '水利工程') {
        } else {
          if (!heatData) return;
          let filter = heatData.filter((f) => f.type === pointType.name);
          filter && createHeat(view, filter);
          let graphicArr = filter.map((item: any) => {
            item.type = pointType.name;
            const feature = item.feature;
            const symbols = {
              type: 'picture-marker',
              url: pointType.pointImg,
              width: 26,
              height: 26
            };
            feature.symbol = symbols;
            return feature;
          });
          otherPointMarker.addMany(graphicArr);
          otherPointMarker.visible = !showHeat;
          view.map.add(otherPointMarker, 10);
        }
      }
    }
  }, [pointType, topType, buffers, heatData]);
  useEffect(() => {
    if (view && pointType) {
      view.on('click', (event) => {
        const { mapPoint } = event;
        view.hitTest(event).then((response: any) => {
          const results = response.results;
          let dom = document.getElementById('demon-coustom-popup-wrap');
          if (!dom) {
            dom = document.createElement('div');
            dom.id = 'demon-coustom-popup-wrap';
            view.container.appendChild(dom);
          }
          if (results.length <= 0) {
          } else {
            let result = results[0];
            const attr = result.graphic.attributes;
            if (attr.type === '全景查看') {
              setModalTitle(attr);
            } else {
              setModalTitle('');
              if (attr.type === '周边企业' || attr.type === '周边产业') {
                const data = results.map((item: any) => {
                  let attributes = item.graphic.attributes;
                  attributes.layerName = attr.type;
                  return attributes;
                });
                data.forEach((item: any) => {
                  delete item['企业类型'];
                  delete item['经度'];
                  delete item['纬度'];
                  delete item['唯一标识'];
                  delete item['行业分类代码'];
                });
                renderPosition(mapPoint, data, dom);

                view.watch('extent', () => {
                  dom && renderPosition(mapPoint, data, dom);
                });
              }
            }
          }
        });
      });
    }
  }, [pointType, view]);
  const fullScreen = (url: string) => {
    window.open(url, '_blank');
  };
  const layerChange = (checked: boolean) => {
    setLayerControl(checked);
  };
  const pointChange = (checked: boolean) => {
    setPointControl(checked);
  };
  useEffect(() => {
    if (layerControl) {
      graphicLayer.visible = true;
    } else {
      graphicLayer.visible = false;
    }
  }, [layerControl]);
  return (
    <div className="conomy-wrap ">
      {pointType && pointType.name === '水利工程' && <LayerControl />}
      <div className="comomy-type-wrap">
        {typeArr.map((item, index) => {
          return (
            <li
              key={index}
              className={[item.name === topType.name ? 'select' : ''].join(' ')}
              onClick={() => setTopType(item)}
            >
              {item.name}
            </li>
          );
        })}
      </div>
      <MapBox getView={setView} />
      <ConomyLeft pointType={pointType?.name} setPointType={setPointType} selectType={topType} />
      <ConomyRight echartData={echartsOptions} />
      {view && <LayerToggle view={view} />}
      {modalTitle && (
        <Modal
          className="businesspopup  demon-modal"
          title={modalTitle.cjmc}
          footer={null}
          visible={modalTitle ? true : false}
          width="80%"
          onCancel={() => setModalTitle('')}
        >
          {modalTitle && <iframe src={modalTitle.address}></iframe>}
          <Button className="demon-modal-fullScreen" onClick={() => fullScreen(modalTitle.address)}>
            全屏
          </Button>
        </Modal>
      )}
      <div className="layer-control">
        <Switch
          checkedChildren="图层开启"
          unCheckedChildren="图层关闭"
          checked={layerControl}
          onChange={layerChange}
        />
        <Switch
          className="point-switch"
          checkedChildren="监测点位开启"
          unCheckedChildren="监测点位关闭"
          checked={pointControl}
          onChange={pointChange}
        />
      </div>
      {view && <WatchPoint view={view} check={pointControl} />}
    </div>
  );
}
export default Watereconomy;
