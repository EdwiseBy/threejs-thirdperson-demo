//@ts-nocheck
import { observer } from "mobx-react";
import React, { Component, ReactNode } from "react";
import assetStore from "../../store/assetListStore";
import './loading.less';

@observer
class Loading extends Component {
    constructor() {
        super();
        this.state = {
        }
    }

    componentDidMount() {
    }




    render(): ReactNode {
        const { className = '', text, loading = true } = this.props;
        return (
            <div className={`${className} loading`}
                style={{
                    display: 'block',
                    position: 'absolute',
                    zIndex: 657,
                    backgroundColor: '#333334',
                    margin: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    opacity: loading ? '1' : '0',
                    pointerEvents: loading ? 'auto' : 'none'
                }}>
                <div className='loading-spinner' style={{
                    position: 'absolute',
                    display: 'inline-block',
                    left: 0
                }}>
                    <svg className="circular" viewBox="25 25 50 50">
                        <circle className="path" cx="50" cy="50" r="20" fill="none" />
                    </svg>
                    {
                        text && <p className="el-loading-text">{text}</p>
                    }
                </div>
            </div>
        );
    }
}

export default Loading;