import React, { createContext, useContext, useReducer } from 'react';
interface initLayer {
  list: any[];
  params: {
    name: string;
    pageIndex: number;
    pageSize: number;
    bigtype: number;
    id: string;
  };
  current: any;
  currentLayer: string; //底图切换
}
const initParams = { name: '', pageIndex: 1, pageSize: 10, bigtype: 0, id: '' };
const initState: initLayer = {
  list: [],
  params: initParams,
  current: null,
  currentLayer: '午夜蓝'
};
interface ContextType {
  state: initLayer;
  dispatch: React.Dispatch<{ type: string; data: Partial<initLayer> }>;
}
let LayerContexts = createContext<ContextType>({ state: initState, dispatch: () => {} });

export const layerReducer = (
  state: initLayer,
  action: { type: string; data: Partial<initLayer> }
) => {
  switch (action.type) {
    case 'setList':
      if (action.data.list) state.list = action.data.list;
      return { ...state };
    case 'setParams':
      if (action.data.params) state.params = action.data.params;
      return { ...state };
    case 'setCurrent':
      state.current = action.data.current;
      return { ...state };
    case 'setCurrentLayer':
      state.currentLayer = action.data.currentLayer ?? '';
      return { ...state };
    case 'clearLayer':
      state.currentLayer = '';
      return { ...state };
    default:
      return { ...state };
  }
};

const LayerProvider = (props: { children: React.ReactChild }) => {
  const [state, dispatch] = useReducer(layerReducer, initState);
  return (
    <LayerContexts.Provider value={{ state, dispatch }}>{props.children}</LayerContexts.Provider>
  );
};

export const useLayerContext = () => {
  const context = useContext(LayerContexts);
  if (!context) {
    throw '只能在函数组件中使用';
  }
  return { ...context };
};
export { LayerProvider };
