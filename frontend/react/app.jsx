import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import {Nav} from './nav';
import ModalStore from '../mobx/modalStore';
import ScriptsStore from '../mobx/scriptsStore';
import UsersStore from '../mobx/usersStore';
import PaymentStore from '../mobx/paymentStore';
import TooltipStore from '../mobx/tooltipStore';

import {NoMoney, NoScriptOwnerMoney} from './noMoney';
import {observer} from 'mobx-react';
import {Scripts} from './scripts';
import {Tables} from './tables';
import {TableEdit, TableShare} from './table';


@observer
export class App extends React.Component {
    componentWillMount() {
        const {scriptsStore, usersStore, paymentStore} = this.props;
        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-init-url'),
            success: (res) => {
                usersStore.session_user = res.session_user;
                scriptsStore.template_scripts = res.template_scripts;
                scriptsStore.available_scripts = res.available_scripts;
                paymentStore.shopId = res.shopId;
                paymentStore.scid = res.scid;

                scriptsStore.getInitialData();
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    render() {
        const {usersStore, scriptsStore} = this.props;
        const PAYMENT_REQUIRED_COMPONENTS = [Scripts, Tables, TableEdit, TableShare];
        const script = this.props.params.script ? scriptsStore.script(this.props.params.script) : null;
        let payment_required_children = this.props.children.filter(child => {
            return PAYMENT_REQUIRED_COMPONENTS.includes(child.type)
        });
        let available_children = this.props.children.filter(child => {
            if(script && usersStore.session_user) {
                switch (child.type) {
                    case Tables:
                        if(script.accesses.find(access => {return access.user.id === usersStore.session_user.id})) {
                            return true;
                        }
                        break;
                    case TableEdit:
                        if(script.accesses.find(access => {return (access.user.id === usersStore.session_user.id) && access.edit})) {
                            return true;
                        }
                        break;
                    case TableShare:
                        if(script.accesses.find(access => {return access.user.id === usersStore.session_user.id})) {
                            return true;
                        }
                        break;
                    default:
                        return false;
                }
            }
            return false;
        });
        if(usersStore.session_user) {
            return(
                <div>
                    <Nav location={this.props.location} params={this.props.params} usersStore={usersStore} scriptsStore={scriptsStore}/>

                    <div className="container-fluid" id="main_container">

                        {scriptsStore.loading ?
                            <div className="loading">Loading&#8230;</div>
                        : null}

                        {payment_required_children.length > 0 ?
                            (available_children.length > 0 ?
                                (script.owner.balance_total > 0 ? this.props.children : <NoScriptOwnerMoney/>)
                            :
                                (usersStore.session_user.balance_total > 0 ? this.props.children : <NoMoney/>)
                            )
                        :
                            this.props.children
                        }
                    </div>
                </div>
            );
        }
        return null;
    }
}

export class AppWrapper extends React.Component {
    render() {
        let scriptsStore = ScriptsStore;
        let modalStore = ModalStore;
        let usersStore = UsersStore;
        let paymentStore = PaymentStore;
        let tooltipStore = TooltipStore;

        const childrenWithProps = React.Children.map(this.props.children,
            (child) => React.cloneElement(child, {
                scriptsStore: scriptsStore,
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
                paymentStore={paymentStore}
                tooltipStore={tooltipStore}
                children={childrenWithProps}
                location={this.props.location}
                params={this.props.params}/>
        )
    }
}
