import {computed, observable, action} from 'mobx';
import $ from 'jquery';
import confirm from '../react/confirm';


class EmptyInactiveScript {
    id = null;
    name = '...';
    active = false;
    available = false;
    cloning_process = true;
}

export class ScriptsStore {
    @observable scripts = [];
    @observable template_scripts = [];
    @observable available_scripts = [];

    @observable filter_by_name = '';
    @observable filter_by_project = null;

    @observable creating_name = '';
    @observable creating_project = null;
    @observable creating_template = null;
    @observable editing = null;

    @action updateScripts(usersStore, update_cloning_tasks) {
        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-scripts-url'),
            data: (update_cloning_tasks ? {update_cloning_tasks: true} : null),
            success: (res) => {
                this.scripts = res.scripts;
                if(usersStore) {
                    usersStore.session_user = res.session_user;
                }
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    @action createCloningProcess(length) {
        let scripts = this.scripts.filter(script => {
            return !script.cloning_process;
        });
        if(length) {
            let empty_scripts = [];
            for(let i = 0; i < length; i++) {
                empty_scripts.push(new EmptyInactiveScript());
            }
            this.scripts = [...empty_scripts, ...scripts];
        } else {
            this.scripts = scripts;
        }
    }
    filteredScripts(available) {
        let scripts;
        if (this.scripts.length > 0) {
            let matches_by_name = new RegExp(this.filter_by_name, 'i');
            scripts = (available ? this.available_scripts : this.scripts).filter(script => !this.filter_by_name || matches_by_name.test(script.name));
            return scripts.filter(script => !this.filter_by_project || (script.project ? script.project.id === this.filter_by_project : false));
        }
        return [];
    }
    script(id) {
        return this.scripts.concat(this.available_scripts).find(script => parseInt(script.id) === parseInt(id));
    }
    resetCreating() {
        this.creating_name = '';
        this.creating_project = null;
    }

    @action createTable(script) {
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-tables-url'),
            data: JSON.stringify({
                script: script.id
            }),
            success: (res) => {
                console.log(res);
                script.data = res.data;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    @action updateTable(script, table, modalStore, e) {
        if(e) {e.preventDefault()}
        $.ajax({
            method: 'PUT',
            url: document.body.getAttribute('data-tables-url'),
            data: JSON.stringify({
                script: script.id,
                table: table
            }),
            success: (res) => {
                script.data = res.data;
                if(modalStore) {
                    modalStore.modal = false;
                    this.editing = null;
                }
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    @action deleteTable(script, table) {
        confirm("Вы действительно хотите удалить таблицу: " + table.name).then(
            (result) => {
                $.ajax({
                    method: 'DELETE',
                    url: document.body.getAttribute('data-tables-url'),
                    data: JSON.stringify({
                        script: script.id,
                        table: table.id
                    }),
                    success: (res) => {
                        script.data = res.data;
                    },
                    error: (res) => {
                        console.log(res);
                    }
                });
            },
            (result) => {
                console.log('cancel called');
            }
        )
    }
    @action createColl(script, table) {
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-colls-url'),
            data: JSON.stringify({
                script: script.id,
                table: table.id
            }),
            success: (res) => {
                script.data = res.data;
                if(this.editing && this.editing.colls) {
                    this.editing.colls.push(res.new_coll);
                }
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    @action deleteColl(script, table, colls, coll, i) {
        confirm("Вы действительно хотите удалить столбец: " + coll.name).then(
            (result) => {
                $.ajax({
                    method: 'DELETE',
                    url: document.body.getAttribute('data-colls-url'),
                    data: JSON.stringify({
                        script: script.id,
                        table: table.id,
                        coll: coll.id
                    }),
                    success: (res) => {
                        script.data = res.data;
                        colls.splice(i, 1);
                    },
                    error: (res) => {
                        console.log(res);
                    }
                });
            },
            (result) => {
                console.log('cancel called');
            }
        );
    }

}

export default new ScriptsStore