import React, {PropTypes} from 'react';
import {confirmable, createConfirmation} from 'react-confirm';
import {Modal} from 'react-bootstrap';

const Dialog = ({show, proceed, dismiss, cancel, confirmation, options}) => {
    return(
        <Modal show={show} onHide={dismiss}>
            <Modal.Header closeButton>
                <Modal.Title>{confirmation}?</Modal.Title>
            </Modal.Header>

            <Modal.Footer>
                <button className="btn btn-success" onClick={() => proceed('same as cancel')}>Принять</button>
                <button className="btn btn-danger" onClick={() => cancel('arguments will be passed to the callback')}>Отмена</button>
            </Modal.Footer>
        </Modal>
    )
};

Dialog.propTypes = {
    show: PropTypes.bool,            // from confirmable. indicates if the dialog is shown or not.
    proceed: PropTypes.func,         // from confirmable. call to close the dialog with promise resolved.
    cancel: PropTypes.func,          // from confirmable. call to close the dialog with promise rejected.
    dismiss: PropTypes.func,         // from confirmable. call to only close the dialog.
    confirmation: PropTypes.string,  // arguments of your confirm function
    options: PropTypes.object        // arguments of your confirm function
};

// create confirm function
const confirm = createConfirmation(confirmable(Dialog));

// This is optional. But I recommend to define your confirm function easy to call.
export default function(confirmation, options = {}) {
  // You can pass whatever you want to the component. These arguments will be your Component's props
  return confirm({ confirmation, options });
}