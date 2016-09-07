import {computed, observable} from 'mobx';

export class ScriptsStore {
    @observable scripts = [];
    @observable filter_by_name = '';
    @observable filter_by_project = null;
    @observable creating_name = '';
    @observable creating_project = null;

    @computed get filteredScripts() {
        var scripts;
        var matches_by_name = new RegExp(this.filter_by_name, 'i');
        scripts = this.scripts.filter(script => !this.filter_by_name || matches_by_name.test(script.name));
        return scripts.filter(script => !this.filter_by_project || script.project.id === this.filter_by_project);
    }
}

export default new ScriptsStore