import {action, computed, observable} from 'mobx';

export class ModalStore {
    @observable modal = false;
    @observable component = null;

    @action open_modal(component) {
        this.modal = true;
        this.component = component;
    }
    @action close_modal() {
        this.modal = false;
        this.component = null;
    }
}

export default new ModalStore