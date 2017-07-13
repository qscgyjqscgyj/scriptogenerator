import {action, computed, observable} from 'mobx';

const DEFAULT_SUCCESS_BUTTON_NAME = 'Сохранить';

export class ModalStore {
    @observable modal = false;
    @observable component = null;
    @observable modal_title = '';

    @observable onSuccessButton = null;
    @observable success_button_name = DEFAULT_SUCCESS_BUTTON_NAME;

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

    @action setComponent(component) {
        this.component = component;
    }

    @action clearComponent() {
        this.component = null;
    }

    @action setTitle(modal_title) {
        this.modal_title = modal_title;
    }

    @action clearTitle() {
        this.modal_title = '';
    }

    @action setOnSuccessButtonHandler(handler) {
        this.onSuccessButton = handler;
    }

    @action clearOnSuccessButtonHandler(handler) {
        this.onSuccessButton = handler;
    }

    @action setSuccessButtonName(name) {
        this.success_button_name = name;
    }

    @action resetDefaultSuccessButtonName() {
        this.success_button_name = DEFAULT_SUCCESS_BUTTON_NAME;
    }

    @action open_modal(component, modal_title=null, onSuccessButtonHandler=null, success_button_name=null) {
        this.modal = true;

        this.setComponent(component);
        if(modal_title) {this.setTitle(modal_title)}
        if(onSuccessButtonHandler) {this.setOnSuccessButtonHandler(onSuccessButtonHandler)}
        if(success_button_name) {this.setSuccessButtonName(success_button_name)}
    }

    @action close_modal() {
        this.modal = false;

        this.clearTitle();
        this.clearOnSuccessButtonHandler();
        this.resetDefaultSuccessButtonName();
        this.clearComponent();
    }
}

export default new ModalStore