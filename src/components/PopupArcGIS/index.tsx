import React from 'react';
import './index.less';

interface PopupBoxType {
    data: any
}
export default function PopupArcGIS(props: PopupBoxType) {
    const { data } = props;


    return (
        <div className='popup-box'>
            <div className="title">testPopupArcGIS</div>
            <div className="popup-box-content global-scroll">
                {
                    Object.keys(data.colums).map((keys: string) => {
                        return (
                            <div className="popup-item" key={keys}>
                                <span className='name'>{data.colums[keys]}：</span>
                                <span className='value'>{data.data[keys]}</span>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
