import * as React from 'react';
import {observer} from 'mobx-react';
import {Link} from 'react-router';

@observer
export class NoMoney extends React.Component {
    render() {
        return (
            <div className="col-md-12">
                <h3>У вас не достаточно средств для работы с данным разделом.</h3>
                <p>
                    Перейдите в раздел <Link to="/profile/payment/">"Оплата"</Link> чтбы пополнить баланс.
                </p>
            </div>
        )
    }
}

@observer
export class NoScriptOwnerMoney extends React.Component {
    render() {
        return (
            <div className="col-md-12">
                <h3 className="ret_text">У создателя скрипта отрицательный баланс.</h3>
                <p>
                    Вернуться на <Link to="/scripts/available/">главную</Link>.
                </p>
            </div>
        )
    }
}

@observer
export class NoAccess extends React.Component {
    render() {
        return (
            <div className="col-md-12">
                <h3 className="ret_text">У вас нет доступа к данному разделу.</h3>
                <p>
                    Вернуться на <Link to="/">главную</Link>.
                </p>
            </div>
        )
    }
}