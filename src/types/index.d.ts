interface FloodResult {
  fr_content: string;
  fr_id: string;
  fr_process_content: string;
  fr_process_file: string;
  fr_process_person: string;
  fr_process_state: string;
  fr_process_time: string;
  fr_recoed_file: string;
  fr_record_person: string;
  fr_record_time: string;
}

interface CommandParans {
  id: string;
  name: string;
  righttype: number | string;
  rightid: string;
}

interface CommandType {
  name: string;
  type: number | string;
}
interface CommandPoint {
  id: string;
  lxr: string;
  name: string;
  phone: string;
  x: number;
  y: number;
  type: string;
  icon: string;
}

interface LayerType {
  cdid: string;
  childs: string;
  icon: string;
  id: string;
  ischecked: boolean;
  layerid: string;
  layertype: string;
  layerywmc: string;
  layerzwmc: string;
  opconfig: string;
  orders: string;
  pid: string;
  url: string;
  chirlds: LayerType[];
  title: string;
  link: string;
}

interface Window {
  isTest: boolean;
  returnCitySN: {
    cip: string;
    cid: string;
    cname: string;
  };
  tokenConfig: {
    url: string;
    username: string;
    password: string;
    yxq: number;
    layerList: ILayer[];
  };
}

interface PointAttr {
  OBJECTID: string;
  name: string;
  point: __esri.Point;
  them: string;
  type: string;
  url: string;
  stcd: string;
}
interface ModelAttrType {
  attr: PointAttr;
  type?: string;
}

interface IPorjtctFormType {
  adcd: number;
  address: string;
  construction_unit: string;
  content: string;
  create_tm: string;
  cur_level: string;
  design_unit: string;
  etm: string;
  fzr: string;
  fzrtel: string;
  isppp: number;
  lxr: string;
  lxrtel: string;
  name: string;
  nature: string;
  pscale: number;
  ptype: string;
  stm: string;
  supervise_unit: string;
  total_duration: number;
  x: number;
  y: number;
}

interface IDemonTypeList {
  name: string;
  icon: string;
  selectIcon: string;
  mapUrl?: string;
  layerIds: number[];
  pointImg: string;
}

interface ILayer {
  orderId: number;
  img: string;
  id: number;
  name: string;
  onlineurl: string;
  onlineurl2: string;
  testurl: string;
  title: string;
  year: string;
  url: string;
  show?: boolean;
}

interface LayerTime {
  id: number;
  name: string;
  onlineurl: string;
  onlineurl2: string;
  testurl: string;
  title: string;
  year: string;
}
interface IResult<T> {
  code: string;
  data: T;
  message: string;
}
interface IWatchPoint {
  id: string;
  name: string;
  x: string;
  y: string;
}
interface IWatchInfo {
  monitordate: string;
  ad: string;
  zl: string;
  gmsy: string;
}
