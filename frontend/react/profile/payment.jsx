import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';

const YA_CONFIG = {
    shopId: '91593',
    scid: '546578'
};

@observer
export class Payment extends React.Component {
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
    render() {
        const {usersStore, paymentStore} = this.props;
        let can_submit = (!(!usersStore.session_user) && (paymentStore.sum >= 990) && !(!paymentStore.method));
        return(
            <div className="col-md-12">
                <div className="col-md-6">
                    <div className="col-md-12">
                        <div className="col-md-12">
                            <h3 className="profile_payment__title">1. Выберите способ оплаты</h3>
                        </div>

                        {paymentStore.methods.map((method, key) => {
                            return (
                                <div key={key}
                                     onClick={() => {paymentStore.method = method.value}}
                                     className={"col-md-3 profile_payment__bordered_block profile_payment__method_block " + (method.value === paymentStore.method ? 'active' : null)}
                                >
                                    <img src={method.img}/>
                                </div>
                            )
                        })}
                   </div>

                    <div className="col-md-12">
                        <div className="col-md-12">
                            <h3 className="profile_payment__title">2. Выберите сумму пополнения и свой подарок</h3>
                        </div>

                        {paymentStore.bonuses.map((bonus, key) => {
                            return (
                                <div key={key}
                                    className={"col-md-3 profile_payment__bonus_block profile_payment__bordered_block " + bonus.className + ' ' + (bonus.active ? 'active' : null)}
                                    onClick={() => {paymentStore.setSum(parseInt(bonus.min_sum))}}>
                                    <img src={bonus.img}/>
                                    <p className="profile_payment__bonus_title">{bonus.bonus} рублей на счет</p>
                                    <span>при пополнении баланса на сумму от {bonus.min_sum} рублей</span>
                                </div>
                            )
                        })}
                    </div>

                    <div className="col-md-12">
                        <div className="col-md-12 profile_payment__payment_sum_block">
                            <div className="col-md-6">
                                <div className="form-inline">
                                    <div className="form-group">
                                        <label>К оплате</label>
                                        <input type="text"
                                            className="form-control"
                                            onChange={(e) => {paymentStore.setSum(parseInt(e.target.value))}}
                                            value={paymentStore.sum ? paymentStore.sum : ''}
                                            placeholder="Сумма к оплате"/>
                                        <span className="avg">рублей. *минимум 990р.</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 summaries_block">
                                {paymentStore.bonus ?
                                    <p>Ваш бонус: <span className="summary_bonus">{paymentStore.bonus} руб.</span></p>
                                : null}
                                <p>Счет будет пополнен на: <span className="summary_sum">{paymentStore.sum + paymentStore.bonus} руб.</span></p>
                            </div>
                        </div>
                        <div className="col-md-12 profile_payment__payment">
                            <div className="col-md-6">
                                {!paymentStore.payment ?
                                    <button className={"btn btn-lg " + (can_submit ? 'btn-success' : 'disabled btn-default')}
                                        onClick={can_submit ? this.onSubmit.bind(this) : null}
                                    >ОПЛАТИТЬ</button>
                                : null}
                            </div>
                            <div className="col-md-6 recurrent_payments">
                                <input type="checkbox" defaultChecked={true}/> Включить автопополнение баланса.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6"></div>
                {paymentStore.payment && usersStore.session_user ?
                    <form action="https://demomoney.yandex.ru/eshop.xml" id="YA_FORM" method="POST">
                        <input name="shopId" value={YA_CONFIG.shopId} type="hidden"/>
                        <input name="scid" value={YA_CONFIG.scid} type="hidden"/>
                        <input name="sum" value={paymentStore.sum} type="hidden"/>
                        <input name="customerNumber" value={usersStore.session_user.id} type="hidden"/>
                        <input name="paymentType" value={paymentStore.method} type="hidden"/>
                        <input name="orderNumber" value={paymentStore.payment.id} type="hidden"/>
                        <input name="cps_phone" value={usersStore.session_user.phone ? usersStore.session_user.phone : ''} type="hidden"/>
                        <input name="cps_email" value={usersStore.session_user.email} type="hidden"/>
                        <input type="submit" value="Заплатить"/>
                    </form>
                : null}
            </div>
        )
    }
}
// https://money.yandex.ru/eshop.xml
