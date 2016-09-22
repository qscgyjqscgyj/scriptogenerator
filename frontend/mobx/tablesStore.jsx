import {computed, observable} from 'mobx';

export class Coll {
    @observable name = 'Колонка с сылками';
    @observable size = 50;
    @observable pozition = 0;
}

export class TablesStore {
    @observable tables = [];
    @observable creating_name = '';
    @observable creating_colls = [new Coll()];
    @observable creating_text_coll_name = 'Колонка с текстами ссылок';
    @observable creating_text_coll_size = 50;
    @observable creating_text_coll_position = 0;
    @observable creating_script = null;
    @observable editing = null;

    table(id) {
        return this.tables.find(table => parseInt(table.id) === parseInt(id));
    }
    resetCreating() {
        this.creating_name = '';
        this.creating_colls = [new Coll()];
        this.creating_text_coll_name = '';
        this.creating_text_coll_size = 50;
        this.creating_text_coll_position = 0;
        this.creating_script = null;
    }
}

export default new TablesStore