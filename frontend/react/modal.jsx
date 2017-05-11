import * as React from 'react';
import Modal from 'react-modal';
import {observer} from 'mobx-react';

export const customModalStyles = {
    content : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '50%'
    }
};

function isFunction(functionToCheck) {
    let getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

@observer
export class ModalWrapper extends React.Component {
    render() {
        const {stores, modalStore} = this.props;
        return (
            <Modal
                isOpen={modalStore.modal}
                style={customModalStyles}
                contentLabel=""
                onRequestClose={() => {
                    modalStore.close_modal();
                    stores.map(store => {
                        if(store.editing) {
                            store.editing = null;
                        }
                    });
                }}
                onAfterOpen={() => {
                    stores.map(store => {
                        if(store.editing) {
                            store.resetCreating();
                        }
                    });
                }}>
                {modalStore.component}
            </Modal>
        )
    }
}
