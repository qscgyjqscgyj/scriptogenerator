import * as React from 'react';
import Modal from 'react-modal';
import {observer} from 'mobx-react';

function isFunction(functionToCheck) {
    let getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

@observer
export class ModalWrapper extends React.Component {
    onRequestClose() {
        const {stores, modalStore} = this.props;
        modalStore.close_modal();
        stores.map(store => {
            if (store.editing) {
                store.editing = null;
            }
        });
    }

    onAfterOpen() {
        const {stores} = this.props;
        stores.map(store => {
            if (store.editing) {
                store.resetCreating();
            }
        });
    }
    
    render() {
        const {modalStore} = this.props;
        return (
            <Modal
                isOpen={modalStore.modal}
                style={modalStore.modal_styles}
                contentLabel=""
                onRequestClose={this.onRequestClose.bind(this)}
                onAfterOpen={this.onAfterOpen.bind(this)}>
                {modalStore.component}
            </Modal>
        )
    }
}
