import {computed, observable} from 'mobx';

export class ScriptsStore {
    @observable scripts = [];
    @observable filter_by_name = '';
    @observable filter_by_project = null;
    @observable modal = false;
    @computed get filteredScripts() {
        var scripts;
        var matches_by_name = new RegExp(this.filter_by_name, 'i');
        scripts = this.scripts.filter(script => !this.filter_by_name || matches_by_name.test(script.name));
        return scripts.filter(script => !this.filter_by_project || script.project.id === this.filter_by_project);
    }
    @computed get projects() {
        var projects = [];
        var exist_projects = [];
        this.scripts.map((script)=>{
            if(!exist_projects.includes(script.project)) {
                projects.push(script.project);
                exist_projects.push(script.project);
            }
        });
        return projects;
    }
}

export default new ScriptsStore