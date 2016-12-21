import {computed, observable, action} from 'mobx';
import $ from 'jquery';

export class ScriptsStore {
    @observable scripts = [];
    @observable available_scripts = [];
    @observable filter_by_name = '';
    @observable filter_by_project = null;
    @observable creating_name = '';
    @observable creating_project = null;
    @observable editing = null;

    @action updateScripts() {
        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-scripts-url'),
            success: (res) => {
                this.scripts = res.scripts;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    filteredScripts(available) {
        let scripts;
        let matches_by_name = new RegExp(this.filter_by_name, 'i');
        scripts = (available ? this.available_scripts : this.scripts).filter(script => !this.filter_by_name || matches_by_name.test(script.name));
        return scripts.filter(script => !this.filter_by_project || (script.project ? script.project.id === this.filter_by_project : false));
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