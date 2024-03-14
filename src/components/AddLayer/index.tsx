import { usePageContext } from '@/store';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import MapView from '@arcgis/core/views/MapView';
import SceneView from '@arcgis/core/views/SceneView';
import React, { useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import AnchorPonint from '../AnchorPonint';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import { useLayerContext } from '@/store/layer';
import { useLayerListContext } from '@/store/LayerList';
import { useRequest } from 'ahooks';
import service from '@/axios';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import IntegratedMeshLayer from '@arcgis/core/layers/IntegratedMeshLayer';
import {
  bzAndsz,
  getMapToken,
  levelWater,
  locationGoto,
  popupRenderOne,
  replactToken
} from '@/utils';
import ylImg0 from '@/assets/images/绿色.png';
import ylImg1 from '@/assets/images/蓝色.png';
import ylImg2 from '@/assets/images/黄色.png';
import ylImg3 from '@/assets/images/橙色.png';
import ylImg4 from '@/assets/images/红色.png';
import Graphic from '@arcgis/core/Graphic';
import { message } from 'antd';
interface Props {
  view: MapView | SceneView;
  allLayers?: any[];
}
export default function AddLayer(props: Props) {
  const { view, allLayers } = props;
  const ref = useRef<HTMLDivElement>(null);
  const { run } = useRequest((url, param) => service.post(url, param), { manual: true });
  const { state, dispatch } = usePageContext();
  const { state: layerData } = useLayerContext();
  const { state: layerListData, dispatch: layerListDispatch } = useLayerListContext();
  const watchHandle = useRef<IHandle | null>(null);
  const pointGroupLayer = useRef(
    new GroupLayer({
      id: 'pointGroup',
      visibilityMode: 'inherited',
      visible: true
    })
  );
  const lineGroupLayer = useRef(
    new GroupLayer({
      id: 'lineGroup',
      visibilityMode: 'inherited',
      visible: true
    })
  );
  const polyonGroupLayer = useRef(
    new GroupLayer({
      id: 'polyonGroup',
      visibilityMode: 'inherited',
      visible: true
    })
  );
  const selectedLayers = useMemo(() => {
    if (layerData && layerData.list) {
      return layerData.list;
    } else {
      return [];
    }
  }, [layerData]);
  useEffect(() => {
    if (view) {
      view.map.addMany(
        [pointGroupLayer.current, lineGroupLayer.current, polyonGroupLayer.current],
        100
      );
    }
  }, [view]);
  useEffect(() => {
    let { x, y } = state.pointData;

    if (x && y && view) {
      let currP = new Point({ x, y, spatialReference: new SpatialReference({ wkid: 4490 }) });
      let div = document.getElementById('currPoint');
      if (!div) {
        div = document.createElement('div');
        div.id = 'currPoint';
        div.style.position = 'absolute';
        div.style.pointerEvents = 'none';
        view.container.appendChild(div);
      }
      if (watchHandle.current) {
        watchHandle.current.remove();
        watchHandle.current = null;
      }
      watchHandle.current = view.watch('extent', function () {
        let screenPoint = view.toScreen(currP);
        if (div) {
          div.style.left = `${screenPoint.x - 28}px`;
          div.style.top = `${screenPoint.y - 28}px`;
          ReactDOM.render(<AnchorPonint />, div);
        } else {
          div!.style.left = `${screenPoint.x}px`;
          div!.style.top = `${screenPoint.y}px`;
        }
      });
      locationGoto(view, currP).then(() => {
        dispatch({ type: 'point', data: {} });
      });
    }
    return () => {};
  }, [state.pointData]);

  useEffect(() => {
    if (view) {
      const popupdom = document.getElementById('popupcom');
      popupdom && popupdom.remove();
      let pointGroup = pointGroupLayer.current;
      let lineGroup = lineGroupLayer.current;
      let polyonGroup = polyonGroupLayer.current;
      // 取消选中图层

      let unSelectedLayers =
        allLayers && selectedLayers && allLayers.filter((item) => selectedLayers.indexOf(item) < 0);

      unSelectedLayers &&
        unSelectedLayers.forEach((item: { id: string; layerzwmc: string }) => {
          if (pointGroup.findLayerById(item.id)) {
            pointGroup.remove(pointGroup.findLayerById(item.id));
          }
          if (lineGroup.findLayerById(item.id)) {
            lineGroup.remove(lineGroup.findLayerById(item.id));
          }
          if (polyonGroup.findLayerById(item.id)) {
            polyonGroup.remove(polyonGroup.findLayerById(item.id));
          }
        });
      // 选择图层
      if (selectedLayers) {
        if (!selectedLayers.length) {
          pointGroup.removeAll();
          lineGroup.removeAll();
          polyonGroup.removeAll();
        }
      }

      selectedLayers &&
        selectedLayers.forEach(
          async (item: {
            layertype: string;
            url: string;
            id: string;
            opconfig: string;
            layerid: string;
            icon: string;
            layerzwmc: string;
          }) => {
            if (item.layerzwmc === '水务基础设施空间布局规划') return; //选择子图层加载，而不是加载所有的图层)
            let opconfigJ = JSON.parse(item.opconfig);
            let lyr = null;
            let popupTemplate: any = null;

            if (item.layertype === 'MapServer') {
              lyr = new MapImageLayer({
                url: item.url,
                id: item.id,
                title: item.layerzwmc,
                sublayers: JSON.parse(item.layerid)
              });
            }
            if (item.layertype === 'Tile') {
              lyr = new TileLayer({
                url: item.url,
                id: item.id,
                title: item.layerzwmc,
                maxScale: 70.53107352157943
              });
            }
            if (item.layertype === 'Feature') {
              lyr = new FeatureLayer({
                url: `${item.url}/${item.layerid}`,
                id: item.id,
                title: item.layerzwmc,
                renderer: new SimpleRenderer({
                  symbol: new PictureMarkerSymbol({
                    url: item.icon.replace('.png', '_1.png'),
                    width: '20px',
                    height: '20px'
                  })
                })
              });
            }
            if (item.layertype === 'FeatureServer') {
              let url = item.url;
              if (!item.layerid) {
                message.warning('请配置图层id');
                return;
              }
              if (!url) {
                message.destroy();
                message.warning('请配置图层地址');
                return;
              }
              const layerid = JSON.parse(item.layerid);
              if (layerid.length) {
                const id = layerid[0].id;

                let turl = (await replactToken(url)) + '/' + id;
                lyr = new FeatureLayer({
                  url: turl.trim(),
                  id: item.id,
                  title: item.layerzwmc,
                  elevationInfo: {
                    mode: 'absolute-height',
                    offset: 10
                  },
                  outFields: ['*'],
                  renderer: {
                    type: 'simple',
                    symbol: {
                      type: 'polygon-3d',
                      symbolLayers: [
                        {
                          type: 'water',
                          waveDirection: 260,
                          color: '#25427c',
                          waveStrength: 'moderate',
                          waterbodySize: 'medium'
                        }
                      ]
                    }
                  }
                } as any);
              } else {
                message.warning('请图层id为空,请配置图层id');
              }
            }
            if (item.layertype === 'IntegratedMesh') {
              if (item.url) {
                let url = (await replactToken(item.url)) as string;
                const layer = new IntegratedMeshLayer({
                  url,
                  title: item.id,
                  id: item.id
                });
                lyr = layer;
              } else {
                message.destroy();
                message.warning('请配置图层地址');
              }
            }
            if (item.layertype === '3DObject') {
              if (item.url) {
                let url = (await replactToken(item.url)) as string;
                const layer = new SceneLayer({
                  url,
                  title: item.id,
                  id: item.id,
                  popupTemplate: null
                });
                lyr = layer;
              } else {
                message.destroy();
                message.warning('请配置图层地址');
              }
            }
            //不需要加载图层
            if (
              item.layertype === 'Api' &&
              item.layerzwmc !== '实时水情' &&
              item.layerzwmc !== '供水管网' &&
              item.layerzwmc != '提升泵站'
            ) {
              const params = { ...opconfigJ };
              delete params.modalVisible;
              // 业务类图层
              run(item.url, opconfigJ).then((res: any) => {
                let { data } = res;
                if (data && data.code === '200') {
                  let { listdata } = data.data;

                  if (layerListData.list.length > 0) {
                    const isFindLayerData = layerListData.list.find(
                      (f) => f.name === item.layerzwmc
                    );

                    if (!isFindLayerData) {
                      layerListDispatch({
                        type: 'setList',
                        data: {
                          name: item.layerzwmc,
                          list: data.data
                        }
                      });
                    }
                  } else {
                    layerListDispatch({
                      type: 'setList',
                      data: {
                        name: item.layerzwmc,
                        list: data.data
                      }
                    });
                  }

                  if (!pointGroup.findLayerById(item.id)) {
                    let lyrtmp = new GraphicsLayer({ id: item.id, title: item.layerzwmc });
                    let Iconurl = item.icon.replace('.png', '_1.png');

                    listdata.listdata.forEach((it: any) => {
                      let point = new Point({
                        x: it.x * 1,
                        y: it.y * 1,
                        spatialReference: new SpatialReference({ wkid: 4490 })
                      });

                      let attributes: any = {
                        OBJECTID: it.id,
                        url: item.url,
                        type: it.type,
                        name: it.name,
                        them: item.layerzwmc,
                        point: point,
                        iscjj: it.iscjj,
                        x: it.x * 1,
                        y: it.y * 1
                      };

                      if (item.layerzwmc === '实时雨量') {
                        const { drp } = it;
                        let iconName = levelWater(drp);

                        Iconurl = `${item.icon.substring(
                          0,
                          item.icon.lastIndexOf('/')
                        )}/${iconName}.png`;

                        attributes = {
                          ...it,
                          OBJECTID: it.stcd,
                          url: item.url,
                          type: it.drp,
                          name: it.stnm,
                          them: item.layerzwmc
                        };
                        if (attributes.systemid === 1) {
                          popupRenderOne(attributes, view);
                        }
                      }
                      if (item.layerzwmc === '易涝站点') {
                        attributes = { ...attributes, ...it };
                        if (attributes.status === '正常') {
                          Iconurl = ylImg0;
                        }
                        if (attributes.status === '蓝') {
                          Iconurl = ylImg1;
                        }
                        if (attributes.status === '黄') {
                          Iconurl = ylImg2;
                        }
                        if (attributes.status === '橙') {
                          Iconurl = ylImg3;
                        }
                        if (attributes.status === '红') {
                          Iconurl = ylImg4;
                        }

                        popupRenderOne(attributes, view);
                      }
                      if (
                        item.layerzwmc === '泵站' ||
                        item.layerzwmc === '水闸' ||
                        item.layerzwmc === '流量监测'
                      ) {
                        bzAndsz(attributes, view);
                      }
                      if (item.layerzwmc === '液位监测') {
                        const { iswarn, isoverwarn } = it;
                        if (isoverwarn) {
                          Iconurl = item.icon.replace(`${item.layerzwmc}`, `${item.layerzwmc}_2`);
                        } else if (iswarn) {
                          Iconurl = item.icon.replace(`${item.layerzwmc}`, `${item.layerzwmc}_3`);
                        } else {
                          Iconurl = item.icon.replace(`${item.layerzwmc}`, `${item.layerzwmc}_1`);
                        }
                      }
                      if (opconfigJ.modalVisible === true)
                        // 大弹窗
                        attributes = { ...attributes, modalVisible: true };

                      let symbol = new PictureMarkerSymbol({
                        url: Iconurl,
                        width: 18,
                        height: 18,
                        xoffset: 2,
                        yoffset: -2
                      });

                      let pointGraphic = new Graphic({
                        geometry: point,
                        symbol: symbol,
                        attributes: attributes,
                        popupTemplate: popupTemplate
                      });

                      lyrtmp.add(pointGraphic);
                    });

                    pointGroup.add(lyrtmp);
                  }
                } else {
                  message.error(data);
                }
              });
            }
            if (
              opconfigJ &&
              opconfigJ.lyrtype === 'esriGeometryPolygon' &&
              lyr &&
              !polyonGroup.findLayerById(item.id)
            ) {
              polyonGroup.add(lyr);
            }
            if (
              opconfigJ &&
              opconfigJ.lyrtype === 'esriGeometryPolyline' &&
              lyr &&
              !lineGroup.findLayerById(item.id)
            ) {
              lineGroup.add(lyr);
            }
            if (
              opconfigJ &&
              opconfigJ.lyrtype === 'esriGeometryPoint' &&
              lyr &&
              !pointGroup.findLayerById(item.id)
            ) {
              pointGroup.add(lyr);
            }
          }
        );
    }
  }, [selectedLayers]);
  return <div></div>;
}
