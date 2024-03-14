import React from 'react';
import Geometry from '@arcgis/core/geometry/Geometry';
import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';
import IdentifyTask from '@arcgis/core/tasks/IdentifyTask';
import MapView from '@arcgis/core/views/MapView';
import Legend from '@arcgis/core/widgets/Legend';

import qjck from './images/全景图.png';
import qjck_select from './images/全景图2.png';
import zbqy from './images/qiyeguanli.png';
import zbqy_select from './images/qiyeguanli2.png';
import zbrk from './images/renshu.png';
import zbrk_select from './images/renshu2.png';
import zbcy from './images/hangye.png';
import zbcy_select from './images/hangye2.png';
import fullImg from './images/全景.png';
import zbqyImg from './images/企业.png';
import zbrkImg from './images/人口.png';
import zbcyImg from './images/产业.png';
import { waterConomy } from '@/config';

import mlydImg from './images/1.png';
import syfhImg from './images/2.png';
import lvtpImg from './images/3.png';
import slgc from './images/水利工程.png';
import slgc_select from './images/水利工程2.png';
export const addPoint = (view: MapView, item: any, img: string) => {
  const { x, y } = item;
  let point = new Point({ x: y, y: x });
  const symblo: any = {
    type: 'picture-marker',
    url: img,
    width: 22,
    height: 22
  };
  let graphic = new Graphic({
    geometry: point,
    symbol: symblo,
    attributes: item
  });

  return graphic;
};
export const addText = (view: MapView, item: any, img: string) => {
  const { x, y } = item;
  let point = new Point({ x: y, y: x });
  let textSymbol = {
    type: 'text',
    color: '#02ECE5',
    haloColor: '#333',
    haloSize: 2,

    borderLineColor: '#333',
    text: item.cjmc,
    font: {
      size: 10
    },
    yoffset: -25
  };
  let graphic = new Graphic({
    geometry: point,
    symbol: textSymbol,
    attributes: item
  });

  return graphic;
};

interface IQueryBuffer {
  view: MapView;
  options: IDemonTypeList;
  buffer: Geometry;
}
export const queryByBufferData = (params: IQueryBuffer) => {
  const { options, view, buffer } = params;

  const { layerIds } = options;
  //     //根据生成的缓冲区范围查询数据
  let identify = new IdentifyTask({ url: options.mapUrl });
  let identifyParams = new IdentifyParameters({
    geometry: buffer,
    height: view.height,
    width: view.width,
    mapExtent: view.extent,
    layerIds: layerIds,
    returnGeometry: true,
    tolerance: 6,
    layerOption: 'all'
  });

  return new Promise((resolve, reject) => {
    identify
      .execute(identifyParams)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};
interface IQueryBuffer1 {
  view: MapView;

  bufferGeometry: Geometry;
}

export const queryByBufferDataAll = (params: IQueryBuffer1) => {
  const { view, bufferGeometry } = params;

  let arr = typeList.filter((f) => f.name != '全景查看' && f.name != '水利工程');
  let promiseArr: Promise<unknown>[] = [];

  arr.forEach((item) => {
    let identify = new IdentifyTask({ url: item.mapUrl });
    let identifyParams = new IdentifyParameters({
      geometry: bufferGeometry,
      height: view.height,
      width: view.width,
      mapExtent: view.extent,
      layerIds: item.layerIds,
      returnGeometry: true,
      tolerance: 6,
      layerOption: 'all'
    });
    let promise = new Promise((resolve, reject) => {
      identify
        .execute(identifyParams)
        .then((res) => {
          res.results.forEach((r: any) => {
            r.feature.attributes.type = item.name;
            r.type = item.name;
          });
          resolve(res.results);
        })
        .catch((e) => {
          reject(e);
        });
    });
    promiseArr.push(promise);
  });
  return Promise.all(promiseArr);
};
export const typeArr = [
  {
    name: '美丽元荡',
    position: new Point({ x: 120.62586670283467, y: 31.023216567205274 }),
    layerId: 1,
    img: mlydImg,
    desc: `元荡又名鼋荡、阮荡，因荡面形状似鼋而得名。位于江苏省吴江区和上海市青浦区交界，原是淀山湖的一个湖湾，后因芦滩封淤而成为淀山湖的一个子湖。<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;元荡东西长6.04千米，南北平均宽2.15千米，湖泊总面积12.9平方千米，境内水面积9.93平方千米，周长17491米。元荡湖岸曲折多湾，湖盆高低不平，东浅西深。湖底平均高程0.25米，最低高程-10.49米。湖泊正常蓄水位2.86米，库容2592万立方米。
    元荡进出水口有东渚港、成大港、东二图港、修字圩西港、顾家全港、倪家路、吴家村港、陈家湾、八荡河、南尹港、湾里南港、城司西港、高和田港、白荡湾港、夹港里、吴江路、杨垛港、杨垛北港、沈家圩港、杨湾荡东港、小汶港、浪头港、金泽村港、杨舍港、天决口等25处，其中西侧的八荡河为主要进水河道，东北的天决口为下泄淀山湖的主要出水口。`
  },
  {
    name: '水韵汾湖',
    position: new Point({ x: 120.55931637910217, y: 31.019651371291033 }),
    layerId: 2,
    img: syfhImg,
    desc: `汾湖古名分湖（旧汾作分），春秋战国时期，吴、越国间以“巨浸”对峙，南半为嘉禾之境，北半为松陵之墟，寓分湖为界之意而得名。位于江苏省吴江区和浙江省嘉善县交界，水域面积涉及吴江区的芦墟、黎里两镇和嘉善县的陶庄镇。<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 汾湖总面积5.61平方千米，境内水面积3.15 平方千米，周长8544米。湖底平均高程0.25米，最低高程-3.86米。湖泊正常蓄水位2.9米，库容835万立方米。<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;汾湖水产丰富。“汾湖蟹”肉质细嫩、口味独特，尤以两只螯（俗称大钳）右大、左小出名。同时，汾湖亦是杭申乙线航道的一段。`
  },
  {
    name: '绿色太浦河',
    position: new Point({ x: 120.73311967992143, y: 31.024702065502876 }),
    layerId: 0,
    img: lvtpImg,
    desc: `太浦河西起江苏省吴江区横扇镇太湖边的时家港，基本循旧有水路，向东连通蚂蚊漾、雪落漾、桃花漾、北草荡、北琶荡、杨家荡、后长荡、大平荡、将军荡、木瓜漾、汾湖、东姑荡、韩郎荡、白洋湾、马斜湖、吴家漾、长白荡、白渔荡、钱盛荡、叶厍白荡等湖荡，至西泖河注入黄浦江，以其起迄点命名，跨江苏、浙江、上海两省一市，全长57.62千米，其中，流经江苏段40.75千米（南岸有两段约850米属于浙江省）均在吴江区境内。`
  }
];

export const typeList = [
  { name: '全景查看', icon: qjck, selectIcon: qjck_select, pointImg: fullImg },
  {
    name: '周边企业',
    icon: zbqy,
    selectIcon: zbqy_select,
    mapUrl: waterConomy.layerService.zbqy.url,
    layerIds: waterConomy.layerService.zbqy.layerIds,
    pointImg: zbqyImg
  },
  {
    name: '周边人口',
    icon: zbrk,
    selectIcon: zbrk_select,
    mapUrl: waterConomy.layerService.zbrk.url,
    layerIds: waterConomy.layerService.zbrk.layerIds,
    pointImg: zbrkImg
  },
  {
    name: '周边产业',
    icon: zbcy,
    selectIcon: zbcy_select,
    mapUrl: waterConomy.layerService.zbcy.url,
    layerIds: waterConomy.layerService.zbcy.layerIds,
    pointImg: zbcyImg
  },
  {
    name: '水利工程',
    icon: slgc,
    selectIcon: slgc_select
  }
];

const renderer = {
  type: 'heatmap',
  colorStops: [
    { color: 'rgba(000,000,255,0)', ratio: 0 },
    { color: 'rgb(000,000,255)', ratio: 0.45 },
    { color: 'rgb(000,255,255)', ratio: 0.55 },
    { color: 'rgb(000,255,000)', ratio: 0.65 },
    { color: 'rgb(255,255,000)', ratio: 0.95 },

    { color: 'rgb(255,000,000)', ratio: 1 }
  ],
  blurRadius: 10,
  maxPixelIntensity: 25,
  minPixelIntensity: 0
} as any;

export const createHeat = (view: MapView, res: any) => {
  let heatArr = res.map((m: any) => {
    let geometry = m.feature.geometry;
    let attributes = m.feature.attributes;

    return {
      geometry,
      attributes
    };
  });

  let layer = new FeatureLayer({
    source: heatArr,
    renderer: renderer,
    objectIdField: 'ObjectID',
    id: 'heatmaplayer'
  });

  view.map.add(layer);
  let legend = new Legend({
    view: view,
    container: document.createElement('div'),
    layerInfos: [
      {
        layer: layer,
        title: '热力图'
      } as any
    ]
  });
  view.ui.add(legend, 'bottom-left');

  return heatArr;
};

interface IQueryHeat {
  url: string;
  view: MapView;
  mapPoint: Point;
  layerIds: number[];
}
export const queryHeat = (options: IQueryHeat) => {
  const { url, mapPoint, view, layerIds } = options;

  let identifyTask = new IdentifyTask({ url: url });

  let params = new IdentifyParameters({
    geometry: mapPoint,
    layerIds: layerIds,
    height: view.height,
    width: view.height,
    mapExtent: view.extent,
    layerOption: 'all',
    returnGeometry: true,
    tolerance: 6
  });

  return new Promise((resolve, reject) => {
    identifyTask
      .execute(params)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};
