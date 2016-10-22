import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';

import {Nav} from './nav';
import ProjectsStore from '../mobx/projectsStore';
import ModalStore from '../mobx/modalStore';
import ScriptsStore from '../mobx/scriptsStore';
import TablesStore from '../mobx/tablesStore';
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
                {!(this.props.location.pathname.includes('share')) ?
                    <Nav location={this.props.location} params={this.props.params}/>
                :
                    ''
                }

                <div className="container-fluid">
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
        let tablesStore = TablesStore;
        let modalStore = ModalStore;

        const childrenWithProps = React.Children.map(this.props.children,
            (child) => React.cloneElement(child, {
                projectsStore: projectsStore,
                scriptsStore: scriptsStore,
                tablesStore: tablesStore,
                modalStore: modalStore
            })
        );
        return(
            <App
                modalStore={modalStore}
                scriptsStore={scriptsStore}
                projectsStore={projectsStore}
                tablesStore={tablesStore}
                children={childrenWithProps}
                location={this.props.location}
                params={this.props.params}/>
        )
    }
}
