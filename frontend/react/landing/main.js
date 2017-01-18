import * as React from 'react';
import * as ReactDOM from 'react-dom';
import update from 'react-addons-update';
import $ from 'jquery';

const RENDER_ELEMENT = document.getElementById('landing_form_container');

class LandingForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            first_name: '',
            phone: ''
        }
    }
    updateField(field, value) {
        this.setState(update(this.state, {[field]: {$set: value}}))
    }
    submitForm(e) {
        e.preventDefault();
        if(this.state.email && this.state.phone) {
            $('#landing_form').submit();
        } else {
            alert('Зполните обязательные поля: Email, Телефон');
        }
    }
    render() {
        return(
            <center>
                <form id="landing_form" action={document.body.getAttribute('data-ext-register-url')} onSubmit={this.submitForm} method="GET">
                    <div className="inline_item">
                        <input name="first_name" placeholder="Имя" onChange={(e) => {this.updateField('first_name', e.target.value)}} type="text"/>
                    </div>
                    <div className="inline_item">
                        <input name="email" placeholder="Email *" onChange={(e) => {this.updateField('email', e.target.value)}} required={true} type="text"/>
                    </div>
                    <div className="inline_item">
                        <input name="phone" placeholder="Телефон *" onChange={(e) => {this.updateField('phone', e.target.value)}} required={true} type="text"/>
                    </div>
                    <div className="inline_item submit">
                        <button type="submit">Зарегистрироваться</button>
                    </div>
                </form>
            </center>
        )
    }
}

ReactDOM.render(<LandingForm/>, RENDER_ELEMENT);
