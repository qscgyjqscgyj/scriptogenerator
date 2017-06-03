import * as React from 'react';
import $ from 'jquery';
import {observer} from 'mobx-react';
import update from 'react-addons-update';
import {ModalWrapper} from './modal';
import {Link} from 'react-router';
import {Sort} from './sort';
import {AccessableComponent} from './access';
import {scriptsIsLoaded} from './scriptsIsLoaded';
import {Tooltip} from './tooltip';
import Select from 'react-select';

@observer
class Tables extends AccessableComponent {
    componentWillMount() {
        const {scriptsStore} = this.props;
        const script = scriptsStore.script(this.props.params.script);
        if(script && !script.data.length > 0) {
            scriptsStore.getScriptData(script);
        }
    }

    openTableEditingModalForm(table) {
        const {scriptsStore, modalStore} = this.props;
        let script = scriptsStore.script(this.props.params.script);

        scriptsStore.editing = table;
        modalStore.open_modal(
            React.createElement(EditingTable, {
                scriptsStore: scriptsStore,
                script: script,
                modalStore: modalStore,
            })
        );
    }

    openTableCloningModalForm(table) {
        const {scriptsStore, modalStore} = this.props;
        let script = scriptsStore.script(this.props.params.script);

        modalStore.open_modal(
            React.createElement(CloningTable, {
                scriptsStore: scriptsStore,
                script: script,
                table: table,
                modalStore: modalStore,
            })
        );
    }

    deleteTableHandler(table) {
        const {scriptsStore} = this.props;
        let script = scriptsStore.script(this.props.params.script);

        scriptsStore.deleteTable(script, table);
    }

    render() {
        const {scriptsStore, modalStore, usersStore} = this.props;
        if(usersStore.session_user) {
            let script = scriptsStore.script(this.props.params.script);
            let access = this.access(usersStore, script);
            if(script && script.data && access) {
                return(
                    <div className="col-md-12">
                        {access.edit ?
                            <div className="row list_controls">
                                <div className="col-md-2">
                                    <button onClick={() => {
                                        scriptsStore.createTable(script);
                                    }} className="btn btn-success">+ Создать таблицу</button>
                                </div>
                                <div className="col-md-7">
                                    <h4>{script.name}</h4>
                                </div>
                            </div>
                        : null}
                        <div className="row">
                            {script.data.map((table, key)=>{
                                return (
                                    <div key={key} className="col-md-12 hovered_list_item list_item edit_icon_handler">
                                        <div className="col-md-6">
                                            <span className="inline_elements">
                                                <Link className="inline_element" to={scriptsStore.tableUrl(script, table)}>{table.name}</Link>
                                            </span>
                                        </div>

                                        <div className="col-md-3 pull-right">
                                            <div className="btn-group pull-right">
                                                {access.edit ?
                                                    <button className='btn btn-default btn-xs'
                                                            data-tip="Настройка таблицы"
                                                            onClick={this.openTableEditingModalForm.bind(this, table)}>
                                                        <i className="glyphicon glyphicon-cog"/>
                                                    </button>
                                                    : null}

                                                {access.edit ?
                                                    <button className='btn btn-default btn-xs'
                                                            data-tip="Скопировать таблицу"
                                                            onClick={this.openTableCloningModalForm.bind(this, table)}>
                                                        <i className="glyphicon glyphicon-download-alt"/>
                                                    </button>
                                                    : null}

                                                {access.edit ?
                                                    <button className='btn btn-danger btn-xs'
                                                            data-tip="Удалить таблицу"
                                                            onClick={this.deleteTableHandler.bind(this, table)}>
                                                        <i className="glyphicon glyphicon-remove"/>
                                                    </button>
                                                    : null}
                                            </div>
                                        </div>
                                        <Tooltip />
                                    </div>
                                )
                            })}
                        </div>
                        <ModalWrapper stores={[scriptsStore]} modalStore={modalStore}/>
                    </div>
                );
            }
            return null;
        }
        return null;
    }
}

@observer
class AvailableTables extends React.Component {
    render() {
        return React.cloneElement(React.createElement(Tables, this.props), {available: true});
    }
}

@observer
class EditingTable extends React.Component {
    render() {
        const {script, scriptsStore, modalStore} = this.props;
        if(scriptsStore.editing) {
            return (
                <div className="row">
                    <form action="" onSubmit={(e) => scriptsStore.updateTable(script, scriptsStore.editing, modalStore, e)}>
                        <div className="col-md-12">
                            <div className="form-group">
                                <input className="form-control" onChange={(e) => scriptsStore.editing.name = e.target.value} value={scriptsStore.editing.name} type="text" name="name" placeholder="Имя таблицы"/>
                            </div>
                        </div>

                        <CollsCreating scriptsStore={scriptsStore} script={script}/>

                        <div className="col-md-12">
                            <div className="form-group">
                                <button className="btn btn-success" disabled={scriptsStore.editing.colls_creating_error_message} type="submit">Сохранить</button>
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
class CloningTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            clone_to_current_script: true,
            to_script: null
        }
    }

    triggerCloneToCurrentScript() {
        this.setState(update(this.state, {$set: {clone_to_current_script: !this.state.clone_to_current_script, to_script: null}}))
    }

    setToScript(selected_script) {
        const {clone_to_current_script} = this.state;

        if(!clone_to_current_script) {
            const {scriptsStore} = this.props;
            let script = scriptsStore.script(selected_script.value);
            this.setState(update(this.state, {$set: {to_script: script}}))
        }
    }

    cloneTable(e) {
        e.preventDefault();
        const {modalStore, script, table} = this.props;
        const {clone_to_current_script, to_script} = this.state;
        let to_script_result;

        if(clone_to_current_script) {
            to_script_result = this.props.script;
        } else if(to_script) {
            to_script_result = to_script;
        }

        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-clone-table-url'),
            data: {
                current_script_id: script.id,
                to_script_id: to_script_result.id,
                table_id: table.id
            },
            success: (res) => {
                script.data = res.data;
                alert(`Таблица "${table.name}" скопирована в ${to_script_result.id === script.id ? 'текущий скрипт' : `скрипт "${to_script_result.name}"`}`);
                modalStore.close_modal();
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    getOptions() {
        const {scriptsStore} = this.props;

        return scriptsStore.scripts.map(script => {
            return {value: script.id, label: script.name};
        });
    }

    render() {
        const {scriptsStore} = this.props;
        const {clone_to_current_script, to_script} = this.state;

        return(
            <div className="row">
                <div className="col-md-12">
                    <h3>Копировать таблицу</h3>

                    <form action="" onSubmit={this.cloneTable.bind(this)}>
                        <div className="col-md-12">
                            <div className="form-group">
                                <div className="radio">
                                    <label>
                                        <input onChange={this.triggerCloneToCurrentScript.bind(this)} type="radio" name="clone_to_current_script" checked={clone_to_current_script}/>
                                        Копировать в текущий скрипт
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-12">
                            <div className="form-group">
                                <Select
                                    disabled={clone_to_current_script}
                                    value={to_script ? to_script.id : null}
                                    placeholder="Скопировать таблицу в скрипт"
                                    options={this.getOptions()}
                                    onChange={this.setToScript.bind(this)}/>
                            </div>
                        </div>

                        <div className="col-md-12">
                            <div className="form-group">
                                <button className="btn btn-success" disabled={!(clone_to_current_script || (!clone_to_current_script && to_script))} type="submit">Сохранить</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

@observer
class CollsCreating extends React.Component {
    onSort(items) {
        let {script, scriptsStore} = this.props;
        items.map((item, key) => {
            if(item.props.text) {
                if(scriptsStore.editing) {
                    scriptsStore.editing.text_coll_position = key;
                }
            } else {
                item.props.coll.position = key;
            }
        });
        scriptsStore.updateTable(script, scriptsStore.editing);
    }
    onSizeChange() {
        const {scriptsStore} = this.props;
        let colls = scriptsStore.editing ? scriptsStore.editing.colls : null;
        if(colls) {
            let full_size = parseInt(scriptsStore.editing.text_coll_size);

            colls.map((coll) => {
                full_size = full_size + parseInt(coll.size);
            });
            if(full_size > 100) {
                scriptsStore.editing.colls_creating_error_message = 'Общая ширина блоков не должна превышать 100%';
                    } else if(full_size < 100) {
                scriptsStore.editing.colls_creating_error_message = 'Общая ширина блоков не должна быть меньше 100%';
            } else if(scriptsStore.editing.colls_creating_error_message) {
                scriptsStore.editing.colls_creating_error_message = null;
            }
        }
    }
    render() {
        const {script, scriptsStore} = this.props;
        let colls = scriptsStore.editing ? scriptsStore.editing.colls : null;
        let colls_inputs = [];
        colls_inputs.push(
            <CollInput
                key={colls_inputs.length}
                name={scriptsStore.editing.text_coll_name}
                size={scriptsStore.editing.text_coll_size}
                position={scriptsStore.editing.text_coll_position}
                text={true}
                onChangeSize={(e) => {
                    if(scriptsStore.editing) {
                        scriptsStore.editing.text_coll_size = e.target.value;
                    }
                    return this.onSizeChange();
                }}
                onChangeName={(e) => {
                    if(scriptsStore.editing) {
                        scriptsStore.editing.text_coll_name = e.target.value;
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
                    deleteColl={() => {scriptsStore.deleteColl(script, scriptsStore.editing, colls, coll, key)}}
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
                            scriptsStore.createColl(script, scriptsStore.editing);
                            return this.onSizeChange();
                        }}>+ Добавить столбец</button>
                    </div>
                </div>
                {scriptsStore.editing.colls_creating_error_message ?
                    <div className="col-md-12">
                        <div className="alert alert-danger" role="alert">
                            <span className="glyphicon glyphicon-exclamation-sign"/>
                            <span className="sr-only">Ошибка:</span>
                            {scriptsStore.editing.colls_creating_error_message}
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
                                    this.props.deleteColl();
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

@observer
export class TablesWrapper extends React.Component {
    render() {
        return React.createElement(scriptsIsLoaded, {...this.props, renderComponent: Tables});
    }
}

@observer
export class AvailableTablesWrapper extends React.Component {
    render() {
        return React.createElement(scriptsIsLoaded, {...this.props, renderComponent: AvailableTables});
    }
}
