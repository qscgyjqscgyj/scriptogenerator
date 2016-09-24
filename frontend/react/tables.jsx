import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import {ModalWrapper} from './modal';
import {Coll} from '../mobx/tablesStore';

@observer
export class Tables extends React.Component {
    componentWillMount() {
        const {tablesStore} = this.props;
        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-tables-url'),
            data: {id: this.props.params.script},
            success: (res) => {
                tablesStore.tables = res.tables;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    createTable(e) {
        const {modalStore, tablesStore, scriptsStore} = this.props;
        e.preventDefault();
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-tables-url'),
            data: JSON.stringify({
                name: tablesStore.creating_name,
                colls: tablesStore.creating_colls,
                text_coll_name: tablesStore.creating_text_coll_name,
                text_coll_size: tablesStore.creating_text_coll_size,
                text_coll_position: tablesStore.creating_text_coll_position,
                script: tablesStore.creating_script ? tablesStore.creating_script : parseInt(this.props.params.script)
                //script: scriptsStore.script((tablesStore.creating_script ? tablesStore.creating_script : parseInt(this.props.params.script)))
            }),
            success: (res) => {
                tablesStore.tables = res.tables;
                modalStore.modal = false;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    deleteTable(table) {
        var r = confirm("Вы действительно хотите удалить таблицу: " + table.name);
        const {tablesStore} = this.props;
        if (r == true) {
            $.ajax({
                method: 'DELETE',
                url: document.body.getAttribute('data-tables-url'),
                data: JSON.stringify(table),
                success: (res) => {
                    tablesStore.tables = res.tables;
                },
                error: (res) => {
                    console.log(res);
                }
            });
        }
    }
    updateTable(e) {
        const {modalStore, tablesStore} = this.props;
        e.preventDefault();
        $.ajax({
            method: 'PUT',
            url: document.body.getAttribute('data-tables-url'),
            data: JSON.stringify(tablesStore.editing),
            success: (res) => {
                tablesStore.tables = res.tables;
                tablesStore.editing = null;
                modalStore.modal = false;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    render() {
        const {projectsStore, scriptsStore, tablesStore, modalStore} = this.props;
        let script = scriptsStore.script(this.props.params.script);
        if(script) {
            return(
                <div className="col-md-12">
                    <div className="col-md-2">
                        <button onClick={() => {
                            modalStore.modal = true;
                            modalStore.component = CreatingTable
                        }} className="btn btn-success">+ Создать таблицу</button>
                    </div>
                    <div className="col-md-3 pull-right">
                        <button className="btn btn-success">Заказать разработку скрипта</button>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <td>Название таблицы</td>
                                        <td>Свойства</td>
                                        <td>Скопировать</td>
                                        <td>Создано</td>
                                        <td>Изменено</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tablesStore.tables.map((table, key)=>{
                                        return (
                                            <tr key={key}>
                                                <td>{table.name}</td>
                                                <td className="text-right">
                                                    <button className="btn btn-default" onClick={()=>{
                                                        tablesStore.editing = table;
                                                        modalStore.modal = true;
                                                        modalStore.component = EditingTable
                                                    }}>Ред.</button>
                                                </td>
                                                <td className="text-right">
                                                    <button className="btn btn-danger" onClick={()=>{this.deleteTable(table)}}>Удалить</button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <ModalWrapper scriptsStore={scriptsStore} tablesStore={tablesStore} projectsStore={projectsStore} modalStore={modalStore} createTable={this.createTable.bind(this)} updateTable={this.updateTable.bind(this)}/>
                </div>
            );
        }
        return <div></div>;
    }
}

@observer
class CreatingTable extends React.Component {
    render() {
        const {tablesStore} = this.props;
        return (
            <div className="row">
                <form action="" onSubmit={(e) => this.props.createTable(e)}>
                    <div className="col-md-12">
                        <div className="form-group">
                            <input className="form-control" onChange={(e) => tablesStore.creating_name = e.target.value} value={tablesStore.creating_name} type="text" name="name" placeholder="Имя таблицы"/>
                        </div>
                    </div>

                    <CollsCreating tablesStore={tablesStore}/>

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
class EditingTable extends React.Component {
    render() {
        const {tablesStore} = this.props;
        if(tablesStore.editing) {
            return (
                <div className="row">
                    <form action="" onSubmit={(e) => this.props.updateTable(e)}>
                        <div className="col-md-12">
                            <div className="form-group">
                                <input className="form-control" onChange={(e) => tablesStore.editing.name = e.target.value} value={tablesStore.editing.name} type="text" name="name" placeholder="Имя таблицы"/>
                            </div>
                        </div>

                        <CollsCreating tablesStore={tablesStore}/>

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
class CollsCreating extends React.Component {
    deleteColl(colls, coll, i) {
        var r = confirm("Вы действительно хотите удалить столбец: " + coll.name);
        const {tablesStore} = this.props;
        if (r == true) {
            $.ajax({
                method: 'DELETE',
                url: document.body.getAttribute('data-colls-url'),
                data: JSON.stringify(coll),
                success: (res) => {
                    tablesStore.tables = res.tables;
                    colls.splice(i, 1);
                },
                error: (res) => {
                    console.log(res);
                }
            });
        }
    }
    render() {
        const {tablesStore} = this.props;
        let colls = tablesStore.editing ? tablesStore.editing.colls : tablesStore.creating_colls;
        let text_coll_name = tablesStore.editing ? tablesStore.editing.text_coll_name : tablesStore.creating_text_coll_name;
        let text_coll_size = tablesStore.editing ? tablesStore.editing.text_coll_size : tablesStore.creating_text_coll_size;
        return (
            <div className="col-md-12">
                <table className="table">
                    <tbody>
                        <tr>
                            <td>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Название столбца"
                                    onChange={(e) => {
                                        if(tablesStore.editing) {
                                            tablesStore.editing.text_coll_name = e.target.value;
                                        } else {
                                            tablesStore.creating_text_coll_name = e.target.value;
                                        }
                                    }}
                                    value={text_coll_name}
                                />
                            </td>
                            <td>Текст</td>
                            <td>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Размер столбца (в %)"
                                    onChange={(e) => {
                                        if(tablesStore.editing) {
                                            tablesStore.editing.text_coll_size = e.target.value;
                                        } else {
                                            tablesStore.creating_text_coll_size = e.target.value;
                                        }
                                    }}
                                    value={text_coll_size}
                                />
                            </td>
                        </tr>
                        {colls.map((coll, i) => {
                            return (
                                <tr key={i}>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Название столбца"
                                            onChange={(e) => {coll.name = e.target.value}}
                                            value={coll.name}
                                        />
                                    </td>
                                    <td>Ссылки</td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Размер столбца (в %)"
                                            onChange={(e) => {coll.size = e.target.value}}
                                            value={coll.size}
                                        />
                                    </td>
                                    <td className="text-right">
                                        <button className="btn btn-danger" onClick={(e)=>{
                                            e.preventDefault();
                                            if(coll.id) {
                                                this.deleteColl(colls, coll, i);
                                            } else {
                                                colls.splice(i, 1);
                                            }
                                        }}>Удалить</button>
                                    </td>
                                </tr>
                            )
                        })}
                        <tr>
                            <td>
                                <button className="btn btn-success" onClick={(e) => {e.preventDefault();colls.push(new Coll(tablesStore.editing))}}>+ Добавить столбец</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}