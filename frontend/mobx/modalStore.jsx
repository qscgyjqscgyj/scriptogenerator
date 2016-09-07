import {computed, observable} from 'mobx';

export class ModalStore {
    @observable modal = false;
}

export default new ModalStore