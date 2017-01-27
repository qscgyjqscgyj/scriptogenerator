import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Link} from 'react-router';
import {observer} from 'mobx-react';

const STATIC_URL = document.body.getAttribute('data-static-url');

@observer
export class Nav extends React.Component {
    render() {
        const {usersStore, tablesStore} = this.props;
        let script_id = parseInt(this.props.params.script);
        let script_tables = tablesStore.script_tables(script_id);
        let edit = this.props.location.pathname.includes('edit');
        return(
            <nav className={"navbar navbar-default " + (this.props.location.pathname.includes('edit') || this.props.location.pathname.includes('share') ? 'unmargin' : '')}>
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <img className="logo" width="40px" alt="Scriptogenerator" src={STATIC_URL + 'img/logo.png'}/>
                    </a>

                    <ul className="nav navbar-nav">
                        <li><Link to='/scripts/user/'>Мои скрипты</Link></li>
                        <li><Link to='/scripts/available/'>Доступные скрипты</Link></li>
                        <li><a href='http://lp.scriptogenerator.ru/info' target="_blank">Инструкция</a></li>

                        {script_tables.length > 0 ?
                            <li className="dropdown">
                                <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                    Таблицы <span className="caret"/>
                                </a>
                                <ul className="dropdown-menu">
                                    {script_tables.map((table, key) => {
                                        return(
                                            <li key={key} className={table.id === parseInt(this.props.params.table) ? 'active' : null}>
                                                <Link to={
                                                        '/tables/' + this.props.params.script +
                                                        '/table/' + table.id +
                                                        (edit ? '/edit/' : '/share/')
                                                    }>{table.name}</Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </li>
                        : null}

                        {this.props.location.pathname.includes('edit') ?
                            <li>
                                <Link to={
                                        '/tables/' + this.props.params.script +
                                        '/table/' + this.props.params.table +
                                        (this.props.params.link ? ('/link/' + this.props.params.link) : '') +
                                        '/share/'
                                    }>Просмотр</Link>
                            </li>
                        : null}
                        {this.props.location.pathname.includes('share') ?
                            <li>
                                <Link to={
                                        '/tables/' + this.props.params.script +
                                        '/table/' + this.props.params.table +
                                        (this.props.params.link ? ('/link/' + this.props.params.link) : '') +
                                        '/edit/'
                                    }>Редактирование</Link>
                            </li>
                        : null}
                    </ul>
                    {usersStore.session_user ?
                        <ul className="nav navbar-nav navbar-right">
                            <li className="nav_promotion_block">
                                <a href="http://getproff.ru/sgt-pay-sale">Акция: год доступа за 4 990р.</a>
                            </li>
                            <li className="nav_balance_block">
                                <a
                                    href="http://getproff.ru/sgt-pay"
                                    className={usersStore.session_user.balance_total <= 0 ? 'negative_balance' : 'positive_balance'}>
                                        Баланс: {usersStore.session_user.balance_total}р.
                                </a>
                                {/*<Link to="/profile/payment/"*/}
                                    {/*role="button"*/}
                                    {/*aria-haspopup="true"*/}
                                    {/*aria-expanded="false"*/}
                                    {/*className={usersStore.session_user.balance_total <= 0 ? 'negative_balance' : 'positive_balance'}*/}
                                {/*>*/}
                                    {/*Баланс: {usersStore.session_user.balance_total}р.*/}
                                {/*</Link>*/}
                            </li>
                            <li className="dropdown">
                                <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{usersStore.session_user.username} <span className="caret"/></a>
                                <ul className="dropdown-menu">
                                    <li><Link to='/profile/'>Личный Кабинет</Link></li>
                                    {/*<li><Link to='/profile/payment/'>Оплата</Link></li>*/}
                                    <li><a href="http://getproff.ru/sgt-pay">Оплата</a></li>
                                    <li><Link to='/profile/team/'>Моя Команда</Link></li>
                                    <li><a href={document.body.getAttribute('data-logout-url')}>Выход</a></li>
                                </ul>
                            </li>
                        </ul>
                    : ''}
                </div>
            </nav>
        );
    }
}
