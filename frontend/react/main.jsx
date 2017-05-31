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

            <Route path="/scripts/user/" component={Scripts}/>
            <Route path="/scripts/available/" component={AvailableScripts}/>
            <Route path="/scripts/offline/user/" component={OfflineScripts}/>

            <Route path="/tables/:script/" component={TablesWrapper}/>
            <Route path="/tables/:script/available/" component={AvailableTablesWrapper}/>

            <Route path="/tables/:script/table/:table/edit/" component={TableEditWrapper}/>
            <Route path="/tables/:script/table/:table/link/:link/edit/" component={TableEditWrapper}/>

            <Route path="/tables/:script/table/:table/share/" component={TableShareWrapper}/>
            <Route path="/tables/:script/table/:table/link/:link/share/" component={TableShareWrapper}/>

            <Route path="/profile/" component={Profile}/>
            <Route path="/profile/payment/" component={Payment}/>
            <Route path="/profile/team/" component={Team}/>
        </Route>
    </Router>,
    RENDER_ELEMENT
);
