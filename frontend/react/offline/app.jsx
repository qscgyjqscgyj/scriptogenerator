import * as React from 'react';
import $ from 'jquery';
import {Nav} from './nav';
import ScriptsStore from '../../mobx/scriptsStore';

import {observer} from 'mobx-react';
import {TableEdit} from './table';


@observer
export class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {script, scriptsStore} = this.props;

        return (
            <div>
                {/*<Nav location={this.props.location} params={this.props.params} script={script} scriptsStore={scriptsStore}/>*/}

                <div className="container-fluid" id="main_container">
                    {this.props.children}
                </div>
            </div>
        )
    }
}

export class AppWrapper extends React.Component {
    constructor(props) {
        super(props);

        this.script = SCRIPT_DATA;
        this.scriptsStore = ScriptsStore;
    }
    render() {
        const childrenWithProps = React.Children.map(this.props.children,
            (child) => React.cloneElement(child, {
                script: this.script,
                scriptsStore: this.scriptsStore
            })
        );

        return React.createElement(App, {...this.props, children: childrenWithProps, script: this.script, scriptsStore: this.scriptsStore});
    }
}
