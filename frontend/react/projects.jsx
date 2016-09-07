import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import Modal from 'react-modal';
import ProjectsStore from '../mobx/projectsStore';

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
export class Projects extends React.Component {
    createProject(e) {
        const {projectsStore, modalStore} = this.props;
        e.preventDefault();
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-projects-url'),
            data: JSON.stringify({name: projectsStore.creating_name, owner: projectsStore.owner}),
            success: (res) => {
                projectsStore.projects = res;
                modalStore.modal = false;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    render() {
        const {filteredProjects, projects} = this.props.projectsStore;
        const {projectsStore, modalStore} = this.props;
        return(
            <div className="col-md-12">
                <div className="col-md-2">
                    <button onClick={() => modalStore.modal = true} className="btn btn-success">+ Создать проект</button>
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
                    onAfterOpen={() => {modalStore.creating_name = ''}}
                    style={customModalStyles}>

                    <div className="row">
                        <form action="" onSubmit={(e) => this.createProject(e)}>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <input className="form-control" onChange={(e) => projectsStore.creating_name = e.target.value} type="text" name="name" placeholder="Имя проекта"/>
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

export class ProjectsWrapper extends React.Component {
    render() {
        return(
            <Projects modalStore={this.props.modalStore} scripteStore={this.props.scriptsStore} projectsStore={this.props.projectsStore}/>
        )
    }
}
