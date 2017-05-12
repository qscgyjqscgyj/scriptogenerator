import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, browserHistory} from 'react-router'

import {TablesWrapper} from './tables';
import {TableWrapper} from './table';
import {AppWrapper} from './app';

const RENDER_ELEMENT = document.getElementById('content');

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/offline/tables/:script/" component={AppWrapper}>
            <IndexRoute component={TablesWrapper}/>
            {/*<Route path="/tables/:script/table/:table/" component={TableWrapper}/>*/}
            {/*<Route path="/tables/:script/table/:table/link/:link/" component={TableWrapper}/>*/}
        </Route>
    </Router>,
    RENDER_ELEMENT
);
