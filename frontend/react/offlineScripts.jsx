import * as React from 'react';
import {observer} from 'mobx-react';
import {ModalWrapper} from './modal';
import {OfflineScriptExport} from './scripts';
import {Tooltip} from './tooltip';
import $ from 'jquery';

@observer
export class OfflineScripts extends React.Component {

    componentWillMount() {
        const {usersStore} = this.props;
        usersStore.getOfflineExportedScripts();
    }

    componentWillUnmount() {
        const {usersStore} = this.props;
        usersStore.clearOfflineExportedScripts();
    }

    downloadScriptHandler(script_access) {
        window.location.href = `/offline/${script_access.id}/`;
    }

    updateScriptExport(script_access) {
        const {usersStore, modalStore} = this.props;

        $.ajax({
            method: 'PUT',
            url: document.body.getAttribute('data-offline-exported-scripts-url'),
            data: JSON.stringify({script_access_id: script_access.id}),
            success: (res) => {
                if(res.offline_exported_scripts) {
                    usersStore.offline_exported_scripts = res.offline_exported_scripts;
                    modalStore.close_modal();
                    alert(`Скрипт ${script_access.script.name} обновлен`);
                }
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    openScriptExportUpdatingModalForm(script_access) {
        const {modalStore, usersStore} = this.props;

        modalStore.open_modal(
            React.createElement(UpdateOfflineScriptExport, {
                script_access: script_access,
                usersStore: usersStore,
                modalStore: modalStore,
                updateScriptExport: this.updateScriptExport.bind(this)
            })
        )
    }

    render() {
        const {modalStore, usersStore} = this.props;
        if (usersStore.session_user) {
            return (
                <div className="col-md-12">
                    <div className="row">
                        {usersStore.offline_exported_scripts.map((script_access, key) => {
                            return (
                                <div key={key} className="col-md-12 hovered_list_item list_item edit_icon_handler">
                                    <div className="col-md-6">
                                        <span className="inline_element">{script_access.script.name}</span>
                                    </div>
                                    <div className="col-md-3">
                                        <span className="inline_element">Скачано: {script_access.exported_date}</span>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="btn-group pull-right">
                                            <button className='btn btn-default btn-xs'
                                                    data-tip="Скачать скрипт"
                                                    onClick={this.downloadScriptHandler.bind(this, script_access)}>
                                                <i className="glyphicon glyphicon-download-alt"/>
                                            </button>

                                            <button className='btn btn-default btn-xs'
                                                    data-tip="Обновить скрипт"
                                                    onClick={this.openScriptExportUpdatingModalForm.bind(this, script_access)}>
                                                <i className="glyphicon glyphicon-refresh"/>
                                            </button>
                                        </div>
                                    </div>
                                    <Tooltip/>
                                </div>
                            )
                        })}
                    </div>
                    <ModalWrapper stores={[usersStore]} modalStore={modalStore}/>
                </div>
            );
        }
        return null;
    }
}


@observer
class UpdateOfflineScriptExport extends React.Component {
    componentWillMount() {
        const {usersStore} = this.props;
        usersStore.getOfflineScriptsExportAccesses();
    }

    componentWillUnmount() {
        const {usersStore} = this.props;
        usersStore.clearOfflineScriptsExportAccesses();
    }

    cancelUpdating() {
        const {modalStore} = this.props;
        modalStore.close_modal();
    }

    getExportingContentBlock() {
        const {usersStore, script_access} = this.props;

        return (
            <div className="row">
                <div className="col-md-12">
                    <h4>Вы уверены, что хотите обновить скрипт "{script_access.script.name}"?</h4>
                </div>
                <div className="col-md-12 script_export_confirm_block">
                    <div className="col-md-6">
                        <button className="custom_button btn btn-success"
                                onClick={this.props.updateScriptExport.bind(this, script_access)}>Да
                        </button>
                    </div>
                    <div className="col-md-6">
                        <button className="custom_button btn btn-danger" onClick={this.cancelUpdating.bind(this)}>Нет
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
                title="Обновить скрипт"/>
        )
    }
}
