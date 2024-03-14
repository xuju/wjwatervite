import React from 'react';
import './index.less';
interface Props {
  name: string;
}
export default function FeatureMousePopup(props: Props) {
  const { name } = props;
  return <div className="FeatureMousePopup">{name}</div>;
}
