import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';

@observer
export class Profile extends React.Component {
    updateSessionUser() {
        const {usersStore} = this.props;
        $.ajax({
            method: 'PUT',
            url: document.body.getAttribute('data-profile-url'),
            data: JSON.stringify(usersStore.session_user),
            success: (res) => {
                usersStore.session_user = res.session_user;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    render() {
        return(
            <div className="row">
                <div className="col-md-12">
                    <div className="col-md-6"></div>
                    <div className="col-md-6"></div>
                </div>
            </div>
        )
    }
}
