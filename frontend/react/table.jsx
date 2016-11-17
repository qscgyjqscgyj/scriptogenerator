import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import {ModalWrapper} from './modal';
import {Coll} from '../mobx/tablesStore';
import {CustomEditor, styleMap} from './editor';
import {Link} from 'react-router';
import Clipboard from 'clipboard';
import {ContentState, convertFromRaw} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';
import {Sort} from './sort';
import {AccessableComponent} from './access';
import confirm from './confirm';


@observer
export class Table extends AccessableComponent {
    constructor(props) {
        super(props);

        this.state = {
            key: null
        }
    }
    componentWillMount() {
        const {tablesStore} = this.props;
        tablesStore.pullTables(this.props.params.script);
    }
    componentWillReceiveProps(props) {
        const {tablesStore} = props;
        tablesStore.pullTables(props.params.script);
    }
    componentDidMount() {
        const {tablesStore} = this.props;
        new Clipboard('.copy_icon', {
            text: function(trigger) {
                if(tablesStore.pressed_key === 17) {
                    return trigger.getAttribute('data-link');
                } else {
                    return '';
                }
            }
        });
        $(document.body).on('keydown', this.handleKeyDown.bind(this));
        $(document.body).on('keyup', this.handleKeyUp.bind(this));
    }

    componentWillUnmount() {
        $(document.body).off('keydown', this.handleKeyDown.bind(this));
        $(document.body).off('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown(e) {
        const {tablesStore} = this.props;
        if(e.keyCode === 17) {
            tablesStore.pressed_key = e.keyCode;
        }
    }

    handleKeyUp(e) {
        const {tablesStore} = this.props;
        tablesStore.pressed_key = null;
    }

    componentDidUpdate() {
        const content_height = screen.height - 200;
        let scroll_links = [].slice.call(document.getElementsByClassName('scroll_links'));
        scroll_links.map(el => {
            $(el).css('min-height', content_height + 'px');
            $(el).css('max-height', content_height + 'px');
        });
    }

    updateTableLinksColl(coll) {
        const {tablesStore} = this.props;
        $.ajax({
            method: 'PUT',
            url: document.body.getAttribute('data-colls-url'),
            data: JSON.stringify(coll),
            success: (res) => {
                tablesStore.tables = res.tables;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    createLinkCategory(coll, hidden) {
        const {tablesStore} = this.props;
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-link-categories-url'),
            data: JSON.stringify({name: 'Пустой раздел', table: coll.id, hidden: hidden}),
            success: (res) => {
                tablesStore.tables = res.tables;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    deleteLinkCategory(category) {
        const {tablesStore} = this.props;
        confirm("Вы действительно хотите удалить категорию: " + category.name).then(
            (result) => {
                $.ajax({
                    method: 'DELETE',
                    url: document.body.getAttribute('data-link-categories-url'),
                    data: JSON.stringify({category: category.id, table: this.props.params.table}),
                    success: (res) => {
                        tablesStore.tables = res.tables;
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

    updateLinkCategory(category) {
        const {tablesStore} = this.props;
        $.ajax({
            method: 'PUT',
            url: document.body.getAttribute('data-link-categories-url'),
            data: JSON.stringify(category),
            success: (res) => {
                tablesStore.tables = res.tables;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    createLink(category) {
        const {tablesStore} = this.props;
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-links-url'),
            data: JSON.stringify({name: 'Ссылка', category: category.id, text: 'Текст ссылки'}),
            success: (res) => {
                tablesStore.tables = res.tables;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    deleteLink(link) {
        const {tablesStore} = this.props;
        confirm("Вы действительно хотите удалить ссылку: " + link.name).then(
            (result) => {
                $.ajax({
                    method: 'DELETE',
                    url: document.body.getAttribute('data-links-url'),
                    data: JSON.stringify({link: link.id, table: this.props.params.table}),
                    success: (res) => {
                        tablesStore.tables = res.tables;
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

    updateLink(link) {
        const {tablesStore} = this.props;
        $.ajax({
            method: 'PUT',
            url: document.body.getAttribute('data-links-url'),
            data: JSON.stringify(link),
            success: (res) => {
                tablesStore.tables = res.tables;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    sortedColls() {
        const {tablesStore} = this.props;
        let table = tablesStore.table(this.props.params.table);
        if(table) {
            var sorted_colls = [];
            sorted_colls.push({position: table.text_coll_position, text: true});
            table.colls.map(coll => {
                sorted_colls.push({coll: coll, position: coll.position, text: false});
            });
            return sorted_colls.sort(
                function (a, b) {
                    if (a.position > b.position) {
                        return 1;
                    }
                    if (a.position < b.position) {
                        return -1;
                    }
                    return 0;
                }
            );
        }
    }

    copyLink(link) {
        return (
            '/#/tables/' + this.props.params.script +
            '/table/' + this.props.params.table +
            '/link/' + link.id +
            '/share/'
        )
    }

    onCategorySort(items) {
        items.map((item, key) => {
            item.props.category.order = key;
        });
        return this.updateTableLinksColl(items[0].props.coll);
    }
    onLinkSort(items) {
        items.map((item, key) => {
            item.props.link.order = key;
        });
        return this.updateLinkCategory(items[0].props.category);
    }
}

@observer
export class TableEdit extends Table {
    render() {
        const {projectsStore, scriptsStore, tablesStore, modalStore, usersStore} = this.props;
        let table = tablesStore.table(this.props.params.table);
        let active_link = tablesStore.link(this.props.params.table, this.props.params.link);
        let sorted_colls = this.sortedColls();
        var coll_name, coll_size;

        if(usersStore.session_user) {
            let script = scriptsStore.script(this.props.params.script);
            let access = this.access(usersStore, script);
            if (table && access.edit) {
                return (
                    <div className="scrollable_panel">
                        <div className="scroll_block">
                            {sorted_colls.map((coll, key) => {
                                if (coll.text) {
                                    return (
                                        <div className="scroll_links" key={key} style={{width: table.text_coll_size + '%'}}>
                                            {active_link ?
                                                <div>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <h4 className="table_header_text">{active_link.name}</h4>
                                                        </div>
                                                        <div className="col-md-4 pull-right">
                                                            <button className="btn btn-success" onClick={() => {this.updateLink(active_link)}}>
                                                                Сохранить изменения
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="link_text_editor">
                                                        <CustomEditor object={active_link} value={active_link.text} onChange={(value) => {
                                                            active_link.text = value;
                                                        }} />
                                                    </div>
                                                </div>
                                                :
                                                ''
                                            }
                                        </div>
                                    )
                                } else if (!coll.text) {
                                    coll = coll.coll;
                                    return (
                                        <div className="scroll_links" key={key} style={{width: coll.size + '%'}}>
                                            <div className="row">
                                                <div className="col-md-1">
                                                    <i className="icon add_icon glyphicon glyphicon-plus" onClick={() => {this.createLinkCategory(coll, false)}}/>
                                                </div>
                                                <div className="col-md-1">
                                                    <i className="icon red_icon glyphicon glyphicon-plus" onClick={() => {this.createLinkCategory(coll, true)}}/>
                                                </div>
                                            </div>
                                            <Sort onSort={this.onCategorySort.bind(this)} left={true} child={true}>
                                                {coll.categories.map((category, key) => {
                                                    return (
                                                        <div key={key} category={category} coll={coll} className={category.hidden ? 'hidden_links' : ''}>
                                                            <div className="row">
                                                                <div className="col-md-9">
                                                                    <h4 className="table_header_text">
                                                                        <EditableText
                                                                            text={category.name}
                                                                            field={'name'}
                                                                            submitHandler={(category) => this.updateLinkCategory(category)}
                                                                            object={category}
                                                                            settings={{
                                                                                placeholder: 'Имя категории',
                                                                                name: 'name'
                                                                            }}
                                                                        />
                                                                    </h4>
                                                                </div>
                                                                <div className="col-md-1">
                                                                    <i className="icon add_icon icon_vertical_centre glyphicon glyphicon-plus" onClick={()=>{this.createLink(category)}}/>
                                                                </div>
                                                                <div className="col-md-1">
                                                                    <i className="glyphicon glyphicon-remove icon icon_vertical_centre red_icon" aria-hidden="true" onClick={()=>{this.deleteLinkCategory(category)}}/>
                                                                </div>
                                                            </div>
                                                            <Sort onSort={this.onLinkSort.bind(this)} left={true}>
                                                                {category.links.map((link, key) => {
                                                                    return (
                                                                        <div key={key} category={category} link={link}>
                                                                            <div className="row">
                                                                                <div className="col-md-9 link_name">
                                                                                    <EditableText
                                                                                        text={link.name}
                                                                                        field={'name'}
                                                                                        onClick={(link, e) => {
                                                                                            if(!tablesStore.pressed_key) {
                                                                                                window.location = '/#/' +
                                                                                                    '/tables/' + this.props.params.script +
                                                                                                    '/table/' + this.props.params.table +
                                                                                                    '/link/' + link.id +
                                                                                                    '/edit/'
                                                                                            }
                                                                                        }}
                                                                                        data_link={this.copyLink(link)}
                                                                                        submitHandler={(link) => this.updateLink(link)}
                                                                                        object={link}
                                                                                        settings={{
                                                                                            placeholder: 'Имя ссылки',
                                                                                            name: 'name'
                                                                                        }}/>
                                                                                </div>
                                                                                <div className="col-md-1"></div>
                                                                                <div className="col-md-1">
                                                                                    <span className="glyphicon glyphicon-remove icon red_icon" aria-hidden="true" onClick={()=>{this.deleteLink(link)}}/>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </Sort>
                                                        </div>
                                                    )
                                                })}
                                            </Sort>
                                        </div>
                                    )
                                }
                            })}
                        </div>
                    </div>
                );
            }
            return null;
        }
        return null;
    }
}

@observer
export class TableShare extends Table {
    render() {
        const {projectsStore, scriptsStore, tablesStore, modalStore, usersStore} = this.props;
        let table = tablesStore.table(this.props.params.table);
        let active_link = tablesStore.link(this.props.params.table, this.props.params.link);
        let sorted_colls = this.sortedColls();
        var coll_name, coll_size;
        if(usersStore.session_user) {
            let script = scriptsStore.script(this.props.params.script);
            let access = this.access(usersStore, script);
            if (table && access) {
                return (
                    <div className="scrollable_panel">
                        <div className="scroll_block">
                            {sorted_colls.map((coll, key) => {
                                if (coll.text) {
                                    let text;
                                    try {
                                        let options = {
                                            inlineStyles: {
                                                red: {style: styleMap.red},
                                                gray: {style: styleMap.gray},
                                            },
                                        };
                                        text = stateToHTML(convertFromRaw(JSON.parse(active_link.text)), options);
                                    } catch(err) {
                                        console.log(err);
                                        text = '';
                                    }
                                    return (
                                        <div className="scroll_links" key={key} style={{width: table.text_coll_size + '%'}}>
                                            {active_link ?
                                                <div>
                                                    <h4 className="table_header_text">{active_link.name}</h4>
                                                    <div dangerouslySetInnerHTML={{__html: text}}></div>
                                                </div>
                                                :
                                                ''
                                            }
                                        </div>
                                    )
                                } else if (!coll.text) {
                                    coll = coll.coll;
                                    return (
                                        <div className="scroll_links" key={key} style={{width: coll.size + '%'}}>
                                            {coll.categories.map((category, key) => {
                                                if(!category.hidden) {
                                                    return (
                                                        <div key={key} className={category.hidden ? 'hidden_links' : ''}>
                                                            <h4 className="table_header_text">
                                                                <div className="row">
                                                                    <div className="col-md-12">
                                                                        {category.name}
                                                                    </div>
                                                                </div>
                                                            </h4>
                                                            {category.links.map((link, key) => {
                                                                return (
                                                                    <div key={key}>
                                                                        <div className="row">
                                                                            <div className="col-md-12 link_name">
                                                                                <Link to={
                                                                                    '/tables/' + this.props.params.script +
                                                                                    '/table/' + this.props.params.table +
                                                                                    '/link/' + link.id +
                                                                                    '/share/'
                                                                                }>{link.name}</Link>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )
                                                }
                                            })}
                                        </div>
                                    )
                                }
                            })}
                        </div>
                    </div>
                );
            }
            return null;
        }
        return null;
    }
}

class EditableText extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: this.props.text,
            edit: false,
            key: null
        }
    }
    componentWillReceiveProps(props) {
        this.setState({text: props.text, edit: false})
    }
    submitHandler(e) {
        e.preventDefault();
        let object = this.props.object;
        object[this.props.field] = this.state.text;
        this.setEdit(false);
        return this.props.submitHandler(object);
    }
    setEdit(edit) {
        this.setState(update(this.state, {edit: {$set: edit}}))
    }
    render() {
        const {settings} = this.props;
        return (
            <div>
                {!this.state.edit ?
                    <span className="copy_icon"
                        data-link={this.props.data_link}
                        onClick={(e) => {
                            if(this.props.onClick) {
                                this.props.onClick(this.props.object, e)
                            }
                        }}
                        onDoubleClick={() => {this.setEdit(true)}}
                        >{this.props.text}</span>
                :
                    <form onSubmit={this.submitHandler.bind(this)}>
                        <input
                            onChange={(e) => {this.setState(update(this.state, {text: {$set: e.target.value}}))}}
                            placeholder={settings.placeholder}
                            name={settings.name}
                            value={this.state.text}
                            type="text"/>
                    </form>
                }
            </div>
        )
    }
}
