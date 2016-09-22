import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import Modal from 'react-modal';
import {observer} from 'mobx-react';

const customModalStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

@observer
export class ModalWrapper extends React.Component {
    render() {
        const {scriptsStore, projectsStore, tablesStore, modalStore} = this.props;
        return (
            <Modal
                isOpen={modalStore.modal}
                style={customModalStyles}
                onRequestClose={() => {
                    modalStore.modal = false;
                    projectsStore.editing = null;
                    scriptsStore.editing = null;
                    tablesStore.editing = null;
                }}
                onAfterOpen={() => {
                    projectsStore.resetCreating();
                    scriptsStore.resetCreating();
                    tablesStore.resetCreating();
                }}>
                {
                    modalStore.component ?
                        React.createElement(
                            modalStore.component,
                            this.props
                        )
                        : ''
                }
            </Modal>
        )
    }
}
