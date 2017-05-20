import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import {Paginator, getPagesCount, getChunkedArray} from '../pagination';

@observer
export class Payment extends React.Component {
    componentWillMount() {
        const {usersStore} = this.props;
        usersStore.getData();
        usersStore.getTeam();
    }

    onSubmit() {
        const {usersStore, paymentStore} = this.props;
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-payment-url'),
            data: JSON.stringify({
                user: usersStore.session_user,
                sum: paymentStore.sum,
                total_sum: paymentStore.sum + paymentStore.bonus
            }),
            success: (res) => {
                paymentStore.payment = res.payment;
                document.getElementById("YA_FORM").submit();
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    getBalanceLeftText() {
        const {usersStore} = this.props;
        let team_length = usersStore.team.length;
        let days_left = Math.floor(usersStore.session_user.balance_total / (team_length * usersStore.payment_per_user));
        return(
            <div>
                Хватит на
                <span className="underline">
                    {` ${days_left} ${declOfNum(days_left, ['день', 'дня', 'дней'])} `}
                </span>
                для
                <span className="underline">
                    {` ${team_length} ${declOfNum(team_length, ['сотрудника', 'сотрудников', 'сотрудников'])}`}
                </span>
            </div>
        )
    }

    render() {
        const {usersStore, paymentStore} = this.props;
        let can_submit = (!(!usersStore.session_user) && (paymentStore.sum >= 990) && !(!paymentStore.method));
        return (
            <div className="col-md-12">
                <div className="col-md-8">
                    <div className="col-md-12">
                        <div className="col-md-12 payment_balance_container">
                            <div className="col-md-12 payment_balance_block">
                                <div className="col-md-3">
                                    <span className="payment_balance_total_title">Ваш баланс*</span>
                                    <br/>
                                    <span className="payment_balance_total">{usersStore.session_user.balance_total} руб.</span>
                                </div>
                                <div className="col-md-6 payment_balance_total_left">
                                    {this.getBalanceLeftText()}
                                </div>
                                <div className="col-md-3 payment_balance_button_recharge">
                                    <button className="btn btn-lg btn-danger pull-right">Пополнить</button>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <span className="payment_balance_total_ps">
                                    *С баланса списывается {usersStore.payment_per_user} руб. в день за каждого пользователя. Главный аккаунт - бесплатно.
                                </span>
                            </div>
                        </div>

                        <h3 className="profile_payment__title">Дополнительные возможности</h3>
                        <div className="col-md-12 payment_additional_container">
                            <div className="col-md-12 payment_additional_block">
                                <div className="col-md-3">
                                    <span className="payment_additional_feature_title">
                                        Выгрузка скрипта
                                    </span>
                                    <br/>
                                    <span className="payment_additional_feature_desc">
                                        Доступно для выгрузки: <span className="red_text">0</span>
                                    </span>
                                </div>
                                <div className="col-md-6 payment_additional_feature_text">
                                    Вы можете скачать любой скрипт в html-файл и использовать его без доступа к интернету
                                </div>
                                <div className="col-md-3 payment_balance_button">
                                    <button className="btn btn-lg btn-success pull-right">Подключить</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-12 payment_additional_container">
                            <div className="col-md-12 payment_additional_block">
                                <div className="col-md-3">
                                    <span className="payment_additional_feature_title">
                                        Перенос скрипта
                                    </span>
                                    <br/>
                                    <span className="payment_additional_feature_desc">
                                        Доступно для переноса: <span className="red_text">0</span>
                                    </span>
                                </div>
                                <div className="col-md-6 payment_additional_feature_text">
                                    Вы можете перенести скрипт с вашего аккаунта, в аккаунт другого пользователя
                                </div>
                                <div className="col-md-3 payment_balance_button">
                                    <button className="btn btn-lg btn-success pull-right">Подключить</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-12 payment_additional_container">
                            <div className="col-md-12 payment_additional_block">
                                <div className="col-md-3">
                                    <span className="payment_additional_feature_title">
                                        Безлимитная выгрузка
                                    </span>
                                    <br/>
                                    <span className="payment_additional_feature_desc">
                                        <span className="red_text">Услуга не подключена</span>
                                    </span>
                                </div>
                                <div className="col-md-6 payment_additional_feature_text">
                                    Вы можете скачивать любое количество скриптов, а также размещать свой логотип и ссылку на свой сайт в выгруженном скрипте
                                </div>
                                <div className="col-md-3 payment_balance_button">
                                    <button className="btn btn-lg btn-success pull-right">Подключить</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {usersStore.local_payments.length > 0 ?
                    <div className="col-md-4">
                        <div className="jumbotron col-md-12">
                            <PaymentHistory usersStore={usersStore}/>
                        </div>
                    </div>
                : null}
                {/*<script id="4626752292b2d3c202d2d85816e04c0878731972"*/}
                        {/*src="http://getproff.ru/pl/lite/widget/script?id=1748"/>*/}
            </div>
        )
    }
}

class PaymentHistory extends React.Component {
    constructor(props) {
        super(props);

        this.payments_per_page = 10;
        this.state = {
            page: 0
        }
    }

    setPage(page) {
        this.setState(update(this.state, {page: {$set: page}}));
    }

    render() {
        const {usersStore} = this.props;
        let local_payments = getChunkedArray(usersStore.local_payments, this.payments_per_page)[this.state.page];
        let pages = getPagesCount(usersStore.local_payments.length, this.payments_per_page);
        return (
            <div>
                <h3>История платежей.</h3>
                <table className="table">
                    <thead>
                    <tr>
                        <td>Наименование</td>
                        <td>Сумма</td>
                        <td>Дата</td>
                    </tr>
                    </thead>
                    <tbody>
                    {local_payments.map((payment, key) => {
                        return (
                            <tr key={key}>
                                <td>{payment.name}</td>
                                <td>{payment.sum} р.</td>
                                <td>{payment.date}</td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>

                {usersStore.local_payments.length > this.payments_per_page ?
                    <div className="col-md-12">
                        <Paginator
                            pages={pages}
                            current_page={this.state.page}
                            objects_length={usersStore.local_payments.length}
                            setPage={this.setPage.bind(this)}
                        />
                    </div>
                    : null}
            </div>
        )
    }
}

// @observer
// export class Payment extends React.Component {
//     componentWillMount() {
//         const {usersStore} = this.props;
//         usersStore.getData();
//     }
//     onSubmit() {
//         const {usersStore, paymentStore} = this.props;
//         $.ajax({
//             method: 'POST',
//             url: document.body.getAttribute('data-payment-url'),
//             data: JSON.stringify({
//                 user: usersStore.session_user,
//                 sum: paymentStore.sum,
//                 total_sum: paymentStore.sum + paymentStore.bonus
//             }),
//             success: (res) => {
//                 paymentStore.payment = res.payment;
//                 document.getElementById("YA_FORM").submit();
//             },
//             error: (res) => {
//                 console.log(res);
//             }
//         });
//     }
//     render() {
//         const {usersStore, paymentStore} = this.props;
//         let can_submit = (!(!usersStore.session_user) && (paymentStore.sum >= 990) && !(!paymentStore.method));
//         return(
//             <div className="col-md-12">
//                 <div className="col-md-8">
//                     <div className="col-md-12">
//                         <div className="col-md-12">
//                             <h3 className="profile_payment__title">1. Выберите способ оплаты</h3>
//                         </div>
//
//                         {paymentStore.methods.map((method, key) => {
//                             return (
//                                 <div key={key}
//                                      onClick={() => {paymentStore.method = method.value}}
//                                      className={"col-md-3 profile_payment__bordered_block profile_payment__method_block " + (method.value === paymentStore.method ? 'active' : null)}
//                                 >
//                                     <img src={method.img}/>
//                                 </div>
//                             )
//                         })}
//                    </div>
//
//                     <div className="col-md-12">
//                         <div className="col-md-12">
//                             <h3 className="profile_payment__title">2. Выберите сумму пополнения и свой подарок</h3>
//                         </div>
//
//                         {paymentStore.bonuses.map((bonus, key) => {
//                             return (
//                                 <div key={key}
//                                     className={"col-md-3 profile_payment__bonus_block profile_payment__bordered_block " + bonus.className + ' ' + (bonus.active ? 'active' : null)}
//                                     onClick={() => {paymentStore.setSum(parseInt(bonus.min_sum))}}>
//                                     <img src={bonus.img}/>
//                                     <p className="profile_payment__bonus_title">{bonus.bonus} рублей на счет</p>
//                                     <span>при пополнении баланса на сумму от {bonus.min_sum} рублей</span>
//                                 </div>
//                             )
//                         })}
//                     </div>
//
//                     <div className="col-md-12">
//                         <div className="col-md-12 profile_payment__payment_sum_block">
//                             <div className="col-md-6">
//                                 <div className="form-inline">
//                                     <div className="form-group">
//                                         <label>К оплате</label>
//                                         <input type="text"
//                                             className="form-control"
//                                             onChange={(e) => {paymentStore.setSum(parseInt(e.target.value))}}
//                                             value={paymentStore.sum ? paymentStore.sum : ''}
//                                             placeholder="Сумма к оплате"/>
//                                         <span className="avg">рублей. *минимум 990р.</span>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="col-md-6 summaries_block">
//                                 {paymentStore.bonus ?
//                                     <p>Ваш бонус: <span className="summary_bonus">{paymentStore.bonus} руб.</span></p>
//                                 : null}
//                                 <p>Счет будет пополнен на: <span className="summary_sum">{paymentStore.sum + paymentStore.bonus} руб.</span></p>
//                             </div>
//                         </div>
//                         <div className="col-md-12 profile_payment__payment">
//                             <div className="col-md-6">
//                                 {!paymentStore.payment ?
//                                     <button className={"btn btn-lg " + (can_submit ? 'btn-success' : 'disabled btn-default')}
//                                         onClick={can_submit ? this.onSubmit.bind(this) : null}
//                                     >ОПЛАТИТЬ</button>
//                                 : null}
//                             </div>
//                             <div className="col-md-6 recurrent_payments">
//                                 <input type="checkbox" defaultChecked={true}/> Включить автопополнение баланса.
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="col-md-4">
//                     <div className="jumbotron col-md-11">
//                         <h3>История платежей.</h3>
//                         <table className="table">
//                             <thead>
//                                 <tr>
//                                     <td>Наименование</td>
//                                     <td>Сумма</td>
//                                     <td>Дата</td>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {usersStore.local_payments.map((payment, key) => {
//                                     return (
//                                         <tr key={key}>
//                                             <td>{payment.name}</td>
//                                             <td>{payment.sum} р.</td>
//                                             <td>{payment.date}</td>
//                                         </tr>
//                                     )
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//
//                 <div className="col-md-6"></div>
//                 {paymentStore.payment && usersStore.session_user ?
//                     <form action="https://money.yandex.ru/eshop.xml" id="YA_FORM" method="POST">
//                         <input name="shopId" value={paymentStore.shopId} type="hidden"/>
//                         <input name="scid" value={paymentStore.scid} type="hidden"/>
//                         <input name="sum" value={paymentStore.sum} type="hidden"/>
//                         <input name="customerNumber" value={usersStore.session_user.id} type="hidden"/>
//                         <input name="paymentType" value={paymentStore.method} type="hidden"/>
//                         <input name="orderNumber" value={paymentStore.payment.id} type="hidden"/>
//                         <input name="cps_phone" value={usersStore.session_user.phone ? usersStore.session_user.phone : ''} type="hidden"/>
//                         <input name="cps_email" value={usersStore.session_user.email} type="hidden"/>
//                         <input type="submit" value="Заплатить"/>
//                     </form>
//                 : null}
//             </div>
//         )
//     }
// }


export function declOfNum(number, titles) {
    let cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}