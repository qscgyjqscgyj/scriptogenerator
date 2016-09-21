import {computed, observable} from 'mobx';

class Project {
    constructor(project) {
        this.__proto__ = Object.create(project);
    }
}

export class ProjectsStore {
    @observable projects = [];
    @observable filter_by_name = '';
    @observable creating_name = '';
    @observable editing = null;

    @computed get filteredProjects() {
        var matches_by_name = new RegExp(this.filter_by_name, 'i');
        return this.projects.filter(project => !this.filter_by_name || matches_by_name.test(project.name));
    }
    @computed get owner() {
        return this.projects.length > 0 ? this.projects[0].owner : parseInt(document.body.getAttribute('data-user-id'));
    }
    project(id) {
        return this.projects.find(project => parseInt(project.id) === parseInt(id));
    }
    createProjects(projects) {
        //this.projects = [];
        //projects.map(project => this.projects.push(new Project(project)));
        this.projects = projects;
    }
}

export default new ProjectsStore