import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Router, Route, IndexRoute} from 'react-router'
import {createHashHistory} from 'history';

import {Scripts, AvailableScripts} from './scripts';
import {Projects} from './projects';
import {Tables, AvailableTables} from './tables';
import {TableEdit, TableShare} from './table';
import {AppWrapper} from './app';

ReactDOM.render(
    <Router history={createHashHistory({queryKey: false})}>
        <Route path="/" component={AppWrapper}>
            <IndexRoute component={Scripts}/>
            <Route path="/projects" component={Projects}/>

            <Route path="/scripts/user" component={Scripts}/>
            <Route path="/scripts/available" component={AvailableScripts}/>

            <Route path="/tables/:script" component={Tables}/>
            <Route path="/tables/:script/available" component={AvailableTables}/>

            <Route path="/tables/:script/table/:table/edit" component={TableEdit}/>
            <Route path="/tables/:script/table/:table/link/:link/edit" component={TableEdit}/>

            <Route path="/tables/:script/table/:table/share" component={TableShare}/>
            <Route path="/tables/:script/table/:table/link/:link/share" component={TableShare}/>
        </Route>
    </Router>,
    document.getElementById('content_scripts')
);

//ReactDOM.render(
//    <Router history={createHashHistory({queryKey: false})}>
//        <Route path="/" component={AppWrapper}>
//            <IndexRoute component={Scripts}/>
//            <Route path="/projects" component={Projects}/>
//
//            <Route path="/scripts/user" component={Scripts}/>
//            <Route path="/scripts/available" component={AvailableScripts}/>
//
//            <Route path="/tables/:script" component={Tables}/>
//            <Route path="/tables/:script/available" component={AvailableTables}/>
//
//            <Route path="/tables/:script/table/:table/edit" component={TableEdit}/>
//            <Route path="/tables/:script/table/:table/link/:link/edit" component={TableEdit}/>
//
//            <Route path="/tables/:script/table/:table/share" component={TableShare}/>
//            <Route path="/tables/:script/table/:table/link/:link/share" component={TableShare}/>
//        </Route>
//    </Router>,
//    document.getElementById('content_profile')
//);
