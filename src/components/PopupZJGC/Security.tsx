import React from 'react'

export default function Security() {


    const list: any[] = [
        // { name: "今天天气不错" },
        // { name: "今天天气不错" },
        // { name: "今天天气不错" },
        // { name: "今天天气不错" },

        // { name: "今天天气不错" },
        // { name: "今天天气不错" },
        // { name: "今天天气不错" },
        // { name: "今天天气不错" },

    ]
    return (
        <div className='popup-zjgc-security  global-scroll'>
            <div className="popup-security-wrap">
                <div className="popup-security-header">
                    <div className="popup-security-header-item  index"> 序号</div>
                    <div className="popup-security-header-item  index1"> 隐患名称</div>
                    <div className="popup-security-header-item  index2"> 名称</div>
                    <div className="popup-security-header-item  index3"> 名称</div>
                </div>
                {list.length > 0 && list.map((item, index) => {
                    return (
                        <div className="popup-security-list">
                            <div className="popup-security-item">{index + 1}</div>
                            <div className="popup-security-item">{item.name}</div>
                            <div className="popup-security-item">{item.name}</div>
                            <div className="popup-security-item">{item.name}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
