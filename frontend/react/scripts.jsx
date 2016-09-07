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
        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-scripts-url'),
            success: (res) => {
                this.props.store.scripts = res;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    createScript(e) {
        const {store} = this.props;
        e.preventDefault();
        let project = store.project(store.creating_project);
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-scripts-url'),
            data: JSON.stringify({name: store.creating_name, project: project, owner: project.owner}),
            success: (res) => {
                store.scripts = res;
                store.modal = false;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    render() {
        const {filteredScripts, projects} = this.props.store;
        return(
            <div className="col-md-12">
                <div className="col-md-2">
                    <button onClick={() => this.props.store.modal = true} className="btn btn-success">+ Создать скрипт</button>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <input onChange={(e) => this.props.store.filter_by_name = e.target.value} className="form-control" type="text" placeholder="Поиск по названию"/>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="form-group">
                        <select onChange={(e) => this.props.store.filter_by_project = (e.target.value ? parseInt(e.target.value) : null)} className="form-control">
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
                    isOpen={this.props.store.modal}
                    onRequestClose={() => this.props.store.modal = false}
                    onAfterOpen={() => {this.props.store.creating_name = '';this.props.store.creating_project = null}}
                    style={customModalStyles}>

                    <div className="row">
                        <form action="" onSubmit={(e) => this.createScript(e)}>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <input className="form-control" onChange={(e) => this.props.store.creating_name = e.target.value} type="text" name="name" placeholder="Имя скрипта"/>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <select onChange={(e) => this.props.store.creating_project = (e.target.value ? parseInt(e.target.value) : null)} name="project" className="form-control">
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
