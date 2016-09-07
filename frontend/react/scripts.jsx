import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import Modal from 'react-modal';


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
export class Scripts extends React.Component {
    componentDidMount() {
        const {scriptsStore, modalStore} = this.props;
        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-scripts-url'),
            success: (res) => {
                scriptsStore.scripts = res;
                modalStore.modal = false;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    project(id) {
        const {projectsStore} = this.props;
        return projectsStore.projects.find((project => project.id === id));
    }
    createScript(e) {
        const {scriptsStore, modalStore} = this.props;
        let project = this.project(scriptsStore.creating_project);
        e.preventDefault();
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-scripts-url'),
            data: JSON.stringify({name: scriptsStore.creating_name, project: project, owner: project.owner}),
            success: (res) => {
                scriptsStore.scripts = res;
                modalStore.modal = false;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    render() {
        const {filteredScripts} = this.props.scriptsStore;
        const {projects} = this.props.projectsStore;
        const {scriptsStore, modalStore} = this.props;
        return(
            <div className="col-md-12">
                <div className="col-md-2">
                    <button onClick={() => scriptsStore.modal = true} className="btn btn-success">+ Создать скрипт</button>
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
                            {projects.map((project, key)=>{
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
                                    <td>Свойтсва</td>
                                    <td>Скопировать</td>
                                    <td>Создано</td>
                                    <td>Изменено</td>
                                </tr>
                            </thead>
                            <tbody>
                            {filteredScripts.map((script, key)=>{
                                return (
                                    <tr key={key}>
                                        <td>{script.name}</td>
                                        <td>{script.project.name}</td>
                                        <td>Свойтсва</td>
                                        <td>Скопировать</td>
                                        <td>{script.date}</td>
                                        <td>{script.date_mod}</td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Modal
                    isOpen={modalStore.modal}
                    onRequestClose={() => modalStore.modal = false}
                    onAfterOpen={() => {scriptsStore.creating_name = '';scriptsStore.creating_project = null}}
                    style={customModalStyles}>

                    <div className="row">
                        <form action="" onSubmit={(e) => this.createScript(e)}>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <input className="form-control" onChange={(e) => scriptsStore.creating_name = e.target.value} type="text" name="name" placeholder="Имя скрипта"/>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <select onChange={(e) => scriptsStore.creating_project = (e.target.value ? parseInt(e.target.value) : null)} name="project" className="form-control">
                                        <option value="">-- Выберите проект --</option>
                                        {projects.map((project, key)=>{
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
                </Modal>
            </div>
        );
    }
}

export class ScriptsWrapper extends React.Component {
    render() {
        return(
            <Scripts modalStore={this.props.modalStore} scriptsStore={this.props.scriptsStore} projectsStore={this.props.projectsStore}/>
        )
    }
}
