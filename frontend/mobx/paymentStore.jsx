import {computed, observable, action, autorun} from 'mobx';

const STATIC_URL = document.body.getAttribute('data-static-url');

export class PaymentStore {
    @observable user_payments = [];
    @observable user = null;
    @observable sum = null;
    @observable payment = null;
    @observable bonuses = [
        {
            className: 'red_bonus',
            img: STATIC_URL + 'img/payment_bonus__red.png',
            bonus: 300,
            min_sum: 3000,
            active: false
        },
        {
            className: 'green_bonus',
            img: STATIC_URL + 'img/payment_bonus__green.png',
            bonus: 1000,
            min_sum: 5000,
            active: false
        },
        {
            className: 'blue_bonus',
            img: STATIC_URL + 'img/payment_bonus__blue.png',
            bonus: 2000,
            min_sum: 10000,
            active: false
        }
    ];

    @action setSum(sum) {
        if(!isNaN(sum)) {
            this.sum = sum;
        } else {
            this.sum = null;
        }
        this.activateBonus(this.bonus);
    }

    @action activateBonus(active_bonus) {
        this.bonuses.map(bonus => {
            bonus.active = (bonus.bonus === active_bonus);
        });
    }

    @computed get bonus() {
        if(this.sum) {
            let result = 0;
            this.bonuses.map((bonus, key) => {
                if(this.sum === bonus.min_sum) {
                    result = bonus.bonus;
                } else if(this.sum > bonus.min_sum) {
                    if(key + 1 < this.bonuses.length) {
                        if(this.sum < this.bonuses[key + 1].min_sum) {
                            result = bonus.bonus;
                        }
                    } else {
                        result = bonus.bonus;
                    }
                }
            });
            return result;
        }
        return 0;
    }
}

export default new PaymentStore