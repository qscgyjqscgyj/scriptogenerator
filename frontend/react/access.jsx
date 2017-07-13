import * as React from 'react';
import {observer} from 'mobx-react';
import {Link} from 'react-router';

@observer
export class AccessableComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    access(usersStore, script) {
        if(script && usersStore) {
            let access;
            let script_access = script.accesses.find(access => {return access.user.id === usersStore.session_user.id});
            if(usersStore.session_user.id === script.owner.id) {
                access = {edit: true};
            } else if(script_access) {
                access = script_access;
            }
            return access;
        }
        return false;
    }
}
