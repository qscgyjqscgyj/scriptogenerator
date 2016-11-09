import {computed, observable} from 'mobx';

export class UsersStore {
    @observable users = [];
    @observable session_user = null;
}

export default new UsersStore