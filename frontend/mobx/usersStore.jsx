import {computed, observable} from 'mobx';

export class UsersStore {
    @observable users = [];
    @observable session_users = null;
}

export default new UsersStore