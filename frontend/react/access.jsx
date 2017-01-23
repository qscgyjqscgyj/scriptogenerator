import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import {ModalWrapper} from './modal';
import {Coll} from '../mobx/tablesStore';
import {Link} from 'react-router';
import {Sort} from './sort';

@observer
export class AccessableComponent extends React.Component {
    access(usersStore, script) {
        if(script && usersStore) {
            let access;
            let script_access = script.accesses.find(access => {return access.user.id === usersStore.session_user.id});
            if(usersStore.session_user.id === script.owner.id) {
                access = {edit: true};
            } else if(script_access && script_access.active) {
                access = script_access;
            }
            return access;
        }
        return false;
    }
}
