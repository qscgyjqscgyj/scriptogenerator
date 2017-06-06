import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import MaskedInput from 'react-maskedinput';

@observer
export class Profile extends React.Component {
    updateSessionUser() {
        const {usersStore} = this.props;
        usersStore.updateUserDate();
    }
    onSubmit(e) {
        e.preventDefault();
        this.updateSessionUser();
    }
    render() {
        const {usersStore} = this.props;
        if(usersStore.session_user) {
            return(
                <div>
                    <div className="row">
                        <div className="col-md-6">
                            <h3>Личная информация</h3>
                            <form action="" onSubmit={this.onSubmit.bind(this)}>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Фамилия</label>
                                        <input className="form-control"
                                               onChange={(e) => usersStore.session_user.last_name = e.target.value}
                                               value={usersStore.session_user.last_name  ? usersStore.session_user.last_name : ''} type="text" name="last_name" placeholder="Фамилия"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Имя</label>
                                        <input className="form-control"
                                               onChange={(e) => usersStore.session_user.first_name = e.target.value}
                                               value={usersStore.session_user.first_name ? usersStore.session_user.first_name : ''} type="text" name="first_name" placeholder="Имя"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Отчество</label>
                                        <input className="form-control"
                                               onChange={(e) => usersStore.session_user.middle_name = e.target.value}
                                               value={usersStore.session_user.middle_name ? usersStore.session_user.middle_name : ''} type="text" name="middle_name" placeholder="Отчество"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input className="form-control" disabled={true} defaultValue={usersStore.session_user.email} type="text" name="email" placeholder="Email"/>
                                    </div>
                                    <div className="form-group">
                                        <label>Телефон</label>
                                        <MaskedInput mask="+7 111 111 1111" name="phone" size="20"
                                             className="form-control"
                                             value={usersStore.session_user.phone ? usersStore.session_user.phone : ''}
                                             onChange={(e) => usersStore.session_user.phone = e.target.value} placeholder="Телефон"/>
                                    </div>
                                    <div className="form-group">
                                        <label>Компания</label>
                                        <input className="form-control"
                                               onChange={(e) => usersStore.session_user.company = e.target.value}
                                               value={usersStore.session_user.company ? usersStore.session_user.company : ''} type="text" name="company" placeholder="Компания"
                                        />
                                    </div>
                                    <div className="form-group pull-right">
                                        <button type="submit" className="btn btn-success">Сохранить</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <hr/>
                            <h3>Настройки безопасности</h3>
                            <div className="form-group">
                                <a href={document.body.getAttribute('data-password-change-url')}>
                                    <button className="btn btn-default">Сменить пароль</button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        return null;
    }
}
