import { TOKEN_NAME } from '@/config';
import MapView from '@arcgis/core/views/MapView';
import SceneView from '@arcgis/core/views/SceneView';
import React, { createContext, useContext, useReducer } from 'react';

interface InitStateType {
  token: string;
  userInfo: Partial<MenuType>;
  pointData: any;
  layerList: ILayer[];
  view: MapView | null | SceneView;
  selectTabs: string;
}

const initState: InitStateType = {
  token: localStorage.getItem(TOKEN_NAME) ?? '',
  userInfo: {},
  pointData: {},
  layerList: [],
  view: null,
  selectTabs: 'hd' //存储实时水情右侧选择的tabs，防止切换另外的图层取消后，一直加载代表站点
};

interface ContextType {
  state: InitStateType;
  dispatch: React.Dispatch<{ type: string; data: Partial<InitStateType> }>;
}

let Contexts = createContext<ContextType>({ state: initState, dispatch: () => {} });

export const reducer = (
  state: InitStateType,
  action: { type: string; data: Partial<InitStateType> }
) => {
  switch (action.type) {
    case 'setToken':
      if (action.data.token) state.token = action.data.token;
      return { ...state };
    case 'setUserInfo':
      if (action.data.userInfo) state.userInfo = action.data.userInfo;
      return { ...state };
    case 'point':
      state.pointData = action.data;
      return { ...state };
    case 'setLayer':
      state.layerList = action.data.layerList as any;
      return state;
    case 'setView':
      state.view = action.data.view;

    case 'setTbas':
      if (action.data.selectTabs) {
        state.selectTabs = action.data.selectTabs;
      }

      return { ...state };
    default:
      return { ...state };
  }
};

const StateProvider = (props: { children: React.ReactChild }) => {
  const [state, dispatch] = useReducer(reducer, initState);
  return <Contexts.Provider value={{ state, dispatch }}>{props.children}</Contexts.Provider>;
};

export const usePageContext = () => {
  const context = useContext(Contexts);
  if (!context) {
    throw '只能在函数组件中使用';
  }
  return { ...context };
};

export { StateProvider };
