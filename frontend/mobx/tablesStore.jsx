import {computed, observable} from 'mobx';

export class Coll {
    @observable name = 'Колонка с сылками';
    @observable size = 50;
    @observable position = 0;
    @observable table;

    constructor(table) {
        if(table) {
            this.table = table.id;
        }
    }
}

const defaults = {
    text_coll_name: 'Колонка с текстами ссылок',
    text_coll_size: 50,
    text_coll_position: 0
};

export class TablesStore {
    @observable tables = [];
    @observable creating_name = '';
    @observable creating_colls = [new Coll()];
    @observable creating_text_coll_name = defaults.text_coll_name;
    @observable creating_text_coll_size = defaults.text_coll_size;
    @observable creating_text_coll_position = defaults.text_coll_position;
    @observable creating_script = null;
    @observable editing = null;

    table(id) {
        return this.tables.find(table => parseInt(table.id) === parseInt(id));
    }
    resetCreating() {
        this.creating_name = '';
        this.creating_colls = [new Coll()];
        this.creating_text_coll_name = defaults.text_coll_name;
        this.creating_text_coll_size = defaults.text_coll_size;
        this.creating_text_coll_position = defaults.text_coll_position;
        this.creating_script = null;
    }
}

export default new TablesStore