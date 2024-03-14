import React from 'react'
import './index.less'
interface Props {
    text: string
}
export default function Title(props: Props) {
    return (
        <div className='title-wrap'>
            {props.text}
        </div>
    )
}
