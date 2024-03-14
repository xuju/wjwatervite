import React, { createContext, useContext, useReducer } from 'react';
interface initLayer {
  name: string;
  list: any[];
}

const initState = {
  list: []
};
interface ContextType {
  state: initLayer;
  dispatch: React.Dispatch<{ type: string; data: Partial<initLayer> }>;
}
let LayerListContexts = createContext<ContextType>({ state: initState as any, dispatch: () => {} });

export const layerListReducer = (
  state: initLayer,
  action: { type: string; data: Partial<initLayer> }
) => {
  switch (action.type) {
    case 'setList':
      if (action.data) {
        state.list.push(action.data);
      }

      return { ...state };

    default:
      return { ...state };
  }
};

const LayerListProvider = (props: { children: React.ReactChild }) => {
  const [state, dispatch] = useReducer(layerListReducer, initState as any);
  return (
    <LayerListContexts.Provider value={{ state, dispatch }}>
      {props.children}
    </LayerListContexts.Provider>
  );
};

export const useLayerListContext = () => {
  const context = useContext(LayerListContexts);
  if (!context) {
    throw '只能在函数组件中使用';
  }
  return { ...context };
};
export { LayerListProvider };
