import YWZTMap from '@/components/YWZTMap';
import YWZTScene from '@/components/YWZTScene';
import { mapTypeAtom } from '@/store/scene';
import React, { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

export default function Business() {
  const mapType = useRecoilValue(mapTypeAtom);
  const setMapType = useSetRecoilState(mapTypeAtom);
  useEffect(() => {
    return () => {
      setMapType({ type: '2D' });
    };
  }, []);
  if (mapType.type === '2D') {
    return <YWZTMap />;
  }
  if (mapType.type === '3D') {
    return <YWZTScene />;
  }

  return <div></div>;
}
