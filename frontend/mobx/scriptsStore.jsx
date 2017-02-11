import {computed, observable, action} from 'mobx';
import $ from 'jquery';

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
}

export default new ScriptsStore