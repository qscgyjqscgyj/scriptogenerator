import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import {observer} from 'mobx-react';
import {Link} from 'react-router';

@observer
export class NoMoney extends React.Component {
    render() {
        return (
            <div className="col-md-12">
                <h3>У вас не достаточно средств для работы с данныем разделом.</h3>
                <p>
                    Перейдите в раздел <Link to="/profile/payment/">"Оплата"</Link> чтбы пополнить баланс.
                </p>
            </div>
        )
    }
}
