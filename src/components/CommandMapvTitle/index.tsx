import React from 'react'
import './index.less'
export default function CommandMapvTitle(props: { title: string }) {
    return (
        <div className='command-mapv-title'>
            {props.title}
        </div>
    )
}
