import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Link} from 'react-router';
import {observer} from 'mobx-react';


@observer
export class Nav extends React.Component {
    render() {
        const {usersStore} = this.props;
        return(
            <nav className={"navbar navbar-default " + (this.props.location.pathname.includes('edit') || this.props.location.pathname.includes('share') ? 'unmargin' : '')}>
                <div className="container-fluid">
                    <ul className="nav navbar-nav">
                        <li><a href="/">Главная</a></li>
                        <li><Link to='/projects'>Мои проекты</Link></li>
                        <li><Link to='/scripts/user'>Мои скрипты</Link></li>
                        <li><Link to='/scripts/available'>Доступные скрипты</Link></li>
                        {this.props.location.pathname.includes('edit') ?
                            <li>
                                <Link to={
                                        '/tables/' + this.props.params.script +
                                        '/table/' + this.props.params.table +
                                        (this.props.params.link ? ('/link/' + this.props.params.link) : '') +
                                        '/share/'
                                    }>Просмотр</Link>
                            </li>
                        :
                            ''
                        }
                        {this.props.location.pathname.includes('share') ?
                            <li>
                                <Link to={
                                        '/tables/' + this.props.params.script +
                                        '/table/' + this.props.params.table +
                                        (this.props.params.link ? ('/link/' + this.props.params.link) : '') +
                                        '/edit/'
                                    }>Редактирование</Link>
                            </li>
                        :
                            ''
                        }
                    </ul>
                    {usersStore.session_user ?
                        <ul className="nav navbar-nav navbar-right">
                            <li className="dropdown">
                                <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{usersStore.session_user.username} <span className="caret"/></a>
                                <ul className="dropdown-menu">
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
