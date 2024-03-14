import { getDomOffset } from '@/utils';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import React, { useEffect, useRef } from 'react';
import MapView from '@arcgis/core/views/MapView';
import './index.less';
interface LocationPoint {
  x: number;
  y: number;
}
interface Props {
  position: LocationPoint;
  view: MapView;
  children: JSX.Element;
  align?: 'center' | 'right' | 'left';

  style?: CSSPerspective;
}

export default function MarkerWrap(props: Props) {
  const { position, children, align = 'center', style = {}, view } = props;

  const markerRef = useRef<HTMLDivElement>(null);
  const watrchHandle = useRef<IHandle>();
  const pointToScreen = (location: LocationPoint) => {
    if (location && view) {
      const point = new Point({
        x: location.x,
        y: location.y,
        spatialReference: view.spatialReference
      });
      const screen = view.toScreen(point);
      if (!screen) return;

      const mapWrap = view.container;
      const top = getDomOffset.top(mapWrap);
      const left = getDomOffset.left(mapWrap);

      if (markerRef.current) {
        const { clientWidth, clientHeight } = markerRef.current;

        if (align === 'center') {
          markerRef.current.style.left = screen.x + left - clientWidth / 2 + 'px';
          markerRef.current.style.top = screen.y - clientHeight + top - 20 + 'px';
        }
        if (align === 'right') {
          markerRef.current.style.left = screen.x + 20 + 'px';
          markerRef.current.style.top = screen.y - clientHeight / 2 + top + 'px';
        }
      }
    }
  };
  useEffect(() => {
    if (markerRef && markerRef.current && view) {
      if (position) {
        pointToScreen(position);
        watrchHandle.current = view.watch('extent', () => {
          pointToScreen(position);
        });
      }
    }
  }, [view, markerRef, position]);
  useEffect(() => {
    return () => {
      if (watrchHandle.current) watrchHandle.current.remove();
    };
  }, []);

  return (
    position && (
      <div className="MarkerWrap" id="markerpopup" ref={markerRef} style={style}>
        {children}
      </div>
    )
  );
}
