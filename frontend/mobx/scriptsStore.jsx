import {computed, observable} from 'mobx';

export class ScriptsStore {
    @observable scripts = [];
    @observable available_scripts = [];
    @observable filter_by_name = '';
    @observable filter_by_project = null;
    @observable creating_name = '';
    @observable creating_project = null;
    @observable editing = null;

    filteredScripts(available) {
        var scripts;
        var matches_by_name = new RegExp(this.filter_by_name, 'i');
        scripts = (available ? this.available_scripts : this.scripts).filter(script => !this.filter_by_name || matches_by_name.test(script.name));
        return scripts.filter(script => !this.filter_by_project || script.project.id === this.filter_by_project);
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