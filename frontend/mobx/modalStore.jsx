import {computed, observable} from 'mobx';

export class ModalStore {
    @observable modal = false;
    @observable component = null;
}

export default new ModalStore