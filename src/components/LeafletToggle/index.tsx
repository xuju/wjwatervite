import React, { useEffect, useMemo, useState } from 'react'
import './index.less'
import dzImg from './images/电子map.png'
import wylImg from './images/蓝map.png'
import yxImg from './images/影响map.png'
import { tiledMapLayer } from 'esri-leaflet'



const mapurl = [
    { name: '午夜蓝', img: wylImg },
    { name: '电子地图', img: dzImg },
    { name: '影像地图', img: yxImg },
]

interface Props {
    map: L.Map,
    LayerData?: ILayer[]
}
export default function LeafletToggle(props: Props) {
    const { map, LayerData } = props;
    const [selectLayer, setSelectLayer] = useState<Partial<ILayer>>();

    const layerArr = useMemo(() => {

        LayerData?.forEach(item => {
            if (item.title === '午夜蓝') {
                setSelectLayer(item)
            }
            const find = mapurl.find(f => f.name === item.title);
            if (!find) return;
            

            item.img = find.img;
        })


        return LayerData;
    }, [LayerData])

    const onclick = (index: number) => {
        let dom = document.getElementsByClassName("leaflet-layer-toggle")[0];
        let children = Array.from(dom.children);
        layerArr && setSelectLayer(layerArr[index])
        children.forEach((item) => {
            item.classList.remove("layer-0", "layer-1", "layer-2");
            if (index === 0) {
                document.getElementsByClassName("layer-item")[0].classList.add("layer-0");
                document.getElementsByClassName("layer-item")[1].classList.add("layer-1");
                document.getElementsByClassName("layer-item")[2].classList.add("layer-2");
            } else if (index === 1) {
                document.getElementsByClassName("layer-item")[0].classList.add("layer-1");
                document.getElementsByClassName("layer-item")[1].classList.add("layer-0");
                document.getElementsByClassName("layer-item")[2].classList.add("layer-2");
            } else if (index === 2) {
                document.getElementsByClassName("layer-item")[0].classList.add("layer-1");
                document.getElementsByClassName("layer-item")[1].classList.add("layer-2");
                document.getElementsByClassName("layer-item")[2].classList.add("layer-0");
            }
        });

    }
    useEffect(() => {
        if (selectLayer) {
            map.eachLayer((layer: any) => {
                if (layer.options.type === 'baseLayer') {
                    layer.remove();
                }

            })
            const url = (window as any).isTest ? selectLayer.testurl : selectLayer.onlineurl2;
            let layer = (tiledMapLayer as any)({
                url: url,
                id: selectLayer.title,
                type: 'baseLayer'
            })
            map.addLayer(layer)


        }
    }, [selectLayer]);
    

    return (
        <div className='leaflet-layer-toggle '>
            {layerArr && layerArr.map((item: any, index) => {
                return (
                    <div className={[`layer-item`, `layer-${index}`].join(' ')} key={index}
                        onClick={(e) => onclick(index)}
                        style={{ background: `url(${item.img})` }}
                    >
                        <span className='name'>{item.title}</span>
                    </div>
                );
            })}


        </div>
    )
}
