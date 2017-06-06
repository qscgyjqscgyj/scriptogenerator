import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, browserHistory, hashHistory} from 'react-router'

import {TablesWrapper} from './tables';
import {TableWrapper} from './table';
import {AppWrapper} from './app';

const RENDER_ELEMENT = document.getElementById('content');

ReactDOM.render(
    <Router history={hashHistory}>
        <Route path="/" component={AppWrapper}>
            <IndexRoute component={TablesWrapper}/>
            <Route path="/tables/:script/" component={TablesWrapper}/>
            <Route path="/tables/:script/table/:table/share/" component={TableWrapper}/>
            <Route path="/tables/:script/table/:table/link/:link/share/" component={TableWrapper}/>
        </Route>
    </Router>,
    RENDER_ELEMENT
);
