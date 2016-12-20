import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import ReactTooltip from 'react-tooltip';


@observer
export class Tooltip extends React.Component {
    render() {
        const {tooltipStore} = this.props;
        if(tooltipStore.tip) {
            return (
                <ReactTooltip data-for={tooltipStore.id} place="top" type="dark" effect="solid">
                    {tooltipStore.tip}
                </ReactTooltip>
            )
        }
        return null;
    }
}
