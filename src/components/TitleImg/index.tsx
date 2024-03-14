import React from 'react'
import './index.less'
interface Props {
    text: string
}
export default function TitleImg(props: Props) {
    return (
        <div className='basics-title'>
            <div className="basics-title-img">{props.text}</div>
        </div>
    )
}
