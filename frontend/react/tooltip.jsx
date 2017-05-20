import * as React from 'react';
import {observer} from 'mobx-react';
import ReactTooltip from 'react-tooltip';


@observer
export class Tooltip extends React.Component {
    render() {
        return (
            <ReactTooltip place="bottom" type="dark" effect="solid"/>
        )
    }
}
