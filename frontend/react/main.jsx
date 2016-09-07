import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Router, Route, IndexRoute} from 'react-router'
import {createHashHistory} from 'history';

import {ScriptsWrapper} from './scripts';
import {ProjectsWrapper} from './projects';
import {Tables} from './tables';
import {AppWrapper} from './app';

ReactDOM.render(
    <Router history={createHashHistory({queryKey: false})}>
        <Route path="/" component={AppWrapper}>
            <IndexRoute component={ScriptsWrapper}/>
            <Route path="/projects" component={ProjectsWrapper}/>
            <Route path="/scripts/user" component={ScriptsWrapper}/>
            <Route path="/scripts/available" component={ScriptsWrapper}/>
            <Route path="/tables/:script" component={Tables}/>
        </Route>
    </Router>,
    document.getElementById('content')
);
