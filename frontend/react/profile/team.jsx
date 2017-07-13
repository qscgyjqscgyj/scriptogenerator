import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import confirm from '../confirm';
import {Link} from 'react-router';
import MaskedInput from 'react-maskedinput';

@observer
export class Team extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            new_teammate: null
        }
    }

    componentWillMount() {
        const {usersStore} = this.props;
        usersStore.getTeam();
    }

    createTeammate(e) {
        e.preventDefault();
        const {usersStore, modalStore} = this.props;
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-team-url'),
            data: JSON.stringify({
                email: usersStore.creating_teammate_email,
                last_name: usersStore.creating_teammate_last_name,
                first_name: usersStore.creating_teammate_first_name,
                middle_name: usersStore.creating_teammate_middle_name,
                phone: usersStore.creating_teammate_phone
            }),
            success: (res) => {
                usersStore.team = res.team;
                usersStore.session_user = res.session_user;
                modalStore.close_modal();
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    updateTeammate(teammate) {
        const {usersStore} = this.props;
        $.ajax({
            method: 'PUT',
            url: document.body.getAttribute('data-team-url'),
            data: JSON.stringify(teammate),
            success: (res) => {
                usersStore.team = res.team;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    deleteTeammate(teammate) {
        const {usersStore} = this.props;
        confirm("Вы действительно хотите удалить пользователя: " + teammate.user.email).then(
            (result) => {
                $.ajax({
                    method: 'DELETE',
                    url: document.body.getAttribute('data-team-url'),
                    data: JSON.stringify(teammate),
                    success: (res) => {
                        usersStore.team = res.team;
                    },
                    error: (res) => {
                        console.log(res);
                    }
                });
            },
            (result) => {
                console.log('cancel called');
            }
        )
    }

    render() {
        const {usersStore, modalStore} = this.props;
        return (
            <div className="row">
                <div className="col-md-12">
                    <button onClick={() => {
                        if (usersStore.session_user.positive_balance) {
                            modalStore.open_modal(
                                React.createElement(CreatingTeammate, {
                                    usersStore: usersStore,
                                    modalStore: modalStore,
                                    createTeammate: this.createTeammate.bind(this)
                                }),
                                'Добавление сотрудника',
                                this.createTeammate.bind(this),
                                'Добавить'
                            );
                        } else {
                            modalStore.open_modal(
                                React.createElement(CreatingTeammateNegativeBalance, {
                                    modalStore: modalStore,
                                }),
                                'Добавление сотрудника',
                            );
                        }
                    }} className="btn btn-success">+ Добавить сотрудника
                    </button>

                </div>
                <div className="row">
                    <div className="col-md-8">
                        <div className="col-md-12">
                            {usersStore.session_user.positive_balance ?
                                <table className="table table-striped">
                                    <thead>
                                    <tr>
                                        <td>Email</td>
                                        <td>Фамилия</td>
                                        <td>Имя</td>
                                        <td>Отчество</td>
                                        <td>Телефон</td>
                                        {/*<td>Активен</td>*/}
                                        <td/>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {usersStore.team.length > 0 ?
                                        usersStore.team.map((access, key) => {
                                            return (
                                                <tr key={key}>
                                                    <td>{access.user.email}</td>
                                                    <td>{access.user.last_name}</td>
                                                    <td>{access.user.first_name}</td>
                                                    <td>{access.user.middle_name}</td>
                                                    <td>{access.user.phone}</td>
                                                    {/*<td>*/}
                                                    {/*<input type="checkbox" defaultChecked={access.active} onChange={() => {access.active = !access.active; this.updateTeammate(access)}}/>*/}
                                                    {/*</td>*/}
                                                    <td>
                                                        <button onClick={() => {
                                                            this.deleteTeammate(access)
                                                        }} className="btn btn-danger btn-xs">
                                                            <i className="glyphicon glyphicon-remove"/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                        : null}
                                    </tbody>
                                </table>
                                :
                                <div>
                                    <h3>Доступ к скриптам для членов команды - закрыт. Пополните баланс, чтобы открыть
                                        доступ.</h3>
                                    <a href="https://getproff.ru/pay/user">
                                        <button className="btn btn-danger">Пополните баланс</button>
                                    </a>
                                </div>
                            }
                        </div>
                    </div>
                    {/*<div className="col-md-4">*/}
                    {/*<div className="jumbotron col-md-11">*/}
                    {/*<h3>Абонентская плата.</h3>*/}
                    {/*<p>Абонентская плата составляет 15 рублей за пользователя в день. При добавлении пользователя сразу списывается абонентская плата за одного пользователя. Посмотреть список пользователей можно по ссылке <Link to="/profile/team/">"Команда"</Link></p>*/}
                    {/*</div>*/}
                    {/*</div>*/}
                </div>
            </div>
        )
    }
}

@observer
class CreatingTeammate extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {usersStore} = this.props;
        return (
            <div className="row">
                <div className="col-md-12">
                    <div className="form-group">
                        <input className="form-control"
                               onChange={(e) => usersStore.creating_teammate_email = e.target.value}
                               value={usersStore.creating_teammate_email}
                               type="text" name="name" placeholder="Email"/>
                    </div>
                    <div className="form-group">
                        <input className="form-control"
                               onChange={(e) => usersStore.creating_teammate_last_name = e.target.value}
                               value={usersStore.creating_teammate_last_name}
                               type="text" name="last_name" placeholder="Фамилия"/>
                    </div>
                    <div className="form-group">
                        <input className="form-control"
                               onChange={(e) => usersStore.creating_teammate_first_name = e.target.value}
                               value={usersStore.creating_teammate_first_name}
                               type="text" name="first_name" placeholder="Имя"/>
                    </div>
                    <div className="form-group">
                        <input className="form-control"
                               onChange={(e) => usersStore.creating_teammate_middle_name = e.target.value}
                               value={usersStore.creating_teammate_middle_name}
                               type="text" name="middle_name" placeholder="Отчество"/>
                    </div>
                    <div className="form-group">
                        <MaskedInput className="form-control" mask="+7 111 111 1111" size="20"
                                     onChange={(e) => usersStore.creating_teammate_phone = e.target.value}
                                     value={usersStore.creating_teammate_phone}
                                     placeholder="Телефон" name="phone"/>
                    </div>
                </div>
            </div>
        )
    }
}


@observer
class CreatingTeammateNegativeBalance extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="row row-centered">
                <div className="col-md-12 col-centered">
                    <h3>Чтобы добавить сотрудника</h3>
                    <a href="https://getproff.ru/pay/user">
                        <button className="btn btn-danger">Пополните баланс</button>
                    </a>
                </div>
            </div>
        )
    }
}