import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import Modal from 'react-modal';
import {ModalWrapper} from './modal';
import {Link} from 'react-router';
import Select from 'react-select';

@observer
export class Scripts extends React.Component {
    createScript(e) {
        const {projectsStore, scriptsStore, modalStore, usersStore} = this.props;
        let project = projectsStore.project(scriptsStore.creating_project);
        e.preventDefault();
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-scripts-url'),
            data: JSON.stringify({name: scriptsStore.creating_name, project: project, owner: usersStore.session_user}),
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
        var r = confirm("Вы действительно хотите удалить скрипт: " + script.name);
        if (r == true) {
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
        }
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
    render() {
        const {scriptsStore, modalStore, projectsStore, usersStore} = this.props;
        return(
            <div className="col-md-12">
                <div className="col-md-2">
                    <button onClick={() => {
                        modalStore.modal = true;
                        modalStore.component = CreatingScript;
                    }} className="btn btn-success">+ Создать скрипт</button>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <input onChange={(e) => scriptsStore.filter_by_name = e.target.value} className="form-control" type="text" placeholder="Поиск по названию"/>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <select onChange={(e) => scriptsStore.filter_by_project = (e.target.value ? parseInt(e.target.value) : null)} className="form-control">
                            <option value="">-- Выберите проект --</option>
                            {projectsStore.projects.map((project, key)=>{
                                return(
                                    <option key={key} value={project.id}>{project.name}</option>
                                )
                            })}
                        </select>
                    </div>
                </div>
                <div className="col-md-3 pull-right">
                    <button className="btn btn-success">Заказать разработку скрипта</button>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <table className="table">
                            <thead>
                                <tr>
                                    <td>Название</td>
                                    <td>Проект</td>
                                    <td>Владелец</td>
                                    <td>Доступы</td>
                                    {
                                        //<td>Скопировать</td>
                                        //<td>Создано</td>
                                        //<td>Изменено</td>
                                    }
                                </tr>
                            </thead>
                            <tbody>
                            {scriptsStore.filteredScripts.map((script, key)=>{
                                return (
                                    <tr key={key}>
                                        <td><Link to={'/tables/' + script.id + ''}>{script.name}</Link></td>
                                        <td>{script.project.name}</td>
                                        <td>{script.owner.email}</td>
                                        <td>
                                            <MultiSelectField
                                                options={(() => {
                                                    let options = script.accesses.map(access => {
                                                        return {value: access.user.id, label: access.user.email, selected: true};
                                                    });
                                                    usersStore.users.map(user => {
                                                        if(options.length > 0 ? options.find(option => {return user.id !== option.value}) : true) {
                                                            options.push({value: user.id, label: user.email});
                                                        }
                                                    });
                                                    return options;
                                                })()}
                                                onChange={(selects) => {
                                                    this.setAccesses(selects.map(select => {
                                                        return {script: script, user: usersStore.users.find(user => {return select.value === user.id})}
                                                    }), script);
                                                }}/>
                                        </td>
                                        {
                                            //<td>Скопировать</td>
                                            //<td>{script.date}</td>
                                            //<td>{script.date_mod}</td>
                                        }
                                        <td className="text-right">
                                            <button className="btn btn-default" onClick={()=>{
                                                scriptsStore.editing = script;
                                                modalStore.modal = true;
                                                modalStore.component = EditingScript
                                            }}>Ред.</button>
                                        </td>
                                        <td className="text-right">
                                            <button className="btn btn-danger" onClick={()=>{this.deleteScript(script)}}>Удалить</button>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <ModalWrapper scriptsStore={scriptsStore} projectsStore={projectsStore} modalStore={modalStore} createScript={this.createScript.bind(this)} updateScript={this.updateScript.bind(this)}/>
            </div>
        );
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
                            <select onChange={(e) => scriptsStore.creating_project = (e.target.value ? parseInt(e.target.value) : null)} name="project" className="form-control">
                                <option value="">-- Выберите проект --</option>
                                {projectsStore.projects.map((project, key)=>{
                                    return(
                                        <option key={key} value={project.id}>{project.name}</option>
                                    )
                                })}
                            </select>
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
        const {projectsStore, scriptsStore} = this.props;
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
                                <select onChange={(e) => scriptsStore.editing.project = (e.target.value ? projectsStore.project(parseInt(e.target.value)) : null)} value={scriptsStore.editing.project.id} name="project" className="form-control">
                                    {projectsStore.projects.map((project, key)=>{
                                        return(
                                            <option key={key} value={project.id}>{project.name}</option>
                                        )
                                    })}
                                </select>
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
