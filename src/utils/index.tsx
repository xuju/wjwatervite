import React, { useMemo } from 'react';
import { usePageContext } from '@/store';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import MapView from '@arcgis/core/views/MapView';
import { message } from 'antd';
import qs from 'qs';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import moment from 'moment';
import ReactDOM from 'react-dom';
import PopupsAttrs from '@/components/PopupsAttrs';
import IdentifyTask from '@arcgis/core/tasks/IdentifyTask';
import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';

import { useLayerContext } from '@/store/layer';
import _ from 'lodash';
import PopupWaterAttr from '@/components/PopupWaterAttr';
import FeatureMousePopup from '@/components/FeatureMousePopup';
import { backLogin, base, CODE_NAME, MAP_TOKNE, symbolObj } from '@/config';
import SceneView from '@arcgis/core/views/SceneView';
import service from '@/axios';
import BasicsPopup from '@/components/Basics/BasicsPopup';
import { resolve } from 'path';

export default function catchError(promise: Promise<any>) {
  return promise
    .then((data) => {
      return [null, data];
    })
    .catch((err) => {
      message.error('请求出错');
      return [err];
    });
}

// 公共hooks 获取对应的左侧图层列表
export const useSelectLayer = (props: { themeName: string }) => {
  const { themeName } = props;
  const [layers, setLayers] = useState<any[]>([]);
  const { state } = usePageContext();
  const layerArr = state.userInfo.menu;
  const history = useHistory();
  const selectLayer = layerArr?.find((item) => item.title === themeName).mapLayers;

  useEffect(() => {
    const search: any = history.location.search.replace('?', '');

    if (search && selectLayer) {
      const searchParams: any = qs.parse(search);
      if (searchParams.theme) {
        const layer = selectLayer.filter((item: { title: string }) =>
          item.title.includes(searchParams.theme)
        );
        if (!layer || layer.length <= 0) {
          setLayers(selectLayer);
        } else {
          setLayers(layer);
        }
      } else {
        setLayers(selectLayer);
      }
    } else {
      setLayers(selectLayer);
    }
  }, [history.location]);

  return layers;
};

export const levelWater = (num: number): string => {
  let type = '';
  if (num <= 0) {
    type = '无雨';
  } else if (num >= 0.1 && num <= 4.9) {
    type = '小雨';
  } else if (num >= 5 && num <= 14.9) {
    type = '中雨';
  } else if (num >= 15 && num <= 29.9) {
    type = '大雨';
  } else if (num >= 30 && num <= 69.9) {
    type = '暴雨';
  } else if (num >= 70 && num <= 139.9) {
    type = '大暴雨';
  } else if (num >= 140) {
    type = '特大暴雨';
  }
  return type;
};
const hiddenPopupZoom = 4;
//显示多个气泡
export const popupRender = (data: any[], view: MapView | SceneView) => {
  const fragemnet = document.createDocumentFragment();
  const computedPosition = (point: Point) => {
    const screenPoint = view.toScreen(point);
    return screenPoint;
  };

  const list: { point: Point; dom: HTMLDivElement }[] = [];
  if (data) {
    data.forEach((item) => {
      const { x, y } = item;
      const point = new Point({
        x: Number(x),
        y: Number(y),
        spatialReference: view.spatialReference
      });
      const screenPoint = computedPosition(point) as __esri.MapViewScreenPoint;
      let dom = document.createElement('div');
      dom.className = `popupRender-wrap  ${item.them}`;
      dom.style.left = `${screenPoint.x + 20}px`;
      dom.style.top = `${screenPoint.y - 20}px`;
      fragemnet.appendChild(dom);
      ReactDOM.render(<PopupsAttrs data={item} />, dom);
      list.push({
        dom,
        point
      });
    });
    view.container.appendChild(fragemnet);
  }
  const zooms = view.zoom;

  if (zooms < hiddenPopupZoom) {
    list.forEach((item) => (item.dom.style.display = 'none'));
  }
  view.watch('extent', () => {
    list.forEach((item) => {
      const { point, dom } = item;
      const screenPoint = computedPosition(point) as __esri.MapViewScreenPoint;
      dom.style.left = `${screenPoint.x + 20}px`;
      dom.style.top = `${screenPoint.y - 20}px`;
    });
  });
  view.watch('scale', (...rest) => {
    const zoom = parseInt(rest.pop().zoom);
    if (zoom <= hiddenPopupZoom) {
      list.forEach((item) => (item.dom.style.display = 'none'));
    } else {
      list.forEach((item) => (item.dom.style.display = 'block'));
    }
  });
};

//显示多个气泡
export const popupRenderOne = (data: any, view: MapView | SceneView) => {
  const zooms = view.zoom;

  const fragemnet = document.createDocumentFragment();
  const computedPosition = (point: Point) => {
    const screenPoint = view.toScreen(point);
    return screenPoint;
  };
  const list: { point: Point; dom: HTMLDivElement }[] = [];

  const { x, y } = data;
  const point = new Point({ x: Number(x), y: Number(y), spatialReference: view.spatialReference });
  const screenPoint = computedPosition(point) as __esri.MapViewScreenPoint;
  let dom = document.createElement('div');
  dom.className = `popupRender-wrap  ${data.them}`;

  dom.style.left = `${screenPoint.x + 20}px`;
  dom.style.top = `${screenPoint.y - 20}px`;

  fragemnet.appendChild(dom);
  ReactDOM.render(<PopupsAttrs data={data} />, dom);
  list.push({
    dom,
    point
  });

  view.container.appendChild(fragemnet);
  if (zooms < hiddenPopupZoom) {
    list.forEach((item) => (item.dom.style.display = 'none'));
  }
  view.watch('extent', () => {
    list.forEach((item) => {
      const { point, dom } = item;
      const screenPoint = computedPosition(point) as __esri.MapViewScreenPoint;
      dom.style.left = `${screenPoint.x + 20}px`;
      dom.style.top = `${screenPoint.y - 20}px`;
    });
  });
  view.watch('scale', (...rest) => {
    const zoom = Math.floor(view.zoom);

    if (zoom <= hiddenPopupZoom) {
      list.forEach((item) => (item.dom.style.display = 'none'));
    } else {
      list.forEach((item) => (item.dom.style.display = 'block'));
    }
  });
};

//泵站水闸小气泡框显示
export const bzAndsz = (data: any, view: MapView | SceneView) => {
  const type = view.type === '2d';
  const zooms = view.zoom;
  const hiddenPopupZoom = type ? 8 : 15;

  const fragemnet = document.createDocumentFragment();
  const computedPosition = (point: Point) => {
    const screenPoint = view.toScreen(point);
    return screenPoint;
  };
  const list: { point: Point; dom: HTMLDivElement }[] = [];

  const { x, y } = data;
  const point = new Point({ x: Number(x), y: Number(y), spatialReference: view.spatialReference });
  const screenPoint = computedPosition(point) as __esri.MapViewScreenPoint;
  let dom = document.createElement('div');
  dom.className = `popupRender-wrap  ${data.them}`;

  dom.style.left = `${screenPoint.x + 20}px`;
  dom.style.top = `${screenPoint.y - 20}px`;

  fragemnet.appendChild(dom);
  ReactDOM.render(<FeatureMousePopup name={data.name} />, dom);
  list.push({
    dom,
    point
  });

  view.container.appendChild(fragemnet);
  if (zooms < hiddenPopupZoom) {
    list.forEach((item) => (item.dom.style.display = 'none'));
  }
  view.watch('extent', () => {
    list.forEach((item) => {
      const { point, dom } = item;
      const screenPoint = computedPosition(point) as __esri.MapViewScreenPoint;
      dom.style.left = `${screenPoint.x + 20}px`;
      dom.style.top = `${screenPoint.y - 20}px`;
    });
  });
  view.watch('scale', (...rest) => {
    const zoom = Math.floor(view.zoom);

    if (zoom >= hiddenPopupZoom) {
      list.forEach((item) => (item.dom.style.display = 'block'));
    } else {
      list.forEach((item) => (item.dom.style.display = 'none'));
    }
  });
};
//水质在线监测显示多个气泡
export const popupWaterRender = (data: any[], view: MapView) => {
  const fragemnet = document.createDocumentFragment();
  let dom = document.getElementsByClassName('popupRender-wrap');
  let arr = Array.from(dom);
  arr.forEach((item) => item && item.remove());
  const computedPosition = (point: Point) => {
    const screenPoint = view.toScreen(point);
    return screenPoint;
  };

  const list: { point: Point; dom: HTMLDivElement }[] = [];
  if (data) {
    data.forEach((item) => {
      const { x, y } = item;
      const point = new Point({
        x: Number(x),
        y: Number(y),
        spatialReference: view.spatialReference
      });
      const screenPoint = computedPosition(point) as __esri.MapViewScreenPoint;
      let dom = document.createElement('div');
      dom.className = ` popupWaterRender  ${item.them}`;
      dom.style.left = `${screenPoint.x + 20}px`;
      dom.style.top = `${screenPoint.y - 20}px`;
      fragemnet.appendChild(dom);
      ReactDOM.render(<PopupWaterAttr data={item} />, dom);
      list.push({
        dom,
        point
      });
    });
    view.container.appendChild(fragemnet);
  }
  const zooms = view.zoom;

  if (zooms < hiddenPopupZoom) {
    list.forEach((item) => (item.dom.style.display = 'none'));
  }
  view.watch('extent', () => {
    list.forEach((item) => {
      const { point, dom } = item;
      const screenPoint = computedPosition(point) as __esri.MapViewScreenPoint;
      dom.style.left = `${screenPoint.x + 20}px`;
      dom.style.top = `${screenPoint.y - 20}px`;
    });
  });
  view.watch('scale', (...rest) => {
    const zoom = parseInt(rest.pop().zoom);

    if (zoom <= hiddenPopupZoom) {
      list.forEach((item) => (item.dom.style.display = 'none'));
    } else {
      list.forEach((item) => (item.dom.style.display = 'block'));
    }
  });
};
export const hightLayer = (
  view: MapView | SceneView,
  data: any,
  mapPoint: any,
  showPopup = true
) => {
  let symbol: any;
  let layers: GraphicsLayer;
  let find = view.map.findLayerById('hightLayer');
  if (find) {
    layers = find as any;
  } else {
    const layer = new GraphicsLayer({ id: 'hightLayer' });

    view.map.add(layer);
    layers = layer;
  }
  layers.removeAll();
  let attr: any[] = [];
  if (data) {
    const result = data[0].results;

    result.forEach((item: any) => {
      const { layerName, feature } = item;
      const type = feature.geometry.type;
      let attributes = feature.attributes;
      attributes.layerName = layerName;
      attributes.mapPoint = mapPoint;
      attr.push(attributes);
      let symbol = symbolObj[type];
      feature.symbol = symbol;
      layers.add(feature);
    });
  }

  //显示弹窗
  if (attr && attr.length > 0 && showPopup) {
    let dom = document.getElementById('basics-coustom-popup-wrap');
    if (!dom) {
      let div = document.createElement('div');
      div.id = 'basics-coustom-popup-wrap';
      view.container.appendChild(div);
      dom = div;
    }

    renderPosition(view, mapPoint, attr, dom);
    view.watch('extent', () => {
      dom && renderPosition(view, mapPoint, attr, dom);
    });
  } else {
    // message.warning('暂无数据');
  }
};
//业务专题列表点击高亮定位

export const tableClickQuery = async (view: MapView | SceneView, data: any) => {
  const { queryUrl, x, y } = data;

  const layerIds = data.layerIds.map((item: any) => item.id);

  const mapPoint = new Point({
    x: Number(x),
    y: Number(y),
    spatialReference: view.spatialReference
  });

  let identifyTask = new IdentifyTask({ url: queryUrl });
  let params = new IdentifyParameters();
  // 容差
  params.tolerance = 6;
  // 是否返回几何信息
  params.returnGeometry = true;
  // 空间查询的图层
  params.layerIds = layerIds;
  // 指定使用“标识”时要使用的图层。
  params.layerOption = 'all';
  params.geometry = mapPoint;
  params.width = view.width;
  params.height = view.height;
  params.mapExtent = view.extent;
  params.spatialReference = view.spatialReference;
  let result = await identifyTask.execute(params);

  const pointDom = document.getElementById('currPoint'); //删除动画点
  if (result) {
    locationGoto(view, mapPoint);
    if (pointDom) {
      pointDom.parentNode?.removeChild(document.getElementById('currPoint')!);
    }

    hightLayer(view, [result], mapPoint);
  }
};
export const returnClickQuery = async (view: MapView | SceneView, data: any) => {
  return new Promise(async (resolve, reject) => {
    const { queryUrl, x, y } = data;

    const layerIds = data.layerIds.map((item: any) => item.id);

    const mapPoint = new Point({
      x: Number(x),
      y: Number(y),
      spatialReference: view.spatialReference
    });

    let identifyTask = new IdentifyTask({ url: queryUrl });
    let params = new IdentifyParameters();
    // 容差
    params.tolerance = 6;
    // 是否返回几何信息
    params.returnGeometry = true;
    // 空间查询的图层
    params.layerIds = layerIds;
    // 指定使用“标识”时要使用的图层。
    params.layerOption = 'all';
    params.geometry = mapPoint;
    params.width = view.width;
    params.height = view.height;
    params.mapExtent = view.extent;
    params.spatialReference = view.spatialReference;
    let result = await identifyTask.execute(params);

    resolve(result);
    if (result) {
      hightLayer(view, [result], mapPoint, false);
    }
  });
};
export const isNull = (str: string) => {
  if (!str || str === 'Null' || str === 'null') {
    return '-';
  } else {
    return str;
  }
};
export const getCode = () => {
  const host = window.location.href;
  const url = new URL(host);

  let code = url.searchParams.get('code');

  return code;
};
export const loginOutFun = () => {
  localStorage.clear();
  if (window.isTest) {
    window.location.href = base + '/login';
  } else {
    window.location.href = backLogin;
  }
};
export const totlaChildren = (arr: any[], total = 0) => {
  if (arr && arr.length) {
    total += arr.length;
    arr.forEach((item) => {
      if (item.children) {
        total += item.children.length;
        totlaChildren(item.children, total);
      }
    });
    return total;
  } else {
    return 0;
  }
};

//平铺多维数组

export const steamroller = (arr: any[]): any[] => {
  const newArr: any[] = [];
  arr.forEach((element) => {
    newArr.push(element);
    if (element.children) {
      newArr.push.apply(newArr, steamroller(element.children));
    }
  });
  return newArr;
};

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
//获取元素距离顶部的位置
export const getDomOffset = {
  top: (node: any) => {
    let top = node.offsetTop;
    let parent = node.offsetParent;
    while (parent != null) {
      top += parent.offsetTop;
      parent = parent.offsetParent;
    }
    return top;
  },
  left: (node: any) => {
    let top = node.offsetLeft;
    let parent = node.offsetParent;
    while (parent != null) {
      top += parent.offsetLeft;
      parent = parent.offsetParent;
    }
    return top;
  }
};
export const getMapToken = () => {
  const tokenConfig = window.tokenConfig;
  const { url, username, password, yxq } = tokenConfig;
  const map_token = localStorage.getItem(MAP_TOKNE);

  return new Promise((resolve, reject) => {
    if (map_token) {
      const tokeninfo = JSON.parse(map_token);

      const current = moment(new Date());
      const timeout = moment(tokeninfo.timeout);
      const diff = timeout.diff(current, 'minutes');

      if (diff > 10) {
        resolve({
          code: 200,
          message: '',
          data: tokeninfo
        });
        return;
      } else {
        localStorage.removeItem(MAP_TOKNE);
      }
    }
    service.post(url, { yhm: username, mm: password, yxq }).then((res: any) => {
      const result = res.data;

      if (result.code === 200) {
        const tokeninfo = result.data;

        localStorage.setItem(MAP_TOKNE, JSON.stringify(tokeninfo));
        resolve({
          code: 200,
          message: result.message,
          data: result.data
        });
      } else {
        localStorage.removeItem(MAP_TOKNE);
        message.warning(result.message);
        reject({
          code: 300,
          message: result.message,
          data: null
        });
      }
    });
  });
};
export const renderPosition = (
  view: MapView | SceneView,
  mapPoint: Point,
  data: any[],
  dom: HTMLElement
) => {
  if (!view) return false;
  if (!mapPoint) return;

  let screetPoint = view.toScreen(mapPoint);

  const colse = () => {
    //删除河道高亮
    let findHight = view.map.findLayerById('hightLayer') as GraphicsLayer;
    if (findHight) {
      findHight.removeAll();
    }
  };
  dom.style.left = screetPoint.x + 'px';
  dom.style.top = screetPoint.y + 'px';
  // ReactDOM.render(<BasicsPopup data={data} colseCallback={colse} />, dom);
  ReactDOM.render(<BasicsPopup data={data} />, dom);
};
export const locationGoto = (view: MapView | SceneView, position: any) => {
  return new Promise((resolve, reject) => {
    const zoom = view.type === '2d' ? 6 : 20;
    view
      .goTo({ target: position, zoom })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
export const replactToken = (url: string) => {
  return new Promise(async (resolve, reject) => {
    if (url.includes('{token}')) {
      const tokenData = (await getMapToken()) as any;
      if (tokenData.code === 200) {
        const token = tokenData.data.token;
        url = url.replace('{token}', token);
        resolve(url);
      } else {
        localStorage.removeItem(MAP_TOKNE);
        const result = await replactToken(url);
        resolve(result);
        message.warning(tokenData.message ?? '开放平台token失败');
      }
    } else {
      resolve(url);
    }
  });
};
