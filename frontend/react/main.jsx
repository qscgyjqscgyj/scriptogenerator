import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, browserHistory} from 'react-router'
//import {createHashHistory} from 'history';

import {Scripts} from './scripts';
import {Tables} from './tables';
import {App} from './app';
import ScriptsStore from '../mobx/scriptsStore';

class ScriptsWrapper extends React.Component {
    render() {
        return(
            <Scripts store={ScriptsStore}/>
        )
    }
}

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={ScriptsWrapper}/>
            <Route path="scripts/user" component={ScriptsWrapper}/>
            <Route path="scripts/available" component={ScriptsWrapper}/>
            <Route path="tables/:script" component={Tables}/>
        </Route>
    </Router>,
    document.getElementById('content')
);
