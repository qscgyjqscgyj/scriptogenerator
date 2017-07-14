import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import Modal from 'react-modal';
import {Link} from 'react-router';
import Select from 'react-select';
import {Paginator, getChunkedArray} from './pagination';
import {
    DelegationScriptAccessAdditionalService,
    OfflineScriptExportAdditionalService,
    UnlimOfflineScriptExportAdditionalService
} from './profile/payment';
import confirm from './confirm';
import {Tooltip} from './tooltip';

const STATIC_URL = document.body.getAttribute('data-static-url');

@observer
export class Scripts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cloning: null,
            interval: null,
            page: 0,
        }
    }

    componentDidMount() {
        this.checkingCloningScripts();
    }

    clearInterval() {
        const {scriptsStore} = this.props;
        const {interval} = this.state;
        clearInterval(interval);
        scriptsStore.createCloningProcess(0);
        this.setState(update(this.state, {interval: {$set: null}}));
    }

    componentWillUnmount() {
        return this.clearInterval();
    }

    checkingCloningScripts() {
        const {scriptsStore, usersStore} = this.props;
        const {interval} = this.state;
        const inactive_scripts = scriptsStore.scripts.filter(script => !script.active);
        if (inactive_scripts && inactive_scripts.length > 0) {
            scriptsStore.createCloningProcess(inactive_scripts.length);
            if (!interval) {
                this.setState(update(this.state, {
                    interval: {
                        $set: setInterval(function () {
                            scriptsStore.updateScripts(usersStore, true);
                        }, 2000)
                    }
                }));
            }
        } else if (!inactive_scripts && interval) {
            this.clearInterval()
        }
    }

    updateScript(script) {
        const {scriptsStore, modalStore} = this.props;
        if (script.name) {
            scriptsStore.updateScript(script, modalStore)
        } else {
            alert('Введите название скрипта');
        }
    }

    createScript(e) {
        const {scriptsStore, modalStore, usersStore} = this.props;
        e.preventDefault();
        if (scriptsStore.creating_name) {
            scriptsStore.createCloningProcess(1);
            $.ajax({
                method: 'POST',
                url: document.body.getAttribute('data-scripts-url'),
                data: JSON.stringify({
                    name: scriptsStore.creating_name,
                    owner: usersStore.session_user,
                    template: scriptsStore.creating_template
                }),
                success: (res) => {
                    scriptsStore.scripts = res.scripts;
                    scriptsStore.resetCreating();
                    modalStore.close_modal();
                    this.checkingCloningScripts();
                },
                error: (res) => {
                    console.log(res);
                }
            });

        } else {
            alert('Введите имя скрипта');
        }
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

    openDelegationModalForm(script) {
        const {modalStore, usersStore, scriptsStore} = this.props;

        modalStore.open_modal(
            React.createElement(DelegationScript, {
                script: script,
                usersStore: usersStore,
                scriptsStore: scriptsStore,
                modalStore: modalStore
            }),
            'Перенос скрипта'
        )
    }

    openScriptExportCreatingModalForm(script) {
        const {modalStore, usersStore} = this.props;

        modalStore.open_modal(
            React.createElement(CreateOfflineScriptExport, {
                script: script,
                usersStore: usersStore,
                modalStore: modalStore
            }),
            'Выгрузка скрипта',
        )
    }

    cloneScript(script) {
        const {scriptsStore, usersStore} = this.props;
        scriptsStore.createCloningProcess(1);
        this.setState(update(this.state, {cloning: {$set: script}}), () => {
            $.ajax({
                method: 'POST',
                url: document.body.getAttribute('data-clone-script-url'),
                data: {script: script.id},
                success: (res) => {
                    scriptsStore.scripts = res.scripts;
                },
                error: (res) => {
                    console.log(res);
                }
            });
        });
    }

    setPage(page) {
        this.setState(update(this.state, {page: {$set: page}}));
    }

    getScriptsData() {
        const {scriptsStore, available} = this.props;
        let scripts = scriptsStore.filteredScripts(available);
        if (scripts && scripts.length > 0) {
            // let chunked_scripts = getChunkedArray(scripts, 20);
            let chunked_scripts = [];
            let i, j, chunk = 20;
            for (i = 0, j = scripts.length; i < j; i += chunk) {
                chunked_scripts.push(scripts.slice(i, i + chunk));
            }
            return {
                scripts: chunked_scripts[this.state.page],
                pages: chunked_scripts.length
            };
        }
        return {
            scripts: scripts,
            pages: 0
        }
    }

    render() {
        const {scriptsStore, modalStore, usersStore, available} = this.props;
        let scripts_data = this.getScriptsData();
        if (usersStore.session_user && (scriptsStore.scripts || scriptsStore.available_scripts)) {
            return (
                <div className="col-md-12">
                    {!available ?
                        <div>
                            <div className="col-md-2">
                                <button onClick={() => {
                                    modalStore.open_modal(
                                        React.createElement(CreatingScript, {
                                            scriptsStore: scriptsStore,
                                            modalStore: modalStore,
                                            available: available
                                        }),
                                        'Создание скрипта',
                                        this.createScript.bind(this),
                                        'Создать'
                                    );
                                }} className="btn btn-success">+ Создать скрипт
                                </button>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <input onChange={(e) => {
                                        scriptsStore.filter_by_name = e.target.value;
                                        this.setPage(0);
                                    }} className="form-control" type="text" placeholder="Поиск по названию"/>
                                </div>
                            </div>
                            {scripts_data.pages > 1 ?
                                <div className="col-md-5">
                                    <Paginator
                                        pages={scripts_data.pages}
                                        current_page={this.state.page}
                                        objects_length={scripts_data.scripts.length}
                                        setPage={this.setPage.bind(this)}
                                        unmargin={true}
                                    />
                                </div>
                                : null}
                        </div>
                        : null}

                    <div className="row">
                        {scripts_data.scripts.map((script, key) => {
                            let access = (available ? script.accesses.find(access => {
                                return access.user.id === usersStore.session_user.id
                            }) : null);
                            return (
                                <div key={key} className="col-md-12 hovered_list_item list_item edit_icon_handler">
                                    <div className="col-md-6">
                                        {script.active ?
                                            <span className="inline_elements">
                                                {(available && script.available ? access.edit : true) ?
                                                    <i className="glyphicon glyphicon-edit edit_icon inline_element"
                                                       data-tip="Редактировать скрипт"
                                                       onClick={() => {
                                                           modalStore.open_modal(
                                                               React.createElement(EditingScript, {
                                                                   script: script,
                                                                   scriptsStore: scriptsStore,
                                                                   modalStore: modalStore,
                                                                   available: available
                                                               }),
                                                               'Редактирование скрипта',
                                                               this.updateScript.bind(this, script)
                                                           );
                                                       }}/>
                                                    :
                                                    <i className="glyphicon glyphicon-edit hidden_edit_icon inline_element"/>
                                                }

                                                <Link className="inline_element"
                                                      to={scriptsStore.scriptUrl(script)}>{script.name}</Link>
                                            </span>
                                            :
                                            <span className="inline_elements">
                                                <i className="glyphicon glyphicon-edit hidden_icon inline_element"/>
                                                <span>{script.name}</span>
                                            </span>
                                        }
                                    </div>
                                    <div className="col-md-3">
                                        {available ?
                                            <span>{script.owner.email}</span>
                                            : null}
                                    </div>
                                    <div className="col-md-3">
                                        <div className="btn-group pull-right">
                                            {!available ?
                                                <button className='btn btn-default btn-xs'
                                                        data-tip="Копировать скрипт"
                                                        onClick={() => {
                                                            this.cloneScript(script)
                                                        }}>
                                                    <i className="glyphicon glyphicon-copy"/>
                                                </button>
                                                : null}

                                            {!available ?
                                                <button className="btn btn-default btn-xs"
                                                        data-tip="Права доступа к скрипту"
                                                        onClick={() => {
                                                            usersStore.getTeam();
                                                            scriptsStore.getScriptData(script, () => {
                                                                modalStore.open_modal(
                                                                    React.createElement(Accesses, {
                                                                        ...this.props,
                                                                        script: script
                                                                    }),
                                                                    'Редактирование прав доступа к скрипту'
                                                                )
                                                            });
                                                        }}>
                                                    <i className="glyphicon glyphicon-user"/>
                                                </button>
                                                : null}

                                            {(available && script.available ? access.edit : true) ?
                                                <button className="btn btn-default btn-xs"
                                                        data-tip="Редактировать структуру скрипта"
                                                        onClick={() => {
                                                            this.props.router.push('/tables/' + script.id + '/')
                                                        }}>
                                                    <i className="glyphicon glyphicon-cog"/>
                                                </button>
                                                : null}

                                            {!available ?
                                                <button className='btn btn-default btn-xs'
                                                        data-tip="Перенести скрипт"
                                                        onClick={this.openDelegationModalForm.bind(this, script)}>
                                                    <i className="glyphicon glyphicon-arrow-right"/>
                                                </button>
                                                : null}

                                            {!available ?
                                                <button className='btn btn-default btn-xs'
                                                        data-tip="Скачать скрипт"
                                                        onClick={this.openScriptExportCreatingModalForm.bind(this, script)}>
                                                    <i className="glyphicon glyphicon-download-alt"/>
                                                </button>
                                                : null}

                                            {!available ?
                                                <button className="btn btn-danger btn-xs"
                                                        data-tip="Удалить скрипт"
                                                        onClick={() => {
                                                            this.deleteScript(script)
                                                        }}>
                                                    <i className="glyphicon glyphicon-remove"/>
                                                </button>
                                                : null}
                                        </div>
                                    </div>
                                    {!script.active ?
                                        <p className="loading">Скрипт создается <img
                                            src={STATIC_URL + 'img/loading.gif'}/></p>
                                        : null}

                                    <Tooltip />
                                </div>
                            )
                        })}

                        {scripts_data.pages > 1 ?
                            <div className="col-md-12">
                                <Paginator
                                    pages={scripts_data.pages}
                                    current_page={this.state.page}
                                    objects_length={scripts_data.scripts.length}
                                    setPage={this.setPage.bind(this)}
                                />
                            </div>
                            : null}
                    </div>
                    <Tooltip />
                </div>
            );
        }
        return null;
    }
}

@observer
class CreatingScript extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {scriptsStore} = this.props;
        return (
            <div className="row">
                <div className="col-md-12">
                    <div className='form-group'>
                        <input className="form-control" onChange={(e) => {
                            scriptsStore.creating_name = e.target.value
                        }} value={scriptsStore.creating_name} type="text" name="name" placeholder="Имя скрипта"/>
                    </div>
                </div>
                <div className="col-md-12">
                    <div className="radio">
                        <label>
                            <input
                                type="radio"
                                name="optionsRadios"
                                id="optionsRadios1"
                                value="option1"
                                defaultChecked={!scriptsStore.creating_template}
                                onChange={() => {
                                    scriptsStore.creating_template = null
                                }}
                            />
                            Пустой
                        </label>
                    </div>
                    {scriptsStore.template_scripts.map((script, key) => {
                        let is_checked = (scriptsStore.creating_template ? script.id === scriptsStore.creating_template.id : false);
                        return (
                            <div key={key} className="radio">
                                <label>
                                    <input
                                        type="radio"
                                        name="optionsRadios"
                                        defaultChecked={is_checked}
                                        onChange={() => {
                                            scriptsStore.creating_template = script
                                        }}
                                    />
                                    {script.name}
                                </label>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

@observer
export class EditingScript extends React.Component {
    constructor(props) {
        super(props);
        const {scriptsStore} = this.props;

        this.script = this.props.script ? this.props.script : scriptsStore.editing;
    }

    updateScriptFormHandler(e) {
        e.preventDefault();
        const {scriptsStore, modalStore} = this.props;
        scriptsStore.updateScript(this.script, modalStore);
    }

    scriptNameHandler(e) {
        const {scriptsStore} = this.props;
        scriptsStore.updateName(this.script, e.target.value);
    }

    render() {
        const {scriptsStore, available} = this.props;
        if (this.script) {
            return (
                <div className="row">
                    <form action="" onSubmit={this.updateScriptFormHandler.bind(this)}>
                        <div className="col-md-12">
                            <div className="form-group">
                                <input className="form-control"
                                       onChange={this.scriptNameHandler.bind(this)}
                                       value={this.script.name} type="text" name="name"
                                       placeholder="Имя скрипта"/>
                            </div>
                        </div>
                    </form>
                </div>
            )
        }
        return <div></div>;
    }
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

@observer
export class Accesses extends React.Component {
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

    setAccesses(accesses, script) {
        const {scriptsStore} = this.props;
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-accesses-url'),
            data: JSON.stringify({accesses: accesses, script_id: script.id}),
            success: (res) => {
                if (script.data !== res.data) {
                    script.data = res.data;
                }
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    onSelect(selects, edit) {
        const {script} = this.props;
        let {accesses} = this.state;
        let new_accesses = accesses.filter(access => {
            return access.edit !== edit
        });
        selects.map(select => {
            new_accesses.push(
                {value: select.value, label: select.label, selected: true, edit: edit}
            )
        });
        this.setState(update(this.state, {accesses: {$set: new_accesses}}), () => {
            this.setAccesses(new_accesses.map(access => {
                return {user_id: access.value, edit: access.edit}
            }), script);
        });
    }

    getSelected(edit) {
        return this.state.accesses.filter(access => {
            return access.edit === edit
        });
    }

    getOptions(edit) {
        const {usersStore} = this.props;
        let edit_selects = this.getSelected(true);
        let no_edit_selects = this.getSelected(false);
        let options = (edit ? edit_selects : no_edit_selects);
        let all_options = edit_selects.concat(no_edit_selects);
        usersStore.team.map(teammate => {
            if ((all_options.length > 0 ? !(all_options.find(option => {
                    return option.value === teammate.user.id
                })) : true)) {
                options.push(
                    {value: teammate.user.id, label: teammate.user.email}
                );
            }
        });
        return options;
    }

    closeModal() {
        let {modalStore} = this.props;
        modalStore.close_modal();
    }

    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <h3>Права и доступы</h3>
                    <div className="form-group">
                        <label>Модераторы</label>
                        <MultiSelectField
                            className="form-control"
                            options={this.getOptions(true)}
                            onChange={(selects) => {
                                this.onSelect(selects, true)
                            }}/>
                    </div>
                    <div className="form-group">
                        <label>Операторы</label>
                        <MultiSelectField
                            className="form-control"
                            options={this.getOptions(false)}
                            onChange={(selects) => {
                                this.onSelect(selects, false)
                            }}/>
                    </div>
                </div>
            </div>
        )
    }
}

@observer
export class DelegationScript extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            delegate_email: null
        }
    }

    componentWillMount() {
        const {usersStore} = this.props;
        usersStore.getScriptDelegationAccesses();
    }

    componentWillUnmount() {
        const {usersStore} = this.props;
        usersStore.clearScriptDelegationAccesses();
    }

    clearEmail() {
        this.setState(update(this.state, {delegate_email: {$set: null}}))
    }

    delegateScript() {
        const {script, scriptsStore, modalStore} = this.props;
        const {delegate_email} = this.state;

        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-scripts-delegation-url'),
            data: JSON.stringify({
                script_id: script.id,
                email: delegate_email
            }),
            success: (res) => {
                if (!this.props.params || !this.props.params.script) {
                    scriptsStore.scripts = res.scripts;
                    modalStore.close_modal();
                    alert('Скрипт "' + script.name + '" делегирован пользователю: ' + delegate_email);
                    this.clearEmail();
                } else {
                    window.location.replace('/');
                }
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    render() {
        const {usersStore} = this.props;
        const {delegate_email} = this.state;

        if (!usersStore.loading) {
            return (
                <div className="row-centered">
                    <div className="col-md-12 col-centered">
                        <h3>Перенос скрипта</h3>
                        <p>Переносов доступно: {usersStore.script_delegation_accesses.length}</p>
                        {usersStore.script_delegation_accesses.length > 0 ?
                            <div>
                                <div className="form-group">
                                    <label>Email нового владельца</label>
                                    <input type="text" name="email" className="form-control"
                                           placeholder="Введите email нового владельца" onChange={(e) => {
                                        this.setState(update(this.state, {delegate_email: {$set: e.target.value}}));
                                    }}/>
                                </div>
                                <button
                                    className={'btn ' + (validateEmail(delegate_email) ? 'btn-success' : 'btn-default disabled')}
                                    onClick={(e) => {
                                        (validateEmail(delegate_email) ? this.delegateScript() : null);
                                    }}>Перенести
                                </button>
                            </div>
                            :
                            <DelegationScriptAccessAdditionalService usersStore={usersStore}/>
                        }
                    </div>
                </div>
            )
        }
        return null;
    }
}

@observer
export class OfflineScriptExport extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {usersStore, exportingContentBlock} = this.props;

        if (!usersStore.loading) {
            return (
                <div className="row-centered">
                    <div className="col-md-12 col-centered">
                        <h3>{this.props.title}</h3>
                        <p>Скачиваний доступно: {usersStore.script_exporting_accesses.length}</p>
                        <p>Активность безлимитных
                            скачиваний: {usersStore.script_exporting_unlim_access_is_active ? 'Активно' : 'Не активно'}</p>

                        {usersStore.script_exporting_accesses.length > 0 || usersStore.script_exporting_unlim_access_is_active ?
                            <div>
                                {exportingContentBlock}
                            </div>
                            :
                            <div>
                                <OfflineScriptExportAdditionalService usersStore={usersStore}/>
                                <UnlimOfflineScriptExportAdditionalService usersStore={usersStore}/>
                            </div>
                        }
                    </div>
                </div>
            )
        }
        return null;
    }
}

@observer
export class CreateOfflineScriptExport extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        const {usersStore} = this.props;
        usersStore.getOfflineScriptsExportAccesses();
    }

    componentWillUnmount() {
        const {usersStore} = this.props;
        usersStore.clearOfflineScriptsExportAccesses();
    }

    cancelExporting() {
        const {modalStore} = this.props;
        modalStore.close_modal();
    }

    createScriptExport() {
        const {script, modalStore} = this.props;

        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-scripts-exporting-url'),
            data: JSON.stringify({
                script_id: script.id,
            }),
            success: (res) => {
                modalStore.close_modal();
                window.location.href = `/offline/${res.script_access.id}/`;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    getExportingContentBlock() {
        const {script} = this.props;

        return (
            <div className="row">
                <div className="col-md-12">
                    <h4>Вы уверены, что хотите скачать скрипт "{script.name}"?</h4>
                </div>

                <div className="col-md-12 script_export_confirm_block">
                    <div className="col-md-6">
                        <button className="custom_button btn btn-success"
                                onClick={this.createScriptExport.bind(this)}>Да
                        </button>
                    </div>
                    <div className="col-md-6">
                        <button className="custom_button btn btn-danger" onClick={this.cancelExporting.bind(this)}>Нет
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const {usersStore} = this.props;

        return (
            <OfflineScriptExport
                exportingContentBlock={this.getExportingContentBlock()}
                usersStore={usersStore}
                title="Скачать скрипт"/>
        )
    }
}

class MultiSelectField extends React.Component {
    constructor(props) {
        super(props);

        this.displayName = 'MultiSelect';
        this.state = {
            options: props.options,
            value: props.options.filter(i => {
                return i.selected
            })
        };
    }

    componentWillReceiveProps(props) {
        this.setState({
            options: props.options,
            value: props.options.filter(i => {
                return i.selected
            })
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
                }}/>
        );
    }
}

@observer
export class AvailableScripts extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return React.cloneElement(React.createElement(Scripts, this.props), {available: true});
    }
}
