import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';

import {Nav} from './nav';
import ProjectsStore from '../mobx/projectsStore';
import ModalStore from '../mobx/modalStore';
import ScriptsStore from '../mobx/scriptsStore';
import {observer} from 'mobx-react';


@observer
export class App extends React.Component {
    componentWillMount() {
        const {projectsStore, scriptsStore} = this.props;
        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-init-url'),
            success: (res) => {
                projectsStore.createProjects(res.projects);
                scriptsStore.scripts = res.scripts;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
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

export class AppWrapper extends React.Component {
    render() {
        let projectsStore = ProjectsStore;
        let scriptsStore = ScriptsStore;
        let modalStore = ModalStore;

        const childrenWithProps = React.Children.map(this.props.children,
            (child) => React.cloneElement(child, {
                projectsStore: projectsStore,
                scriptsStore: scriptsStore,
                modalStore: modalStore
            })
        );
        return(
            <App modalStore={modalStore} scriptsStore={scriptsStore} projectsStore={projectsStore} children={childrenWithProps}/>
        )
    }
}
