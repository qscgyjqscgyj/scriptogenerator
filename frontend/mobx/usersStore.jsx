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

    @observable pressed_key = null;

    @action getData() {
        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-profile-url'),
            success: (res) => {
                this.local_payments = res.local_payments;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    @action resetCreating() {
        this.creating_teammate_email = '';
        this.creating_teammate_last_name = '';
        this.creating_teammate_first_name = '';
        this.creating_teammate_middle_name = '';
        this.creating_teammate_phone = '';
    }
}

export default new UsersStore