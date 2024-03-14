import { Empty } from 'antd'
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import React, { useEffect, useRef } from 'react';
import DomSize from '@/utils/domsize';
interface Props {
    options: EChartsOption;
    getEcharts?:Function;
}
export default function EchartsBox(props: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const {options,getEcharts}=props;
    useEffect(() => {
        const mychart = echarts.init(ref.current as HTMLDivElement);
        mychart.setOption(props.options)
        getEcharts&&getEcharts(mychart)
        
        const watchSize = () => { mychart.resize();}
        DomSize.bind(ref.current, watchSize);
        return () => {

          DomSize.remove(ref.current);
          mychart.dispose();
        }

    }, [options]);
    if (!options) {
        return <Empty />
    }
    return (
        <div ref={ref} style={{ width: '100%', height: '100%' }} ></div>
    )
}
