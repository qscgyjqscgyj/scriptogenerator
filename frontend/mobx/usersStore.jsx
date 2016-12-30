import {computed, observable, action} from 'mobx';
import $ from 'jquery';

export class UsersStore {
    @observable users = [];
    @observable team = [];
    @observable local_payments = [];
    @observable session_user = null;

    @observable creating_teammate_email = '';
    @observable creating_teammate_first_name = '';
    @observable creating_teammate_last_name = '';
    @observable creating_teammate_middle_name = '';
    @observable creating_teammate_phone = '';

    @action getData() {
        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-team-url'),
            success: (res) => {
                this.team = res.team;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    @action resetCreating() {
        this.creating_teammate_email = '';
    }
}

export default new UsersStore