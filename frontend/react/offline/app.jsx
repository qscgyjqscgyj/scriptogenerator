import * as React from 'react';
import $ from 'jquery';
import {Nav} from '../nav';

import {observer} from 'mobx-react';
import {Tables} from './tables';
import {TableEdit, TableShare} from './table';


@observer
export class App extends React.Component {
    constructor(props) {
        super(props);

        // this.script = JSON.parse($('body').attr('script-data'));
        this.script = JSON.parse(SCRIPT_DATA);
    }
    componentWillMount() {
    }
    render() {
        return(
            this.props.children
        )
    }
}

export class AppWrapper extends React.Component {
    render() {
        return React.createElement(App, {...this.props});
    }
}
