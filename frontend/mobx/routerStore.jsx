import {observable} from 'mobx';

export class RouterStore {
    @observable params = {};
}

export default new RouterStore;