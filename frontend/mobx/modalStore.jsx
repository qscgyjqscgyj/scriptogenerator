import {action, computed, observable} from 'mobx';

export class ModalStore {
    @observable modal = false;
    @observable height = null;
    @observable component = null;

    @observable modal_styles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '50%',
            height: this.height ? `${this.height}px` : 'auto',
            minHeight: this.height ? `${this.height}px` : '10%',
            maxHeight: this.height ? `${this.height}px` : '100%',
            overflow: 'scroll',
        }
    };

    @action setHeight(height) {
        if (parseInt(height)) {
            this.height = height;
        }
    }

    @action clearHeight() {
        this.height = null;
    }

    @action setComponent(component) {
        this.component = component;
    }

    @action clearComponent() {
        this.component = null;
    }

    @action open_modal(component, height) {
        this.modal = true;
        this.setComponent(component);
        if (height) {
            this.setHeight(height);
        }
    }

    @action close_modal() {
        this.modal = false;
        this.clearHeight();
        this.clearComponent();
    }
}

export default new ModalStore