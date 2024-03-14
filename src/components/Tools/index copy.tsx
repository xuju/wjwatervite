import React, { useEffect, useRef, useState } from 'react';
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
import { Modal } from 'antd';
declare const ActiveXObject: any;
const IconFont = createFromIconfontCN({
  scriptUrl: [
    '//at.alicdn.com/t/font_2716076_qi34jvmdmv.js' // icon-javascript, icon-java, icon-shoppingcart (overrided)
  ]
});
function fullScreen() {
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
function exitScreen() {
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
interface Porps {
  setSelect: Function;
}

interface ToolsProps {
  view: MapView;
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
    },
    ceju: (measurement: Measurement) => {
      measurement.activeTool = 'distance';
    },
    cemian: (measurement: Measurement) => {
      measurement.activeTool = 'area';
    },
    delete: (measurement: Measurement) => {
      measurement.clear();
    }
  };
};
export default function Tools(props: ToolsProps) {
  const { view, clickCallback, type } = props;

  const [arcgismeasure, setarcgismeasure] = useState<Measurement>();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [visible, setVisible] = useState(true);
  const handleRef = useRef<IHandle>();
  useEffect(() => {
    if (view) {
      const measurement = new Measurement({ view });
      setarcgismeasure(measurement);
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
    _.remove(type, (f) => f === 'ceju');
    _.remove(type, (f) => f === 'cemian');
    _.remove(type, (f) => f === 'zoomout');
    _.remove(type, (f) => f === 'zoomin');
    if (type.includes(clickType)) {
      _.remove(type, (f) => f === clickType);
    } else {
      type.push(clickType);
    }

    clickCallback([...type]);

    const clickList: any = clickHandle(view);
    if (type.includes('position')) {
      handleRef.current = view.on('immediate-click', (event) => {
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
    setVisible(!visible);
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
                {/* <IconFont style={{ fontSize: 20 }} type="icon-diqiu" /> */}
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
              <div className="tools-one-map  tools-item" onClick={() => barClick('ceju')}>
                <IconFont style={{ fontSize: 20 }} type="icon-ruler" />
                <span className={[type.includes('ceju') ? 'select' : ''].join(' ')}>测距</span>
              </div>
              <div className="tools-one-map  tools-item" onClick={() => barClick('cemian')}>
                <IconFont style={{ fontSize: 20 }} type="icon-ceju" />
                <span className={[type.includes('cemian') ? 'select' : ''].join(' ')}>测面</span>
              </div>
              <div className="tools-one-map  tools-item" onClick={() => barClick('delete')}>
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
    </>
  );
}
