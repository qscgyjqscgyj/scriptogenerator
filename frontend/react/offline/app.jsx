import * as React from 'react';
import $ from 'jquery';
import {Nav} from '../nav';

import {observer} from 'mobx-react';
import {Tables} from './tables';
import {TableEdit, TableShare} from './table';


@observer
export class App extends React.Component {
    render() {
        return (
            <div>
                {/*<Nav location={this.props.location} params={this.props.params}/>*/}

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
    }
    render() {
        const childrenWithProps = React.Children.map(this.props.children,
            (child) => React.cloneElement(child, {
                script: this.script
            })
        );

        return React.createElement(App, {...this.props, children: childrenWithProps});
    }
}
