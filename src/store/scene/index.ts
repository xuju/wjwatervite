import SceneView from '@arcgis/core/views/SceneView';
import { atom } from 'recoil';

export const sceneAtom = atom<SceneView | null>({
  key: 'sceneAtom',
  default: null,
  dangerouslyAllowMutability: true
});
//底图数据
export const layerDataAtom = atom<ILayer[]>({
  key: 'layerDataAtom',
  default: []
});
export const mapTypeAtom = atom<{ type: '2D' | '3D' }>({
  key: 'Atom',
  default: {
    type: '2D'
  }
});
