import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, browserHistory} from 'react-router'
import {createHashHistory} from 'history';

import {Scripts, AvailableScripts} from './scripts';
import {OfflineScripts} from './offlineScripts';
import {Profile} from './profile/profile';
import {Payment} from './profile/payment';
import {Team} from './profile/team';
import {TablesWrapper, AvailableTablesWrapper} from './tables';
import {TableEditWrapper, TableShareWrapper} from './table';
import {AppWrapper} from './app';

const RENDER_ELEMENT = document.getElementById('content');

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={AppWrapper}>
            <IndexRoute component={Scripts}/>

            <Route path="/scripts/user/" component={Scripts} page_name="scripts"/>
            <Route path="/scripts/available/" component={AvailableScripts} page_name="available_scripts"/>
            <Route path="/scripts/offline/user/" component={OfflineScripts}/>

            <Route path="/tables/:script/" component={TablesWrapper} page_name="tables"/>
            <Route path="/tables/:script/available/" component={AvailableTablesWrapper} page_name="available_tables"/>

            <Route path="/tables/:script/table/:table/edit/" component={TableEditWrapper} page_name="table_edit"/>
            <Route path="/tables/:script/table/:table/link/:link/edit/" component={TableEditWrapper} page_name="table_edit"/>

            <Route path="/tables/:script/table/:table/share/" component={TableShareWrapper} page_name="table_share"/>
            <Route path="/tables/:script/table/:table/link/:link/share/" component={TableShareWrapper} page_name="table_share"/>

            <Route path="/profile/" component={Profile} page_name="profile"/>
            <Route path="/profile/payment/" component={Payment} page_name="payment"/>
            <Route path="/profile/team/" component={Team} page_name="team"/>
        </Route>
    </Router>,
    RENDER_ELEMENT
);
