import L from 'leaflet';
import React from 'react';
import { DataSet, utilCurve, leafletMapLayer } from 'mapv';
import { threadId } from 'worker_threads';
import ReactDOM from 'react-dom';
import CommandMapvTitle from '@/components/CommandMapvTitle';
export const legendList = [
  {
    title: '抢险物资',
    color: '#00F0FF',
    type: 'jywz',
    hidden:false,
  },
  { title: '筑坝情况', type: 'zhuba', color: '#dbc445' },
  {
    title: '城市泵站',
    color: '#8024E7',
    type: 'zhuba',
    hidden:false,
  },
  {
    title: '抢险队伍',
    color: '#42991F',
    type: 'jydw',
    hidden:false,
  },
  {
    title: '危化品企业',
    color: '#0B66C2',
    type: 'whpqy',
    hidden:true,
  },

  // { title: '洪涝风险', type: 'honglao', color: '#d72626' },
  // { title: '区县级救援队伍', type: 'qxjjydw', color: '#e77b24' }
];
interface CreateMapvOptions {
  map: L.Map;

  centerPoint: L.LatLng;
  clickCallback?: Function;
}
export class CreateMapv {
  map: L.Map;

  centerPoint: L.LatLng;
  mapvLayer: L.FeatureGroup;
  radiusMarker!: L.Marker;
  clickCallback: Function | null;
  constructor(options: CreateMapvOptions) {
    this.map = options.map;
    this.mapvLayer = L.featureGroup();
    this.centerPoint = options.centerPoint;
    this.clickCallback = options.clickCallback ?? null;
  }
  init(data: any[]) {
    this.removeLayer();

    for (let key in data) {
      let color = legendList.find((f) => f.type === key)?.color;

      color && this.createLine(data[key], color);
    }
    // data.forEach(item => {
    //     this.createLine(item.data, item.color)
    // })
  }
  createLine(data: any[], color: string) {
    let qianxi = new DataSet(data);
    let qianxiData = qianxi.get();

    let lineData: any[] = []; //线图层
    let timeData: any[] = []; //动画图层
    let pointData: any[] = []; //点图层

    qianxiData.forEach((item: { x: number; y: number; type: string }) => {
      if (!item.x || !item.y) return;
      let fromCenter = { lng: item.x, lat: item.y };
      let toCenter = this.centerPoint;
      if (!fromCenter || !toCenter) {
        return;
      }
      let curve = utilCurve.getPoints([fromCenter, toCenter]);
      const color = legendList.find((f) => f.type === item.type)?.color;
      for (let j = 0; j < curve.length; j++) {
        timeData.push({
          geometry: {
            type: 'Point',
            coordinates: curve[j]
          },
          count: 1,
          time: j
        });
      }

      lineData.push({
        geometry: {
          type: 'LineString',
          coordinates: curve
        }
      });
      pointData.push({
        geometry: {
          type: 'Point',
          coordinates: [fromCenter.lng, fromCenter.lat]
        },
        data: item
      });
      pointData.push({
        geometry: {
          type: 'Point',
          coordinates: [toCenter.lng, toCenter.lat]
        },
        text: item
      });
    });
    let lineDataSet = new DataSet(lineData);
    let lineOptions = {
      strokeStyle: color,
      shadowColor: color,
      shadowBlur: 20,
      lineWidth: 2,
      zIndex: 100,
      draw: 'simple',
      type: 'mapv'
    };
    let lineLayer = leafletMapLayer(lineDataSet, lineOptions);
    let pointOptions = {
      fillStyle: 'rgba(254,175,3,0.7)',
      shadowColor: 'rgba(55, 50, 250, 0.5)',
      shadowBlur: 10,
      size: 5,
      zIndex: 10,
      draw: 'simple',
      type: 'mapv',
      methods: {
        click: this.clickCallback
      }
    };

    let pointDataSet = new DataSet(pointData);
    let pointLayer = leafletMapLayer(pointDataSet, pointOptions);
    let timeDataSet = new DataSet(timeData);
    let timeOptions = {
      fillStyle: 'rgba(255, 250, 250, 0.5)',
      zIndex: 200,
      size: 2.5,
      animation: {
        type: 'time',
        stepsRange: {
          start: 0,
          end: 50
        },
        trails: 10,
        duration: 2
      },
      draw: 'simple',
      type: 'mapv'
    };

    let timeLayer = leafletMapLayer(timeDataSet, timeOptions);

    this.mapvLayer.addLayer(lineLayer);
    this.mapvLayer.addLayer(pointLayer);
    this.mapvLayer.addLayer(timeLayer);
    this.mapvLayer.addTo(this.map);
  }
  removeLayer() {
    this.map.eachLayer((layer: any) => {
      if (layer.mapVOptions && layer.mapVOptions.type === 'mapv') {
        layer.remove();
      }
    });
  }
  showRadius(position: L.LatLng, r: string) {
    this.removeRadius();
    let div = document.createElement('div');
    div.className = 'radius-wrap-text';
    div.innerHTML = r;
    let divIcon = L.divIcon({
      html: div,
      className: 'radius-wrap',
      iconSize: [200, 30],
      iconAnchor: [0, 40]
    });

    this.radiusMarker = (L as any)
      .marker(position, { icon: divIcon, type: 'mapv' })
      .addTo(this.map);
  }
  removeRadius() {
    this.map.eachLayer((layer: any) => {
      if (layer.options && layer.options.type === 'mapv') {
        layer.remove();
      }
    });
  }
}

export class CreateBufferTip {
  map: L.Map;
  div: HTMLDivElement;
  divIcon: L.DivIcon;
  marker!: L.Marker<any>;

  constructor(map: L.Map) {
    this.map = map;
    this.div = document.createElement('div');
    this.divIcon = L.divIcon({
      html: this.div,
      className: 'mapv-center-title',
      iconSize: [200, 30],
      iconAnchor: [100, 80]
    });
  }
  showAt(position: L.LatLng, title: string) {
    if (this.marker) this.marker.remove();
    ReactDOM.render(<CommandMapvTitle title={title} />, this.div);
    this.marker = L.marker(position, { icon: this.divIcon });
    this.marker.addTo(this.map);
  }
  remove() {
    this.marker && this.marker.remove();
  }
}

export class Popups {
  map: L.Map;
  div: HTMLDivElement;
  divIcon: L.DivIcon;
  marker!: L.Marker<any>;

  constructor(map: L.Map) {
    this.map = map;
    this.div = document.createElement('div');
    this.divIcon = L.divIcon({
      html: this.div,
      className: 'mapv-center-title',
      iconSize: [200, 30],
      iconAnchor: [100, 80]
    });
  }
  showAt(position: L.LatLng, title: string) {
    if (this.marker) this.marker.remove();
    ReactDOM.render(<CommandMapvTitle title={title} />, this.div);
    this.marker = L.marker(position, { icon: this.divIcon });
    this.marker.addTo(this.map);
  }
  remove() {
    this.marker && this.marker.remove();
  }
}
