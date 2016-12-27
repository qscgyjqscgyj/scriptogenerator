import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import {ModalWrapper} from './modal';
import {Coll} from '../mobx/tablesStore';
import {Link} from 'react-router';
import {Sort} from './sort';
import {AccessableComponent} from './access';
import confirm from './confirm';

@observer
export class Tables extends AccessableComponent {
    componentWillMount() {
        const {tablesStore} = this.props;
        tablesStore.pullTables(this.props.params.script);
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
        const {tablesStore} = this.props;
        confirm("Вы действительно хотите удалить таблицу: " + table.name).then(
            (result) => {
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
            },
            (result) => {
                console.log('cancel called');
            }
        )
    }
    render() {
        const {projectsStore, scriptsStore, tablesStore, modalStore, usersStore} = this.props;
        if(usersStore.session_user) {
            let script = scriptsStore.script(this.props.params.script);
            let access = this.access(usersStore, script);
            if(script && access) {
                return(
                    <div className="col-md-12">
                        {access.edit ?
                            <div>
                                <div className="col-md-2">
                                    <button onClick={() => {
                                        modalStore.modal = true;
                                        modalStore.component = React.createElement(CreatingTable, {
                                            tablesStore: tablesStore,
                                            modalStore: modalStore,
                                            createTable: this.createTable.bind(this),
                                            updateTable: (e) => {tablesStore.updateTable(e, modalStore)}
                                        });
                                    }} className="btn btn-success">+ Создать таблицу</button>
                                </div>
                                <div className="col-md-7">
                                    <h4>{script.name}</h4>
                                </div>
                            </div>
                        : null}
                        <div className="row">
                            <div className="col-md-12">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <td>Название таблицы</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tablesStore.tables.map((table, key)=>{
                                            return (
                                                <tr key={key}>
                                                    <td>
                                                        <Link to={
                                                            '/tables/' + this.props.params.script +
                                                            '/table/' + table.id +
                                                            (access.edit ? '/edit/' : '/share/')
                                                        }>{table.name}</Link>
                                                    </td>
                                                    <td className="text-right">
                                                        {access.edit ?
                                                            <button className="btn btn-default" onClick={()=>{
                                                                tablesStore.editing = table;
                                                                modalStore.modal = true;
                                                                modalStore.component = React.createElement(EditingTable, {
                                                                    tablesStore: tablesStore,
                                                                    modalStore: modalStore,
                                                                    createTable: this.createTable.bind(this),
                                                                    updateTable: (e) => {tablesStore.updateTable(e, modalStore)}
                                                                });
                                                            }}>Ред.</button>
                                                        : null}
                                                    </td>
                                                    <td className="text-right">
                                                        {access.edit ?
                                                            <button className="btn btn-danger" onClick={()=>{this.deleteTable(table)}}>Удалить</button>
                                                        : null}
                                                    </td>
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
        return null;
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
                            <button className="btn btn-success" disabled={tablesStore.colls_creating_error_message} type="submit">Создать</button>
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
                                <button className="btn btn-success" disabled={tablesStore.colls_creating_error_message} type="submit">Сохранить</button>
                            </div>
                        </div>
                    </form>
                </div>
            )
        }
        return null;
    }
}

@observer
class CollsCreating extends React.Component {
    deleteColl(colls, coll, i) {
        const {tablesStore} = this.props;
        confirm("Вы действительно хотите удалить столбец: " + coll.name).then(
            (result) => {
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
            },
            (result) => {
                console.log('cancel called');
            }
        );
    }
    onSort(items) {
        let {tablesStore} = this.props;
        items.map((item, key) => {
            if(item.props.text) {
                if(tablesStore.editing) {
                    tablesStore.editing.text_coll_position = key;
                } else {
                    tablesStore.creating_text_coll_position = key;
                }
            } else {
                item.props.coll.position = key;
            }
        });
        tablesStore.updateTable(null, false);
    }
    onSizeChange() {
        const {tablesStore} = this.props;
        let colls = tablesStore.editing ? tablesStore.editing.colls : tablesStore.creating_colls;
        let full_size = parseInt(tablesStore.editing ? tablesStore.editing.text_coll_size : tablesStore.creating_text_coll_size);

        colls.map((coll) => {
            full_size = full_size + parseInt(coll.size);
        });
        console.log(full_size);
        if(full_size > 100) {
            tablesStore.colls_creating_error_message = 'Общая ширина блоков не должна привышать 100%';
        } else if(tablesStore.colls_creating_error_message) {
            tablesStore.colls_creating_error_message = null;
        }
    }
    render() {
        const {tablesStore} = this.props;
        let colls = tablesStore.editing ? tablesStore.editing.colls : tablesStore.creating_colls;
        let text_coll_name = tablesStore.editing ? tablesStore.editing.text_coll_name : tablesStore.creating_text_coll_name;
        let text_coll_size = tablesStore.editing ? tablesStore.editing.text_coll_size : tablesStore.creating_text_coll_size;
        let text_coll_position = tablesStore.editing ? tablesStore.editing.text_coll_position : tablesStore.creating_text_coll_position;

        let colls_inputs = [];
        colls_inputs.push(
            <CollInput
                key={colls_inputs.length}
                name={text_coll_name}
                size={text_coll_size}
                position={text_coll_position}
                text={true}
                onChangeSize={(e) => {
                    if(tablesStore.editing) {
                        tablesStore.editing.text_coll_size = e.target.value;
                    } else {
                        tablesStore.creating_text_coll_size = e.target.value;
                    }
                    return this.onSizeChange();
                }}
                onChangeName={(e) => {
                    if(tablesStore.editing) {
                        tablesStore.editing.text_coll_name = e.target.value;
                    } else {
                        tablesStore.creating_text_coll_name = e.target.value;
                    }
                }}/>
        );
        colls.map((coll, key) => {
            colls_inputs.push(
                <CollInput
                    key={key}
                    name={coll.name}
                    size={coll.size}
                    position={coll.position}
                    index={key}
                    text={false}
                    coll={coll}
                    colls={colls}
                    deleteColl={this.deleteColl.bind(this)}
                    onChangeSize={(e) => {coll.size = e.target.value; return this.onSizeChange()}}
                    onChangeName={(e) => {coll.name = e.target.value}}/>
            )
        });
        colls_inputs = colls_inputs.sort((a, b) => {
                if (a.props.position > b.props.position) {return 1}
                if (a.props.position < b.props.position) {return -1}
                return 0;
            }
        );

        return (
            <div className="col-md-12">
                <div className="col-md-12">
                    <Sort onSort={this.onSort.bind(this)}>
                        {colls_inputs.map((coll, key) => {
                            return coll;
                        })}
                    </Sort>
                    <div className="form-group">
                        <button className="btn btn-info" type="button" onClick={(e) => {
                            e.preventDefault();
                            colls.push(new Coll(tablesStore.editing));
                            return this.onSizeChange();
                        }}>+ Добавить столбец</button>
                    </div>
                </div>
                {tablesStore.colls_creating_error_message ?
                    <div className="col-md-12">
                        <div className="alert alert-danger" role="alert">
                            <span className="glyphicon glyphicon-exclamation-sign"/>
                            <span className="sr-only">Ошибка:</span>
                            {tablesStore.colls_creating_error_message}
                        </div>
                    </div>
                : null}
            </div>
        )
    }
}

class CollInput extends React.Component {
    render() {
        const {coll} = this.props;
        let links = [];
        if(coll && coll.categories && coll.categories.length > 0) {
            coll.categories.map(category => {
                if(category.links.length > 0) {
                    category.links.map(link => {
                        links.push(link);
                    });
                }
            });
        }
        return(
            <div className="form-inline coll_form">
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Название столбца"
                        onChange={this.props.onChangeName.bind(this)}
                        value={this.props.name}/>
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Размер столбца (в %)"
                        onChange={this.props.onChangeSize.bind(this)}
                        value={this.props.size}/>
                </div>

                {!this.props.text ?
                    <div className="form-group">
                        {'Ссылки: ' + links.length}
                    </div>
                : null}

                {!this.props.text ?
                    <div className="form-group">
                        <i
                            className="glyphicon glyphicon-remove icon red_icon"
                            aria-hidden="true"
                            onClick={(e)=>{
                                e.preventDefault();
                                if(this.props.coll.id) {
                                    this.props.deleteColl(this.props.colls, this.props.coll, this.props.index);
                                } else {
                                    this.props.colls.splice(this.props.index, 1);
                                }
                            }}/>
                    </div>
                : null}
            </div>
       )
    }
}

export class AvailableTables extends React.Component {
    render() {
        return React.cloneElement(React.createElement(Tables, this.props), {available: true});
    }
}
