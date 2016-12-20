import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';

@observer
export class Profile extends React.Component {
    render() {
        return(
            <div className="row">
                <div className="col-md-2"></div>
                <div className="col-md-5"></div>
                <div className="col-md-5"></div>
            </div>
        )
    }
}
