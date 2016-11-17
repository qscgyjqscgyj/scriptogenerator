import React, {PropTypes} from 'react';
import {confirmable, createConfirmation} from 'react-confirm';
import Modal from 'react-modal';
import {customModalStyles} from './modal';

const Dialog = ({show, proceed, dismiss, cancel, confirmation, options}) => {
    return(
        <Modal
            isOpen={show}
            style={customModalStyles}
            onRequestClose={dismiss}>
                <div className="row row-centered modal_block">
                    <div className="col-md-12 col-centered modal_header">
                        {confirmation}
                    </div>
                    <div className="col-md-12 col-centered modal_body">
                        <div className="col-md-3 col-centered">
                            <button className="btn btn-danger" onClick={() => cancel('arguments will be passed to the callback')}>Отмена</button>
                        </div>
                        <div className="col-md-3 col-centered">
                            <button className="btn btn-success" onClick={() => proceed('same as cancel')}>Принять</button>
                        </div>
                    </div>
                </div>
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