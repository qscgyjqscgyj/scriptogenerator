import {computed, observable, autorun} from 'mobx';

export class SortStore {
    @observable items = [];

    constructor(items) {
        autorun(() => {
            this.items = items;
        });
    }
}
