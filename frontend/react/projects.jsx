import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import ProjectsStore from '../mobx/projectsStore';
import {ModalWrapper} from './modal';

@observer
export class Projects extends React.Component {
    createProject(e) {
        const {projectsStore, modalStore} = this.props;
        e.preventDefault();
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-projects-url'),
            data: JSON.stringify({name: projectsStore.creating_name, owner: projectsStore.owner}),
            success: (res) => {
                projectsStore.createProjects(res.projects);
                modalStore.modal = false;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    deleteProject(project) {
        const {projectsStore, scriptsStore} = this.props;
        var r = confirm("Вы действительно хотите удалить проект: " + project.name);
        if (r == true) {
            $.ajax({
                method: 'DELETE',
                url: document.body.getAttribute('data-projects-url'),
                data: JSON.stringify({pk: project.id}),
                success: (res) => {
                    projectsStore.createProjects(res.projects);
                    scriptsStore.scripts = res.scripts;
                },
                error: (res) => {
                    console.log(res);
                }
            });
        }
    }
    updateProject(e) {
        const {scriptsStore, projectsStore, modalStore} = this.props;
        e.preventDefault();
        $.ajax({
            method: 'PUT',
            url: document.body.getAttribute('data-projects-url'),
            data: JSON.stringify(projectsStore.editing),
            success: (res) => {
                projectsStore.createProjects(res.projects);
                scriptsStore.scripts = res.scripts;
                modalStore.modal = false;
                projectsStore.editing = null;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    render() {
        const {filteredProjects} = this.props.projectsStore;
        const {projectsStore, modalStore} = this.props;
        return(
            <div className="col-md-12">
                <div className="col-md-2">
                    <button onClick={() => {
                        modalStore.modal = true;
                        modalStore.component = CreatingProject
                    }} className="btn btn-success">+ Создать проект</button>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <input onChange={(e) => projectsStore.filter_by_name = e.target.value} className="form-control" type="text" placeholder="Поиск по названию"/>
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
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProjects.map((project, key)=>{
                                    return (
                                        <tr key={key}>
                                            <td>{project.name}</td>
                                            <td className="text-right">
                                                <button className="btn btn-default" onClick={()=>{
                                                    projectsStore.editing = project;
                                                    modalStore.modal = true;
                                                    modalStore.component = EditingProject
                                                }}>Ред.</button>
                                            </td>
                                            <td className="text-right">
                                                <button className="btn btn-danger" onClick={()=>{this.deleteProject(project)}}>Удалить</button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <ModalWrapper projectsStore={projectsStore} modalStore={modalStore} createProject={this.createProject.bind(this)} updateProject={this.updateProject.bind(this)}/>
            </div>
        );
    }
}

@observer
class CreatingProject extends React.Component {
    render() {
        const {projectsStore} = this.props;
        return (
            <div className="row">
                <form action="" onSubmit={(e) => this.props.createProject(e)}>
                    <div className="col-md-12">
                        <div className="form-group">
                            <input className="form-control" onChange={(e) => projectsStore.creating_name = e.target.value} value={projectsStore.creating_name} type="text" name="name" placeholder="Имя проекта"/>
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
class EditingProject extends React.Component {
    render() {
        const {projectsStore} = this.props;
        if(projectsStore.editing) {
            return (
                <div className="row">
                    <form action="" onSubmit={(e) => {this.props.updateProject(e)}}>
                        <div className="col-md-12">
                            <div className="form-group">
                                <input className="form-control" onChange={(e) => {projectsStore.editing.name = e.target.value}} value={projectsStore.editing.name} type="text" name="name" placeholder="Имя проекта"/>
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
