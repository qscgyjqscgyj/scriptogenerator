import {computed, observable, action} from 'mobx';
import $ from 'jquery';

export class Coll {
    @observable name = 'Ссылки';
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
    text_coll_name: 'Блок с текстом',
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

    @observable active_link = null;

    @observable pressed_key = null;

    @observable colls_creating_error_message = null;

    @action pullTables(script) {
        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-tables-url'),
            data: {id: script},
            success: (res) => {
                this.tables = res.tables;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    @action updateTable(e, modalStore) {
        if(e) {e.preventDefault()}
        $.ajax({
            method: 'PUT',
            url: document.body.getAttribute('data-tables-url'),
            data: JSON.stringify(this.editing),
            success: (res) => {
                this.tables = res.tables;
                if(modalStore) {
                    this.editing = null;
                    modalStore.close_modal();
                }
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    @action setLink(table_id, link_id) {
        this.active_link = this.link(table_id, link_id);
    }
    table(id) {
        return this.tables.find(table => table.id === id);
    }
    script_tables(script_id) {
        return this.tables.filter(table => parseInt(table.script) === parseInt(script_id));
    }
    link(table_id, link_id) {
        let table = this.table(table_id);
        let all_links = [];
        if(table) {
            table.colls.map(coll => {
                coll.categories.map(category => {
                    category.links.map(link => {
                        all_links.push(link);
                    });
                })
            });
            return all_links.find(link => link.id === link_id);
        }
    }
    resetCreating() {
        this.creating_name = '';
        this.creating_colls = [new Coll()];
        this.creating_text_coll_name = defaults.text_coll_name;
        this.creating_text_coll_size = defaults.text_coll_size;
        this.creating_text_coll_position = defaults.text_coll_position;
        this.creating_script = null;
        this.colls_creating_error_message = null;
    }
}

export default new TablesStore