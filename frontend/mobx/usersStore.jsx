import {computed, observable, action} from 'mobx';
import $ from 'jquery';

export class UsersStore {
    @observable users = [];
    @observable team = [];
    @observable payment_history = [];
    @observable payment_per_user = 0;
    @observable session_user = null;

    // SCRIPT DELEGATION ACCESSES
    @observable script_delegation_accesses = [];

    // SCRIPT EXPORTING ACCESSES
    @observable script_exporting_accesses = [];
    @observable offline_exported_scripts = [];
    @observable script_exporting_unlim_access_is_active = false;

    @observable creating_teammate_email = '';
    @observable creating_teammate_first_name = '';
    @observable creating_teammate_last_name = '';
    @observable creating_teammate_middle_name = '';
    @observable creating_teammate_phone = '';

    @observable pressed_key = null;

    @observable loading = false;

    @action setLoading(loading=true) {
        this.loading = loading;
    }

    @action getData() {
        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-profile-url'),
            success: (res) => {
                this.payment_history = res.payment_history;
                this.payment_per_user = res.payment_per_user;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    @action getTeam() {
        if(this.team.length === 0) {
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
    }

    @action clearPaymentHistory() {
        this.payment_history.clear();
    }

    @action getScriptDelegationAccesses() {
        this.setLoading(true);

        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-scripts-delegation-url'),
            success: (res) => {
                this.script_delegation_accesses = res.script_delegation_accesses;
                this.setLoading(false);
            },
            error: (res) => {
                console.log(res);
                this.setLoading(false);
            }
        });
    }

    @action clearScriptDelegationAccesses() {
        this.script_delegation_accesses.clear();
    }

    @action getOfflineScriptsExportAccesses() {
        this.setLoading(true);

        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-scripts-exporting-url'),
            success: (res) => {
                this.script_exporting_accesses = res.script_exporting_accesses;
                this.script_exporting_unlim_access_is_active = res.script_exporting_unlim_access_is_active;
                this.setLoading(false);
            },
            error: (res) => {
                console.log(res);
                this.setLoading(false);
            }
        });
    }

    @action clearOfflineScriptsExportAccesses() {
        this.script_exporting_accesses.clear();
        this.script_exporting_unlim_access_is_active = false;
    }

    @action getOfflineExportedScripts() {
        this.setLoading(true);

        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-offline-exported-scripts-url'),
            success: (res) => {
                this.offline_exported_scripts = res.offline_exported_scripts;
                this.setLoading(false);
            },
            error: (res) => {
                console.log(res);
                this.setLoading(false);
            }
        });
    }

    @action clearOfflineExportedScripts() {
        this.offline_exported_scripts.clear();
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