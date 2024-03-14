import React, { useReducer } from 'react';
import { StateProvider } from '.';
import { LayerProvider } from './layer';
import { LayerListProvider } from './LayerList';

const Providers = (props: { children: React.ReactChild }) => {
  return (
    <StateProvider>
      <LayerProvider>
        <LayerListProvider>{props.children}</LayerListProvider>
      </LayerProvider>
    </StateProvider>
  );
};

export default Providers;
