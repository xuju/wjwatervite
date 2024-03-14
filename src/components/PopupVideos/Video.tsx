import { PlayVideo } from '@/utils/playVideo';
import React, { useEffect, useRef, useState } from 'react';
import './index.less';
interface Props {
  id: string;
}

export default function Video(props: Props) {
  const videoRef = useRef<PlayVideo>(new PlayVideo());

  const { id } = props;
  // useEffect(() => {
  //   if (id) {
  //     if (!videoRef.current.oWebControl) {
  //       videoRef.current.initPlugin().then((res) => {
  //         videoRef.current.init(id);
  //         videoRef.current.look(id);
  //       });
  //     }
  //   }
  // }, [id]);
  useEffect(() => {
    if (id) {
      videoRef.current.initPlugin().then((res) => {
        videoRef.current.init(id);
      });
    }
  }, [id]);
  useEffect(() => {
    return () => {
      videoRef.current.destory();
    };
  }, []);
  return <div id="playWnd" className="playWnd" />;
}
