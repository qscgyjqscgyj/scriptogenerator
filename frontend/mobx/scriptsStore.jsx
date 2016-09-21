import {computed, observable} from 'mobx';

export class ScriptsStore {
    @observable scripts = [];
    @observable filter_by_name = '';
    @observable filter_by_project = null;
    @observable creating_name = '';
    @observable creating_project = null;
    @observable editing = null;

    @computed get filteredScripts() {
        var scripts;
        var matches_by_name = new RegExp(this.filter_by_name, 'i');
        scripts = this.scripts.filter(script => !this.filter_by_name || matches_by_name.test(script.name));
        return scripts.filter(script => !this.filter_by_project || script.project.id === this.filter_by_project);
    }
    script(id) {
        return this.scripts.find(script => parseInt(script.id) === parseInt(id));
    }
}

export default new ScriptsStore