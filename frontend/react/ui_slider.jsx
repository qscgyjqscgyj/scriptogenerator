import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import Slider from 'rc-slider';
import {observer} from 'mobx-react';

const Handle = Slider.Handle;
const wrapperStyle = {width: 400, margin: 50};


const handle = (props) => {
    const {value, dragging, index, ...restProps} = props;
    return (
        <Tooltip
            prefixCls="rc-slider-tooltip"
            overlay={value}
            visible={dragging}
            placement="top"
            key={index}
        >
            <Handle value={value} {...restProps} />
        </Tooltip>
    );
};

@observer
export class UISlider extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div style={wrapperStyle}>
                    <p>{this.props.title}</p>
                    <Slider
                        min={this.props.min} max={this.props.max}
                        value={this.props.value}
                        onAfterChange={this.props.onAfterChange.bind(this)}
                        onChange={this.props.onChange.bind(this)}
                        handle={handle}/>
                </div>
            </div>
        )
    }
}