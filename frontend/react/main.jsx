import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, browserHistory} from 'react-router'
import {createHashHistory} from 'history';

import {Scripts, AvailableScripts} from './scripts';
import {Profile} from './profile/profile';
import {Projects} from './projects';
import {Tables, AvailableTables} from './tables';
import {TableEdit, TableShare} from './table';
import {AppWrapper} from './app';

const RENDER_ELEMENT = document.getElementById('content');
const URLS = {
    main: document.body.getAttribute('data-main-url'),
    profile: document.body.getAttribute('data-profile-url')
};

console.log(window.location.pathname);
console.log(URLS);

switch(window.location.pathname) {
    case URLS.profile:
        ReactDOM.render(
            <Router history={browserHistory}>
                <Route path="/" component={AppWrapper}>
                    <IndexRoute component={Profile}/>
                </Route>
            </Router>,
            RENDER_ELEMENT
        );
        break;
    case URLS.main:
        ReactDOM.render(
            <Router history={browserHistory}>
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
            RENDER_ELEMENT
        );
        break;
}
