import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import confirm from '../confirm';
import {ModalWrapper} from '../modal';

@observer
export class Team extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            new_teammate: null
        }
    }
    createTeammate(e) {
        const {usersStore, modalStore} = this.props;
        e.preventDefault();
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-team-url'),
            data: JSON.stringify({email: usersStore.creating_teammate_email}),
            success: (res) => {
                usersStore.team = res.team;
                modalStore.modal = false;
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
        if(usersStore.team.length > 0) {
            return(
                <div className="row">
                    <div className="col-md-12">
                        <button onClick={() => {
                            modalStore.modal = true;
                            modalStore.component = React.createElement(CreatingTeammate, {
                                usersStore: usersStore,
                                modalStore: modalStore,
                                createTeammate: this.createTeammate.bind(this)
                            });
                        }} className="btn btn-success">+ Добавить сотрудника</button>

                    </div>
                    <div className="col-md-12">
                        <div className="col-md-3">Email</div>
                        <div className="col-md-3">Телефон</div>
                        <div className="col-md-3">Активность</div>
                        <div className="col-md-3"></div>
                    </div>
                    {usersStore.team.map((access, key) => {
                        return (
                            <div key={key} className="col-md-12">
                                <div className="col-md-3">{access.user.email}</div>
                                <div className="col-md-3">{access.user.phone}</div>
                                <div className="col-md-3">
                                    <input type="checkbox" defaultChecked={access.active} onChange={() => {access.active = !access.active; this.updateTeammate(access)}}/>
                                </div>
                                <div className="col-md-3">
                                    <button onClick={()=>{this.deleteTeammate(access)}} className="btn btn-danger">
                                        <i className="glyphicon glyphicon-remove"/>
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                    <ModalWrapper stores={[usersStore]} modalStore={modalStore}/>
                </div>
            )
        }
        return null;
    }
}

@observer
class CreatingTeammate extends React.Component {
    render() {
        const {usersStore} = this.props;
        return (
            <div className="row">
                <form action="" onSubmit={(e) => this.props.createTeammate(e)}>
                    <div className="col-md-12">
                        <div className="form-group">
                            <input className="form-control" onChange={(e) => usersStore.creating_teammate_email = e.target.value} value={usersStore.creating_teammate_email} type="text" name="name" placeholder="Email"/>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="form-group">
                            <button className="btn btn-success" type="submit">Создать</button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}