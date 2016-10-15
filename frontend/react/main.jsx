import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Router, Route, IndexRoute} from 'react-router'
import {createHashHistory} from 'history';

import {ScriptsWrapper} from './scripts';
import {ProjectsWrapper} from './projects';
import {Tables} from './tables';
import {TableEdit, TableShare, LinkRouteHandler} from './table';
import {AppWrapper} from './app';

ReactDOM.render(
    <Router history={createHashHistory({queryKey: false})}>
        <Route path="/" component={AppWrapper}>
            <IndexRoute component={ScriptsWrapper}/>
            <Route path="/projects" component={ProjectsWrapper}/>
            <Route path="/scripts/user" component={ScriptsWrapper}/>
            <Route path="/scripts/available" component={ScriptsWrapper}/>
            <Route path="/tables/:script" component={Tables}/>
            <Route path="/tables/:script/table/:table/edit" component={TableEdit}/>
            <Route path="/tables/:script/table/:table/link/:link/edit" component={TableEdit} handler={LinkRouteHandler}/>

            <Route path="/tables/:script/table/:table/share" component={TableShare}/>
            <Route path="/tables/:script/table/:table/link/:link/share" component={TableShare} handler={LinkRouteHandler}/>
        </Route>
    </Router>,
    document.getElementById('content')
);
