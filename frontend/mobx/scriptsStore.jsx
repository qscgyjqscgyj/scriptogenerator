import {computed, observable, action, map} from 'mobx';
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

    @observable loading = true;

    @action setLoading(loading=true) {
        if(!this.loading) {
            this.loading = loading;
        }
    }

    @action updateScripts(usersStore) {
        this.loading = true;
        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-scripts-url'),
            success: (res) => {
                this.scripts = res.scripts;
                this.loading = false;
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
        if (this.scripts && this.scripts.length > 0) {
            let matches_by_name = new RegExp(this.filter_by_name, 'i');
            scripts = (available ? this.available_scripts : this.scripts).filter(script => !this.filter_by_name || matches_by_name.test(script.name));
            return scripts.filter(script => !this.filter_by_project || (script.project ? script.project.id === this.filter_by_project : false));
        }
        return [];
    }
    script(id) {
        return this.scripts.concat(this.available_scripts).find(script => parseInt(script.id) === parseInt(id));
    }
    table(script, id) {
        return script.data.find(table => parseInt(table.id) === parseInt(id));
    }
    link(script, id, with_parents=false) {
        // "with_parents=true" returns object with link and table.id
        if(id) {
            let all_links = [];
            script.data.forEach(table => {
                table.colls.forEach(coll => {
                    coll.categories.forEach(category => {
                        category.links.forEach(link => {
                            if(with_parents) {
                                all_links.push({link: link, table: table.id, coll: coll.id, category: category.id});
                            } else {
                                all_links.push(link);
                            }
                        })
                    })
                })
            });
            return all_links.find(link => parseInt(!with_parents ? link.id : link.link.id) === parseInt(id));
        }
        return null;
    }
    scriptUrl(script) {
        return `/tables/${script.id}/`;
    }
    tableUrl(script, table, mode='share') {
        return `${this.scriptUrl(script)}table/${table.id}/${mode}/`;
    }
    linkURL(script, table, link, mode='share', copy=false) {
        function get_url(table_to=table.id, link_to=link.id) {
            return `${!copy ? `/tables/${script.id}` : ''}/table/${table_to}/link/${link_to}/${mode}/`;
        }

        if(!link.to_link) {
            return get_url();
        } else {
            let to_link = this.link(script, link.to_link, true);
            return to_link ? get_url(to_link.table, to_link.link.id) : null;
        }
    }
    resetCreating() {
        this.creating_name = '';
        this.creating_template = null;
    }

    @action getScripts(data={page: 1}, success) {
        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-scripts-url'),
            data: data,
            success: success,
            error: (res) => {
                console.log(res);
            }
        });
    }
    @action getInitialData() {
        if(this.scripts.length === 0) {
            this.loading = true;
            function success(res) {
                res.scripts.forEach(script => this.scripts.push(script));
                if(res.next_page) {
                    this.getScripts({page: parseInt(res.page) + 1}, success.bind(this));
                } else {
                    this.loading = false;
                }
            }
            this.getScripts({page: 1}, success.bind(this));
        }
    }
    @action getAvailableScripts() {
        if(this.scripts.length === 0) {
            this.loading = true;
            function success(res) {
                res.scripts.forEach(script => this.available_scripts.push(script));
                if(res.next_page) {
                    this.getScripts({page: parseInt(res.page) + 1, available_scripts: true}, success.bind(this));
                } else {
                    this.loading = false;
                }
            }
            this.getScripts({page: 1, available_scripts: true}, success.bind(this));
        }
    }
    @action getScriptData(script, cb) {
        this.loading = true;
        $.ajax({
            method: 'GET',
            url: document.body.getAttribute('data-script-url'),
            data: {script: script.id},
            success: (res) => {
                script.data = res.script.data;
                script.accesses = res.script.accesses;
                this.loading = false;
                if(cb) {
                    return cb();
                }
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    @action createTable(script) {
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-tables-url'),
            data: JSON.stringify({
                script: script.id
            }),
            success: (res) => {
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
                if(script.data !== res.data) {
                    script.data = res.data;
                }
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
    @action updateColl(script, table, coll) {
        $.ajax({
            method: 'PUT',
            url: document.body.getAttribute('data-colls-url'),
            data: JSON.stringify({
                script: script.id,
                table: table.id,
                coll: coll
            }),
            success: (res) => {
                if(script.data !== res.data) {
                    script.data = res.data;
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
    @action createLinkCategory(script, table, coll, hidden=false) {
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-link-categories-url'),
            data: JSON.stringify({
                script: script.id,
                table: table.id,
                coll: coll.id,
                hidden: hidden
            }),
            success: (res) => {
                // script.data = res.data;
                coll.categories.push(res.category);
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    @action updateLinkCategory(script, table, coll, category, update_data=true) {
        $.ajax({
            method: 'PUT',
            url: document.body.getAttribute('data-link-categories-url'),
            data: JSON.stringify({
                script: script.id,
                table: table.id,
                coll: coll.id,
                category: category,
            }),
            success: (res) => {
                if(script.data !== res.data && update_data) {
                    script.data = res.data;
                }
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    @action deleteLinkCategory(script, table, coll, category, category_index) {
        confirm("Вы действительно хотите удалить категорию: " + category.name).then(
            (result) => {
                $.ajax({
                    method: 'DELETE',
                    url: document.body.getAttribute('data-link-categories-url'),
                    data: JSON.stringify({
                        script: script.id,
                        table: table.id,
                        coll: coll.id,
                        category: category.id,
                    }),
                    success: (res) => {
                        // script.data = res.data;
                        coll.categories.splice(category_index, 1);
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
    @action createLink(script, table, coll, category, to_link=null) {
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-links-url'),
            data: JSON.stringify({
                script: script.id,
                table: table.id,
                coll: coll.id,
                category: category.id,
                to_link: to_link,
            }),
            success: (res) => {
                // script.data = res.data;
                category.links.push(res.link);
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
    @action deleteLink(script, table, coll, category, link, link_index) {
        confirm("Вы действительно хотите удалить ссылку: " + link.name).then(
            (result) => {
                $.ajax({
                    method: 'DELETE',
                    url: document.body.getAttribute('data-links-url'),
                    data: JSON.stringify({
                        script: script.id,
                        table: table.id,
                        coll: coll.id,
                        category: category.id,
                        link: link.id,
                    }),
                    success: (res) => {
                        // script.data = res.data;
                        category.links.splice(link_index, 1);
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
    @action updateLink(script, table, coll, category, link, update_data=true) {
        $.ajax({
            method: 'PUT',
            url: document.body.getAttribute('data-links-url'),
            data: JSON.stringify({
                script: script.id ? script.id : script,
                table: table.id ? table.id : table,
                coll: coll.id ? coll.id : coll,
                category: category.id ? category.id : category,
                link: link,
            }),
            success: (res) => {
                if(script.data !== res.data && update_data) {
                    script.data = res.data;
                }
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
}

export default new ScriptsStore