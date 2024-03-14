import React, { MouseEventHandler, useContext, useEffect, useRef, useState } from 'react';
import './index.less';
import toolImg from './images/toolbar-folder.png';
import { createFromIconfontCN } from '@ant-design/icons';
import MapView from '@arcgis/core/views/MapView';
import Zoom from '@arcgis/core/widgets/Zoom';
import Measurement from '@arcgis/core/widgets/Measurement';
import LayerControl from '../LayerControl';
import xzqhImg from './images/xzqh.png';
import TileLayer from '@arcgis/core/layers/TileLayer';
import { wjqzhqu } from '@/config';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import _ from 'lodash';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { Button, Form, FormInstance, Input, Modal, Table } from 'antd';
import ModalMarker from './ModalMarker';
import markerImg from './images/地图定位.png';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import { useSetRecoilState } from 'recoil';
import { mapTypeAtom } from '@/store/scene';
import SceneView from '@arcgis/core/views/SceneView';
declare const ActiveXObject: any;
export const IconFont = createFromIconfontCN({
  scriptUrl: [
    '//at.alicdn.com/t/font_2716076_qi34jvmdmv.js' // icon-javascript, icon-java, icon-shoppingcart (overrided)
  ]
});
const symbol = new PictureMarkerSymbol({
  url: markerImg,
  width: 32,
  height: 32
});

export function fullScreen() {
  var el: any = document.documentElement;
  var rfs =
    el.requestFullScreen ||
    el.webkitRequestFullScreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullScreen;

  if (rfs) {
    rfs.call(el);
  } else if (typeof (window as any).ActiveXObject !== 'undefined') {
    var wscript = new ActiveXObject('WScript.Shell');
    if (wscript != null) {
      wscript.SendKeys('{F11}');
    }
  }
}
//退出全屏
export function exitScreen() {
  var el: any = document;
  var cfs =
    el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullScreen;

  if (cfs) {
    cfs.call(el);
  } else if (typeof (window as any).ActiveXObject !== 'undefined') {
    var wscript = new ActiveXObject('WScript.Shell');
    if (wscript != null) {
      wscript.SendKeys('{F11}');
    }
  }
}

interface ToolsProps {
  view: MapView | SceneView;
  type: string[];
  clickCallback: Function;
}

const clickHandle = (view: MapView) => {
  const zoom = new Zoom({ view });
  return {
    zoomin: () => {
      zoom.zoomIn();
    },
    zoomout: () => {
      zoom.zoomOut();
    }
    // ceju: (measurement: Measurement) => {
    //   measurement.activeTool = 'distance';
    // },
    // cemian: (measurement: Measurement) => {
    //   measurement.activeTool = 'area';
    // },
    // delete: (measurement: Measurement) => {
    //   measurement.clear();
    // }
  };
};

export default function Tools(props: ToolsProps) {
  const { view, clickCallback, type } = props;
  const [distanceList, setDistabceList] = useState<Measurement[]>([]);
  const [arcgismeasure, setarcgismeasure] = useState<Measurement>();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [visible, setVisible] = useState(true);
  const setMapType = useSetRecoilState(mapTypeAtom);
  const handleRef = useRef<IHandle>();
  const modalRef = useRef<any>();
  const markerGroup = useRef(new GraphicsLayer());
  useEffect(() => {
    if (view) {
      const measurement = new Measurement({ view });
      setarcgismeasure(measurement);
      view.map.add(markerGroup.current);
    }
  }, [view]);
  useEffect(() => {
    if (view) {
      if (type.includes('xzqh')) {
        const layer = new MapImageLayer({
          url: wjqzhqu,
          id: 'wjqzhqu',
          title: '吴江区行政区划'
        });

        view.map.add(layer);
      } else {
        const find = view.map.findLayerById('wjqzhqu');
        if (find) {
          view.map.remove(find);
        }
      }
    }
  }, [view, type]);

  const barClick = (clickType: string) => {
    //删除河道高亮
    let findHight = view.map.findLayerById('hightLayer') as GraphicsLayer;
    if (findHight) {
      findHight.removeAll();
    }

    _.remove(type, (f) => f === 'zoomout');
    _.remove(type, (f) => f === 'zoomin');
    _.remove(type, (f) => f === 'addMarker');
    if (type.includes(clickType)) {
      _.remove(type, (f) => f === clickType);
    } else {
      type.push(clickType);
    }

    clickCallback([...type]);

    const clickList: any = clickHandle(view);
    if (type.includes('position')) {
      document.body.style.cursor = 'crosshair';
      handleRef.current = view.on('immediate-click', (event) => {
        markerGroup.current.removeAll();

        const point = new Point({
          x: event.mapPoint.x,
          y: event.mapPoint.y
        });
        const graphic = new Graphic({
          symbol,
          geometry: point
        });
        markerGroup.current.add(graphic);
        Modal.info({
          title: '经纬度',
          content: (
            <div>
              <p>经度：{event.mapPoint.x.toFixed(6)}</p>
              <p>纬度：{event.mapPoint.y.toFixed(6)}</p>
            </div>
          )
        });
      });

      return;
    } else {
      handleRef && handleRef.current?.remove();
      document.body.style.cursor = 'auto';
      markerGroup.current.removeAll();
    }
    if (
      clickType &&
      clickType != 'fullscreen' &&
      clickType != 'onemap' &&
      clickType != 'yx' &&
      clickType != 'xzqh'
    ) {
      let handle = clickList[clickType];
      handle && handle(arcgismeasure);
    } else if (clickType === 'fullscreen') {
      setIsFullScreen(!isFullScreen);
      if (!isFullScreen) {
        fullScreen();
      } else {
        exitScreen();
      }
    }
  };

  const onClick = () => {
    // setVisible(!visible);
    setMapType({ type: '3D' });
  };

  const distanceHandle = () => {
    if (!type.includes('ceju')) {
      type.push('ceju');
    }
    const measurement = new Measurement({
      view: view,
      activeTool: 'distance'
    });
    let tem = [...distanceList];
    tem.push(measurement);
    setDistabceList(tem);
  };
  const areaHandle = () => {
    if (!type.includes('cemian')) {
      type.push('cemian');
    }
    const measurement = new Measurement({
      view: view,
      activeTool: 'area'
    });
    let tem = [...distanceList];
    tem.push(measurement);
    setDistabceList(tem);
  };
  const deleteHandle = () => {
    _.remove(type, (f) => f === 'ceju');
    _.remove(type, (f) => f === 'cemian');
    _.remove(type, (f) => f === 'position');
    _.remove(type, (f) => f === 'addMarker');
    distanceList.forEach((item) => {
      item.destroy();
    });
    modalRef.current && modalRef.current.setVisible(false);
    const markerGraphic = view.map.findLayerById('addClickMarker') as GraphicsLayer;
    if (markerGraphic) markerGraphic.removeAll();
    clickCallback([...type]);
  };
  const addMarker = () => {
    handleRef && handleRef.current?.remove();
    document.body.style.cursor = 'auto';
    _.remove(type, (f) => f === 'ceju');
    _.remove(type, (f) => f === 'cemian');
    _.remove(type, (f) => f === 'position');
    distanceList.forEach((item) => {
      item.destroy();
    });
    if (!type.includes('addMarker')) {
      type.push('addMarker');
      modalRef.current && modalRef.current.setVisible(true);
    } else {
      _.remove(type, (f) => f === 'addMarker');
      const markerGraphic = view.map.findLayerById('addClickMarker') as GraphicsLayer;
      if (markerGraphic) markerGraphic.removeAll();
    }

    clickCallback([...type]);
  };

  return (
    <>
      <div className="tool-wrap">
        <div className="img" onClick={onClick}>
          <img src={toolImg} alt="" />
        </div>
        {visible && (
          <div className="tools">
            <div className="tool-item-wrap">
              <div className="tools-one-map  tools-item" onClick={() => barClick('onemap')}>
                <IconFont style={{ fontSize: 20 }} type="icon-layers" />
                <span className={[type.includes('onemap') ? 'select' : ''].join(' ')}>一张图</span>
              </div>

              <div className="tools-one-map  tools-item" onClick={() => barClick('xzqh')}>
                <img src={xzqhImg} width={20} height={20} alt="" style={{ marginRight: '5px' }} />
                <span className={[type.includes('xzqh') ? 'select' : ''].join(' ')}>行政区划</span>
              </div>
              <div className="tools-one-map  tools-item" onClick={() => barClick('zoomin')}>
                <IconFont style={{ fontSize: 20 }} type="icon-Group-" />
                <span className={[type.includes('zoomin') ? 'select' : ''].join(' ')}>放大</span>
              </div>
              <div className="tools-one-map  tools-item" onClick={() => barClick('zoomout')}>
                <IconFont style={{ fontSize: 20 }} type="icon-suoxiao" />
                <span className={[type.includes('zoomout') ? 'select' : ''].join(' ')}>缩小</span>
              </div>

              <div className="tools-one-map  tools-item" onClick={distanceHandle}>
                <IconFont style={{ fontSize: 20 }} type="icon-ruler" />
                <span className={[type.includes('ceju') ? 'select' : ''].join(' ')}>测距</span>
              </div>

              <div className="tools-one-map  tools-item" onClick={() => areaHandle()}>
                <IconFont style={{ fontSize: 20 }} type="icon-ceju" />
                <span className={[type.includes('cemian') ? 'select' : ''].join(' ')}>测面</span>
              </div>
              <div className="tools-one-map  tools-item" onClick={() => addMarker()}>
                <IconFont style={{ fontSize: 20 }} type="icon-weizhi" />

                <span className={[type.includes('addMarker') ? 'select' : ''].join(' ')}>
                  地图打点
                </span>
              </div>
              <div className="tools-one-map  tools-item" onClick={() => deleteHandle()}>
                <IconFont style={{ fontSize: 20 }} type="icon-qingkong" />
                <span>清空</span>
              </div>
              <div className="tools-one-map  tools-item" onClick={() => barClick('yx')}>
                <IconFont style={{ fontSize: 20 }} type="icon-diqiu" />
                <span className={[type.includes('yx') ? 'select' : ''].join(' ')}>历年影像</span>
              </div>
              <div className="tools-one-map  tools-item" onClick={() => barClick('position')}>
                <IconFont style={{ fontSize: 20 }} type="icon-weizhi" />
                <span className={[type.includes('position') ? 'select' : ''].join(' ')}>
                  经纬度
                </span>
              </div>
              <div className="tools-one-map  tools-item" onClick={() => barClick('fullscreen')}>
                <IconFont style={{ fontSize: 20 }} type="icon-fullScreen" />
                <span className={[type.includes('fullscreen') ? 'select' : ''].join(' ')}>
                  全屏
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      <ModalMarker mref={modalRef} />
    </>
  );
}
