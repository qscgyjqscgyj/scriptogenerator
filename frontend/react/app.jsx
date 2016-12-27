import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';

import {Nav} from './nav';
import ProjectsStore from '../mobx/projectsStore';
import ModalStore from '../mobx/modalStore';
import ScriptsStore from '../mobx/scriptsStore';
import TablesStore from '../mobx/tablesStore';
import UsersStore from '../mobx/usersStore';
import PaymentStore from '../mobx/paymentStore';
import TooltipStore from '../mobx/tooltipStore';
import {observer} from 'mobx-react';


@observer
export class App extends React.Component {
    componentWillMount() {
        const {projectsStore, scriptsStore, usersStore, paymentStore} = this.props;
        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-init-url'),
            success: (res) => {
                projectsStore.createProjects(res.projects);

                scriptsStore.scripts = res.scripts;
                scriptsStore.template_scripts = res.template_scripts;
                scriptsStore.available_scripts = res.available_scripts;

                usersStore.users = res.users;
                usersStore.session_user = res.session_user;
                usersStore.team = res.team;

                paymentStore.shopId = res.shopId;
                paymentStore.scid = res.scid;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    render() {
        const {usersStore, tablesStore} = this.props;
        return(
            <div>
                <Nav location={this.props.location} params={this.props.params} usersStore={usersStore} tablesStore={tablesStore}/>

                <div className="container-fluid" id="main_container">
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
        let usersStore = UsersStore;
        let paymentStore = PaymentStore;
        let tooltipStore = TooltipStore;

        const childrenWithProps = React.Children.map(this.props.children,
            (child) => React.cloneElement(child, {
                projectsStore: projectsStore,
                scriptsStore: scriptsStore,
                tablesStore: tablesStore,
                modalStore: modalStore,
                usersStore: usersStore,
                paymentStore: paymentStore,
                tooltipStore: tooltipStore
            })
        );
        return(
            <App
                modalStore={modalStore}
                usersStore={usersStore}
                scriptsStore={scriptsStore}
                projectsStore={projectsStore}
                tablesStore={tablesStore}
                paymentStore={paymentStore}
                tooltipStore={tooltipStore}
                children={childrenWithProps}
                location={this.props.location}
                params={this.props.params}/>
        )
    }
}
