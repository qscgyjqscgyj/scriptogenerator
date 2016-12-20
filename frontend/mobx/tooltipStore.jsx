import {computed, observable, action} from 'mobx';

export class TooltipStore {
    @observable tip = null;
    @observable id = null;

    @action reset() {
        this.tip = null;
        this.id = null;
    }
}

export default new TooltipStore