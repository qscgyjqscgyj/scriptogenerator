import {computed, observable} from 'mobx';

export class ProjectsStore {
    @observable projects = [];
    @observable filter_by_name = '';
    @observable creating_name = '';

    @computed get filteredProjects() {
        var matches_by_name = new RegExp(this.filter_by_name, 'i');
        return this.projects.filter(project => !this.filter_by_name || matches_by_name.test(project.name));
    }
    @computed get owner() {
        return this.projects.length > 0 ? this.projects[0].owner : document.body.getAttribute('data-user-id');
    }
}

export default new ProjectsStore