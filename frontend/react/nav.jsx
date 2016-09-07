import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Link} from 'react-router';


export class Nav extends React.Component {
    render() {
        return(
            <nav className="navbar navbar-default">
                <div className="container">
                    <ul className="nav navbar-nav">
                        <li><Link to='/'>Главная</Link></li>
                        <li><Link to='/projects'>Мои проекты</Link></li>
                        <li><Link to='/scripts/user'>Мои скрипты</Link></li>
                        <li><Link to='/scripts/available'>Доступные мне</Link></li>
                    </ul>
                </div>
            </nav>
        );
    }
}
