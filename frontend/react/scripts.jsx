import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import Modal from 'react-modal';
import {ModalWrapper} from './modal';
import {Link} from 'react-router';
import Select from 'react-select';
import confirm from './confirm';

@observer
export class Scripts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cloning: null,
            interval: null
        }
    }
    componentDidUpdate() {
        const {scriptsStore} = this.props;
        const {interval} = this.state;
        let inactive_scripts = scriptsStore.scripts.filter((script) => {
            return !script.active;
        });
        if(inactive_scripts.length > 0 && !interval) {
            this.setState(update(this.state, {interval: {
                $set: setInterval(function() {
                    scriptsStore.updateScripts();
                }, 2000)
            }}));
        } else if(inactive_scripts.length === 0 && interval){
            clearInterval(interval);
            this.setState(update(this.state, {interval: {$set: null}}));
        }
    }
    createScript(e) {
        const {projectsStore, scriptsStore, modalStore, usersStore} = this.props;
        let project = projectsStore.project(scriptsStore.creating_project);
        e.preventDefault();
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-scripts-url'),
            data: JSON.stringify({name: scriptsStore.creating_name, owner: usersStore.session_user}),
            success: (res) => {
                scriptsStore.scripts = res.scripts;
                modalStore.modal = false;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    updateScript(e, script) {
        const {scriptsStore, modalStore} = this.props;
        if(e) {e.preventDefault()}
        $.ajax({
            method: 'PUT',
            url: document.body.getAttribute('data-scripts-url'),
            data: JSON.stringify((script ? script : scriptsStore.editing)),
            success: (res) => {
                scriptsStore.scripts = res.scripts;
                modalStore.modal = false;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    deleteScript(script) {
        const {scriptsStore, modalStore} = this.props;
        confirm("Вы действительно хотите удалить скрипт: " + script.name).then(
            (result) => {
                $.ajax({
                    method: 'DELETE',
                    url: document.body.getAttribute('data-scripts-url'),
                    data: JSON.stringify({id: script.id}),
                    success: (res) => {
                        scriptsStore.scripts = res.scripts;
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
    setAccesses(accesses, script) {
        const {scriptsStore} = this.props;
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-accesses-url'),
            data: JSON.stringify({accesses: accesses, script: script}),
            success: (res) => {
                scriptsStore.scripts = res.scripts;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    cloneScript(script) {
        const {scriptsStore} = this.props;
        this.setState(update(this.state, {cloning: {$set: script}}), () => {
            $.ajax({
                method: 'POST',
                url: document.body.getAttribute('data-clone-script-url'),
                data: JSON.stringify(script),
                success: (res) => {
                    scriptsStore.scripts = res.scripts;
                    this.setState(update(this.state, {cloning: {$set: null}}));
                },
                error: (res) => {
                    console.log(res);
                }
            });
        });
    }
    render() {
        const {scriptsStore, modalStore, projectsStore, usersStore, tablesStore, available} = this.props;
        if(usersStore.session_user) {
            return(
                <div className="col-md-12">
                    {!available ?
                        <div>
                            <div className="col-md-2">
                                <button onClick={() => {
                                    modalStore.modal = true;
                                    modalStore.component = React.createElement(CreatingScript, {
                                        projectsStore: projectsStore,
                                        scriptsStore: scriptsStore,
                                        modalStore: modalStore,
                                        createScript: this.createScript.bind(this),
                                        updateScript: this.updateScript.bind(this),
                                        available: available
                                    });
                                }} className="btn btn-success">+ Создать скрипт</button>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <input onChange={(e) => scriptsStore.filter_by_name = e.target.value} className="form-control" type="text" placeholder="Поиск по названию"/>
                                </div>
                            </div>
                        </div>
                    : null}
                    <div className="row">
                        <div className="col-md-12">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <td>Название</td>
                                        <td>Владелец</td>
                                        {!available ?
                                            <td>Скопировать</td>
                                        : null}
                                        {!available ?
                                            <td>Доступы</td>
                                        :
                                            <td>Права</td>
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                {scriptsStore.filteredScripts(available).map((script, key)=>{
                                    let access = (available ? script.accesses.find(access => {return access.user.id === usersStore.session_user.id}) : null);
                                    return (
                                        <tr key={key}>
                                            <td>
                                                {script.active ?
                                                    <Link to={'/tables/' + script.id + '/'}>{script.name}</Link>
                                                :
                                                    <span>{script.name}</span>
                                                }
                                            </td>
                                            <td>{script.owner.email}</td>
                                            {!available ?
                                                <td>
                                                    {(this.state.cloning || !script.active) ?
                                                        <span>
                                                            {this.state.cloning === script ?
                                                                <span>Копирование...</span>
                                                            : (!script.active ?
                                                                <span>Подождите, идет конвертация ссылок...</span>
                                                            : null)}
                                                        </span>
                                                    :
                                                        <button className="btn btn-default" onClick={() => {this.cloneScript(script)}}>
                                                            Скопировать
                                                        </button>
                                                    }
                                                </td>
                                            : null}
                                            {!available ?
                                                <td>
                                                    <button onClick={() => {
                                                        modalStore.modal = true;
                                                        modalStore.component = React.createElement(Accesses, {
                                                            script: script,
                                                            usersStore: usersStore,
                                                            setAccesses: this.setAccesses.bind(this)
                                                        });
                                                    }} className="btn btn-default">Права</button>
                                                </td>
                                            :
                                                <td>
                                                    {access.edit ? 'Редактирование' : 'Просмотр'}
                                                </td>
                                            }

                                            <td className="text-right">
                                                {(available ? access.edit : true) ?
                                                    <button className="btn btn-default" onClick={()=>{
                                                        scriptsStore.editing = script;
                                                        modalStore.modal = true;
                                                        modalStore.component = React.createElement(EditingScript, {
                                                            projectsStore: projectsStore,
                                                            scriptsStore: scriptsStore,
                                                            modalStore: modalStore,
                                                            createScript: this.createScript.bind(this),
                                                            updateScript: this.updateScript.bind(this),
                                                            available: available
                                                        });
                                                    }}>Ред.</button>
                                                : null}
                                            </td>
                                            {!available ?
                                                <td className="text-right">
                                                    <button className="btn btn-danger" onClick={()=>{this.deleteScript(script)}}>Удалить</button>
                                                </td>
                                            : null}
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <ModalWrapper stores={[projectsStore, scriptsStore, tablesStore]} modalStore={modalStore}/>
                </div>
            );
        }
        return null;
    }
}

@observer
class CreatingScript extends React.Component {
    render() {
        const {projectsStore, scriptsStore} = this.props;
        return (
            <div className="row">
                <form action="" onSubmit={(e) => this.props.createScript(e)}>
                    <div className="col-md-12">
                        <div className="form-group">
                            <input className="form-control" onChange={(e) => {scriptsStore.creating_name = e.target.value}} value={scriptsStore.creating_name} type="text" name="name" placeholder="Имя скрипта"/>
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

@observer
class EditingScript extends React.Component {
    render() {
        const {projectsStore, scriptsStore, available} = this.props;
        if(scriptsStore.editing) {
            return (
                <div className="row">
                    <form action="" onSubmit={(e) => this.props.updateScript(e)}>
                        <div className="col-md-12">
                            <div className="form-group">
                                <input className="form-control" onChange={(e) => scriptsStore.editing.name = e.target.value} value={scriptsStore.editing.name} type="text" name="name" placeholder="Имя скрипта"/>
                            </div>
                        </div>
                        <div className="col-md-12">
                            <div className="form-group">
                                <button className="btn btn-success" type="submit">Сохранить</button>
                            </div>
                        </div>
                    </form>
                </div>
            )
        }
        return <div></div>;
    }
}

@observer
class Accesses extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            accesses: this.formatAccesses(props.script.accesses)
        }
    }
    componentWillReceiveProps(props) {
        this.setState(update(this.state, {
            accesses: {$set: this.formatAccesses(props.script.accesses)}
        }));
    }
    formatAccesses(accesses) {
        return accesses.map(access => {
            return {value: access.user.id, label: access.user.email, selected: true, edit: access.edit}
        });
    }
    onSelect(selects, edit) {
        const {script} = this.props;
        let {accesses} = this.state;
        let new_accesses = accesses.filter(access => {return access.edit !== edit});
        selects.map(select => {
            new_accesses.push(
                {value: select.value, label: select.label, selected: true, edit: edit}
            )
        });
        this.setState(update(this.state, {accesses: {$set: new_accesses}}), () => {
            this.props.setAccesses(new_accesses.map(access => {
                return {user_id: access.value, edit: access.edit}
            }), script);
        });
    }
    getSelected(edit) {
        return this.state.accesses.filter(access => {return access.edit === edit});
    }
    getOptions(edit) {
        const {usersStore} = this.props;
        let edit_selects = this.getSelected(true);
        let no_edit_selects = this.getSelected(false);
        let options = (edit ? edit_selects : no_edit_selects);
        let all_options = edit_selects.concat(no_edit_selects);
        usersStore.team.map(teammate => {
            if((all_options.length > 0 ? !(all_options.find(option => {return option.value === teammate.user.id})) : true)) {
                options.push(
                    {value: teammate.user.id, label: teammate.user.email}
                );
            }
        });
        return options;
    }
    render() {
        return(
            <div className="col-md-12">
                <div className="row">
                    <div className="col-md-12">
                        <p>Модераторы</p>
                        <MultiSelectField
                            options={this.getOptions(true)}
                            onChange={(selects) => {this.onSelect(selects, true)}}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <p>Операторы</p>
                        <MultiSelectField
                            options={this.getOptions(false)}
                            onChange={(selects) => {this.onSelect(selects, false)}}/>
                    </div>
                </div>
            </div>
        )
    }
}

class MultiSelectField extends React.Component {
    constructor(props) {
        super(props);

        this.displayName = 'MultiSelect';
        this.state = {
			options: props.options,
			value: props.options.filter(i => {return i.selected})
		};
    }
    componentWillReceiveProps(props) {
        this.setState({
			options: props.options,
			value: props.options.filter(i => {return i.selected})
		});
    }
	render() {
		return (
            <Select
                multi
                value={this.state.value}
                placeholder="Дать доступ к скрипту"
                options={this.state.options}
                onChange={(e) => {
                    this.setState(update(this.state, {value: {$set: e}}), () => {
                        this.props.onChange(e);
                    });
                }} />
		);
	}
}

@observer
export class AvailableScripts extends React.Component {
    render() {
        return React.cloneElement(React.createElement(Scripts, this.props), {available: true});
    }
}
