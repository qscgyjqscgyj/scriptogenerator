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
                <Packages/>
                <Accesses/>
            </div>
        )
    }
}

@observer
export class Packages extends React.Component {
    render() {
        return(
            <div className="col-md-12">

            </div>
        )
    }
}

@observer
export class Accesses extends React.Component {
    render() {
        return(
            <div className="col-md-12">

            </div>
        )
    }
}
