import 'react-tabs/style/react-tabs.css';
import * as React from 'react';
import {Link} from 'react-router';
import {observer} from 'mobx-react';
import {Switcher} from './switcher';
import {NavTableCollsEditor} from './table';
import {Tab, Tabs, TabPanel, TabList} from 'react-tabs';
import {EditingScript, CreateOfflineScriptExport, DelegationScript, Accesses} from './scripts';
import {Tables} from './tables';
import {Team} from './profile/team';
import {ModalStore} from '../mobx/modalStore';
import {ModalWrapper} from './modal';

const STATIC_URL = document.body.getAttribute('data-static-url');

@observer
export class Nav extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            router_params: this.props.params
        }
    }

    triggerVideoInstructions() {
        const {usersStore} = this.props;
        usersStore.triggerVideoInstructions();
    }

    triggerUserButtonLinksSetting() {
        const {usersStore} = this.props;
        usersStore.triggerUserButtonLinksSetting();
    }

    componentWillReceiveProps(props) {
        this.setState({router_params: props.params});
    }

    getVideoInstructions() {
        const {usersStore, page_name} = this.props;

        return usersStore.video_instructions.filter((video_instruction) => {
            return video_instruction.page_id === page_name;
        });
    }

    openNavTableCollsEditor() {
        const {modalStore} = this.props;
        let subModalStore = new ModalStore;
        subModalStore.router_params = modalStore.router_params;

        // modalStore.open_modal(React.createElement(NavTableCollsEditor, {...this.props}));
        modalStore.open_modal(
            React.createElement(NavModalSettings, {...this.props, subModalStore: subModalStore}),
            'Настройка скрипта',
            null,
            null,
            'large'
        );
    }

    render() {
        const {usersStore, scriptsStore, settingsStore, modalStore} = this.props;
        let script = scriptsStore.script(this.props.params.script);
        let edit = this.props.location.pathname.includes('edit');

        let video_instructions = this.getVideoInstructions();

        return (
            <nav
                className={"navbar navbar-default " + (this.props.location.pathname.includes('edit') || this.props.location.pathname.includes('share') ? 'unmargin' : '')}>
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <img className="logo" width="40px" alt="Scriptogenerator" src={STATIC_URL + 'img/logo.png'}/>
                    </a>

                    <ul className="nav navbar-nav">
                        <li className={this.props.location.pathname.includes('/scripts/user/') || this.props.location.pathname === '/' ? 'active' : ''}>
                            <Link to='/scripts/user/'>Мои скрипты</Link>
                        </li>
                        <li className={this.props.location.pathname.includes('/scripts/available/') ? 'active' : ''}>
                            <Link to='/scripts/available/'>Доступные скрипты</Link>
                        </li>

                        {script && script.data.length > 0 ?
                            <li className={`dropdown nav_tables_dropdown ${this.props.location.pathname.includes('/tables/') ? 'active' : ''}`}>
                                <Link to={scriptsStore.scriptUrl(script)} className="dropdown-toggle"
                                      data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                    Сценарии <span className="caret"/>
                                </Link>
                                <ul className="dropdown-menu">
                                    {script.data.map((table, key) => {
                                        return (
                                            <li key={key}
                                                className={table.id === this.props.params.table ? 'active' : null}>
                                                <Link
                                                    to={scriptsStore.tableUrl(script, table, (edit ? 'edit' : 'share'))}>{table.name}</Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </li>
                            : null}

                        <li>
                            {video_instructions.length > 0 ?
                                <div className="checkbox nav_switcher_setting_trigger col-md-12">
                                    <div className="col-md-3">
                                        <Switcher
                                            html_id="video_instructions_switcher"
                                            onChange={this.triggerVideoInstructions.bind(this)}
                                            checked={usersStore.session_user.video_instructions_settings}/>
                                    </div>
                                    <div className="col-md-8">
                                        Инструкции
                                    </div>
                                </div>
                                :
                                <a href='http://lp.scriptogenerator.ru/info' target="_blank">Инструкция</a>
                            }
                        </li>
                    </ul>
                    {usersStore.session_user ?
                        <ul className="nav navbar-nav navbar-right">
                            {settingsStore.advertisment ?
                                <li className="nav_promotion_block">
                                    <a target="_blank" href={settingsStore.advertisment.url}>
                                        {settingsStore.advertisment.title}
                                    </a>
                                </li>
                                : null}
                            {/*<li className="nav_balance_block">*/}
                            {/*<a*/}
                            {/*href="http://getproff.ru/sgt-pay"*/}
                            {/*className={usersStore.session_user.balance_total <= 0 ? 'negative_balance' : 'positive_balance'}>*/}
                            {/*Баланс: {usersStore.session_user.balance_total}р.*/}
                            {/*</a>*/}
                            {/*<Link to="/profile/payment/"*/}
                            {/*role="button"*/}
                            {/*aria-haspopup="true"*/}
                            {/*aria-expanded="false"*/}
                            {/*className={usersStore.session_user.balance_total <= 0 ? 'negative_balance' : 'positive_balance'}*/}
                            {/*>*/}
                            {/*Баланс: {usersStore.session_user.balance_total}р.*/}
                            {/*</Link>*/}
                            {/*</li>*/}

                            {this.props.location.pathname.includes('share') ?
                                <li className="dropdown">
                                    <a href="#" className="dropdown-toggle nav_settings_icon_container"
                                       data-toggle="dropdown"
                                       role="button"
                                       aria-haspopup="true" aria-expanded="false">
                                        <i className="glyphicon glyphicon-cog nav_settings_icon"/>
                                    </a>


                                    <div className="dropdown-menu">
                                        <div className="checkbox nav_switcher_setting_trigger col-md-12">
                                            <div className="col-md-5">
                                                <Switcher
                                                    html_id="button_links_switcher"
                                                    onChange={this.triggerUserButtonLinksSetting.bind(this)}
                                                    checked={usersStore.session_user.button_links_setting}/>
                                            </div>
                                            <div className="col-md-7">
                                                {usersStore.session_user.button_links_setting ? 'Кнопки' : 'Ссылки'}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                : null}

                            {this.props.location.pathname.includes('edit') ?
                                <li>
                                    <a className="nav_settings_icon_container"
                                       onClick={this.openNavTableCollsEditor.bind(this)}>
                                        <i className="glyphicon glyphicon-cog nav_settings_icon"/>
                                    </a>
                                </li>
                                : null}

                            {this.props.location.pathname.includes('edit') ?
                                <li>
                                    <Link to={
                                        '/tables/' + this.props.params.script +
                                        '/table/' + this.props.params.table +
                                        (this.props.params.link ? ('/link/' + this.props.params.link) : '') +
                                        '/share/'
                                    } className="nav_button_link">
                                        <button className="btn btn-default">Просмотр</button>
                                    </Link>
                                </li>
                                : null}
                            {this.props.location.pathname.includes('share') ?
                                <li>
                                    <Link to={
                                        '/tables/' + this.props.params.script +
                                        '/table/' + this.props.params.table +
                                        (this.props.params.link ? ('/link/' + this.props.params.link) : '') +
                                        '/edit/'
                                    } className="nav_button_link">
                                        <button className="btn btn-default">Редактировать</button>
                                    </Link>
                                </li>
                                : null}

                            <li className="dropdown">
                                <a href="#" className="dropdown-toggle nav_user_email_dropdown" data-toggle="dropdown"
                                   role="button"
                                   aria-haspopup="true" aria-expanded="false">{usersStore.session_user.username} <span
                                    className="caret"/>

                                    <p className={`nav_user_email_balance ${usersStore.session_user.balance_total <= 0 ? 'negative_balance' : 'positive_balance'}`}>
                                        Баланс: {usersStore.session_user.balance_total}р.
                                    </p>
                                </a>


                                <ul className="dropdown-menu">
                                    <li><Link to='/profile/'>Личный Кабинет</Link></li>
                                    <li><Link to='/profile/payment/'>Оплата</Link></li>
                                    {/*<li><a href="http://getproff.ru/sgt-pay">Оплата</a></li>*/}
                                    <li><Link to='/profile/team/'>Моя Команда</Link></li>
                                    <li><Link to='/scripts/offline/user/'>Скачанные скрипты</Link></li>
                                    <li><a href={document.body.getAttribute('data-logout-url')}>Выход</a></li>
                                </ul>
                            </li>
                        </ul>
                        : ''}
                </div>

                {usersStore.session_user.video_instructions_settings && video_instructions.length > 0 ?
                    <div className="container-fluid video_instructions_container">
                        {/*<div className="col-md-12">*/}
                        {/*<div className="col-md-1 pull-right video_instructions_close_icon_container">*/}
                        {/*<i*/}
                        {/*onClick={this.triggerVideoInstructions.bind(this)}*/}
                        {/*className="glyphicon glyphicon-remove video_instructions_close_icon"/>*/}
                        {/*</div>*/}
                        {/*</div>*/}

                        <div className="col-md-12">
                            {video_instructions.map((video_instruction, key) => {
                                return (
                                    <div key={key} className="col-md-2 video_block">
                                        <iframe width="213" height="120"
                                                src={`https://www.youtube.com/embed/${video_instruction.youtube_video_id}`}
                                                allowFullScreen={true}/>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    : null}
            </nav>
        );
    }
}


@observer
class NavModalSettings extends React.Component {
    constructor(props) {
        super(props);
        const {scriptsStore} = this.props;

        this.script = this.props.script ? this.props.script : scriptsStore.script(this.props.params.script);
    }

    scriptNameHandler(e) {
        const {scriptsStore} = this.props;
        let script_name = e.target.value;

        if (script_name.length > 0) {
            scriptsStore.updateName(script, script_name);
        } else {
            alert('Имя скрипта не должно быть пустым');
        }
    }

    render() {
        const {scriptsStore, subModalStore, usersStore} = this.props;

        return (
            <div className="row">
                <div className="col-md-12">
                    <Tabs>
                        <TabList>
                            <Tab>Главное</Tab>
                            <Tab>Доступ к скрипту</Tab>
                            <Tab>Выгрузка скрипта</Tab>
                            <Tab>Перенос скрипта</Tab>
                            <Tab>Сценарии</Tab>
                        </TabList>

                        <TabPanel>
                            <div className="col-md-12">
                                {/*{React.createElement(NavTableCollsEditor, {...this.props})}*/}
                                <h3>Изменить название скрипта</h3>
                                {React.createElement(EditingScript, {...this.props, script: this.script})}
                            </div>
                        </TabPanel>

                        <TabPanel>
                            <div className="col-md-12">
                                <h3>Редактирование доступов к скрипту</h3>
                            </div>
                            <div className="col-md-12">
                                <h3>Управление командой</h3>

                                {usersStore.team.length > 0 ?
                                    React.createElement(Accesses, {...this.props, script: this.script})
                                    : null}

                                <hr/>

                                {React.createElement(Team, {...this.props, modalStore: subModalStore})}
                            </div>
                        </TabPanel>

                        <TabPanel>
                            <div className="col-md-12">
                                <h3>Выгрузка скрипта</h3>
                                {React.createElement(CreateOfflineScriptExport, {...this.props, script: this.script})}
                            </div>
                        </TabPanel>

                        <TabPanel>
                            <div className="col-md-12">
                                <h3>Перенос скрипта</h3>
                                {React.createElement(DelegationScript, {...this.props, script: this.script})}
                            </div>
                        </TabPanel>

                        <TabPanel>
                            <div className="col-md-12">
                                <h3>Сценарии</h3>
                                {React.createElement(Tables, {...this.props, script: this.script, modalStore: subModalStore})}
                            </div>
                        </TabPanel>
                    </Tabs>
                </div>
                <ModalWrapper stores={[scriptsStore]} modalStore={subModalStore} container={this}/>
            </div>
        )
    }
}