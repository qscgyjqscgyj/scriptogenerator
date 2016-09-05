import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {Nav} from './nav';

export class App extends React.Component {
    render() {
        return(
            <div>
                <Nav />

                <div className="container">
                    {this.props.children}
                </div>
            </div>
        );
    }
}
