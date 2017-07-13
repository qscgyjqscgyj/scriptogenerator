import * as React from 'react';
// import Modal from 'react-modal';
import {Modal} from 'react-bootstrap';
import {observer} from 'mobx-react';

function isFunction(functionToCheck) {
    let getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

@observer
export class ModalWrapper extends React.Component {
    constructor(props) {
        super(props);
    }

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
            <Modal show={modalStore.modal} onHide={this.onRequestClose.bind(this)}>
                {modalStore.modal_title ?
                    <Modal.Header closeButton>
                        <Modal.Title>{modalStore.modal_title}</Modal.Title>
                    </Modal.Header>
                    : null}

                <Modal.Body>
                    {modalStore.component}
                </Modal.Body>

                <Modal.Footer>
                    {modalStore.onSuccessButton ?
                        <button className="btn btn-success"
                                onClick={modalStore.onSuccessButton.bind(this)}>{modalStore.success_button_name}</button>
                        : null}
                    <button className="btn btn-info" onClick={this.onRequestClose.bind(this)}>Закрыть</button>
                </Modal.Footer>
            </Modal>
        )
    }
}
{/*<Modal*/
}
{/*isOpen={modalStore.modal}*/
}
{/*style={modalStore.modal_styles}*/
}

{/*dialogClassName={modalStore.fullscreen ? 'modal_fullscreen_main' : ''}*/
}
{/*bsClass={modalStore.fullscreen ? 'modal_fullscreen_bs' : ''}*/
}

{/*contentLabel=""*/
}
{/*onRequestClose={this.onRequestClose.bind(this)}*/
}
{/*onAfterOpen={this.onAfterOpen.bind(this)}>*/
}
{/*{modalStore.component}*/
}
{/*</Modal>*/
}
