import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Link} from 'react-router';


export class Nav extends React.Component {
    render() {
        return(
            <nav className={"navbar navbar-default " + (this.props.location.pathname.includes('edit') || this.props.location.pathname.includes('share') ? 'unmargin' : '')}>
                <div className="container-fluid">
                    <ul className="nav navbar-nav">
                        <li><Link to='/'>Главная</Link></li>
                        <li><Link to='/projects'>Мои проекты</Link></li>
                        <li><Link to='/scripts/user'>Мои скрипты</Link></li>
                        <li><Link to='/scripts/available'>Доступные мне</Link></li>
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
                </div>
            </nav>
        );
    }
}
