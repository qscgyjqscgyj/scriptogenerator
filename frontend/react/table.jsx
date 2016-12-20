import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import {ModalWrapper} from './modal';
import {Coll} from '../mobx/tablesStore';
import {CustomEditor, styleMap, DECORATORS} from './editor/editor';
import {Link} from 'react-router';
import Clipboard from 'clipboard';
import {EditorState, ContentState, convertFromRaw} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';
import {Sort, moveInArray} from './sort';
import {AccessableComponent} from './access';
import confirm from './confirm';
import Select from 'react-select';
import {extendObservable} from 'mobx';
import ReactTooltip from 'react-tooltip';

@observer
export class Table extends AccessableComponent {
    constructor(props) {
        super(props);

        this.state = {
            key: null,
            clipboard: null
        }
    }
    fixClipboard(onInit, onDestroy) {
        const {clipboard} = this.state;
        let new_clipboard = new Clipboard('.copy_icon', {
            text: function(trigger) {
                return trigger.getAttribute('data-link');
            }
        });

        if(this.state.clipboard) {
            clipboard.destroy();
            this.setState(update(this.state, {clipboard: {
                $set: null
            }}), () => {
                onDestroy ? onDestroy() : null;
            });
        }
        this.setState(update(this.state, {clipboard: {
            $set: new_clipboard
        }}), () => {
            return onInit ? onInit() : null;
        });
    }
    componentWillMount() {
        const {tablesStore} = this.props;
        this.fixClipboard();
        tablesStore.pullTables(this.props.params.script);
    }
    componentWillReceiveProps(props) {
        const {tablesStore} = props;
        tablesStore.pullTables(props.params.script);
    }
    componentDidMount() {
        const {tablesStore} = this.props;

        $(document.body).on('keydown', this.handleKeyDown.bind(this));
        $(document.body).on('keyup', this.handleKeyUp.bind(this));
    }

    componentWillUnmount() {
        $(document.body).off('keydown', this.handleKeyDown.bind(this));
        $(document.body).off('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown(e) {
        const {tablesStore} = this.props;
        // 17 - CTRL, 16 - SHIFT
        if(e.keyCode === 17 || e.keyCode === 16) {
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

    createLink(category, to_link) {
        const {tablesStore} = this.props;
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-links-url'),
            data: JSON.stringify({
                name: to_link ? to_link.name : 'Ссылка',
                category: category.id,
                text: to_link ? to_link.text : 'Текст ссылки',
                to_link: to_link ? to_link.id : null
            }),
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

    updateLink(link, onSave) {
        const {tablesStore} = this.props;
        $.ajax({
            method: 'PUT',
            url: document.body.getAttribute('data-links-url'),
            data: JSON.stringify(link),
            success: (res) => {
                tablesStore.tables = res.tables;
                if(onSave) {
                    return onSave(false);
                }
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
            let sorted_colls = [];
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
        if(!link.to_link) {
            return (
                '/tables/' + this.props.params.script +
                '/table/' + this.props.params.table +
                '/link/' + link.id +
                '/share/'
            )
        } else {
            return (
                link.to_link.href + '/share/'
            )
        }
    }

    onCategorySort(coll) {
        coll.categories.map((category, key) => {
            category.order = key;
        });
        return this.updateTableLinksColl(coll);
    }
    onLinkSort(category) {
        category.links.map((link, key) => {
            link.order = key;
        });
        return this.updateLinkCategory(category);
    }
    createToLink(category, link, cb) {
        this.createLink(category, link);
        return cb();
    }
}

@observer
export class TableEdit extends Table {
    constructor(props) {
        super(props);

        this.state = {
            changed: false
        }
    }
    //componentWillReceiveProps(props) {
    //    this.setState(update(this.state, {changed: {$set: props.changed}}))
    //}
    changed(changed) {
        this.setState(update(this.state, {changed: {$set: changed}}))
    }
    render() {
        const {projectsStore, scriptsStore, tablesStore, modalStore, usersStore} = this.props;
        let table = tablesStore.table(this.props.params.table);
        let active_link = tablesStore.link(this.props.params.table, this.props.params.link);
        let sorted_colls = this.sortedColls();
        let coll_name, coll_size;

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
                                                        <div className="col-md-12">
                                                            <h4 className="table_header_text">{active_link.name}</h4>
                                                        </div>
                                                        {/*<div className="col-md-4 pull-right">*/}
                                                            {/*<button className={'btn ' + (this.state.changed ? 'btn-success' : 'btn-default')} onClick={() => {this.updateLink(active_link, this.changed.bind(this))}}>*/}
                                                                {/*Сохранить*/}
                                                            {/*</button>*/}
                                                        {/*</div>*/}
                                                    </div>
                                                    <div className="link_text_editor">
                                                        <CustomEditor object={active_link} value={active_link.text}
                                                            onChange={(value) => {
                                                                this.changed(true);
                                                                active_link.text = value;
                                                            }}
                                                            onBlur={(value) => {
                                                                this.changed(true);
                                                                active_link.text = value;
                                                                this.updateLink(active_link, this.changed.bind(this));
                                                            }}/>
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
                                                    <i data-tip="Добавить раздел" id='add_category' className="icon add_icon glyphicon glyphicon-plus" onClick={() => {this.createLinkCategory(coll, false)}}/>
                                                </div>
                                                <ReactTooltip data-for='add_category' place="top" type="dark" effect="solid"/>

                                                <div className="col-md-1">
                                                    <i data-tip="Добавить скрытый раздел" id='add_hidden_category' className="icon red_icon glyphicon glyphicon-plus" onClick={() => {this.createLinkCategory(coll, true)}}/>
                                                </div>
                                                <ReactTooltip data-for='add_hidden_category' place="top" type="dark" effect="solid"/>
                                            </div>
                                            {coll.categories.map((category, key) => {
                                                return (
                                                    <div key={key} className={category.hidden ? 'hidden_links' : ''}>
                                                        <div className="row">
                                                            <div className={"col-md-12 inline_elements edit_icon_handler hovered_list_item " + (category.opened ? 'opened' : null)}>
                                                                <i className="glyphicon glyphicon-edit edit_icon inline_element"
                                                                   onClick={() => {
                                                                       category.opened = !category.opened;
                                                                       coll.categories.map((cat) => {
                                                                           if(cat.id !== category.id) {
                                                                               cat.opened = false;
                                                                           }
                                                                           cat.links.map((link) => {
                                                                               link.opened = false;
                                                                           });
                                                                       });
                                                                       this.updateTableLinksColl(coll);
                                                                   }}/>
                                                                <span className="table_header_text inline_element">
                                                                    <EditableText
                                                                        text={category.name}
                                                                        field={'name'}
                                                                        submitHandler={(category) => this.updateLinkCategory(category)}
                                                                        onClick={(category) => {
                                                                            if(tablesStore.pressed_key === 16) {
                                                                                category.edit = true;
                                                                            }
                                                                        }}

                                                                        object={category}
                                                                        edit={category.edit}
                                                                        settings={{
                                                                            placeholder: 'Имя категории',
                                                                            name: 'name'
                                                                        }}
                                                                    />
                                                                </span>

                                                                {category.opened ?
                                                                    <div className="col-md-12 opened_toolbar">
                                                                        <div className="btn-toolbar" role="toolbar">
                                                                            <div className="btn-group btn-group-xs" role="group">
                                                                                <button data-tip="Создать ссылку" id={'create_link' + category.id} className="btn btn-default" onClick={()=>{this.createLink(category)}}>
                                                                                    <i className="icon add_icon glyphicon glyphicon-plus"/>
                                                                                </button>
                                                                                <button data-tip="Создать ссылку на другую таблицу" id={'create_ext_link' + category.id} className="btn btn-default"
                                                                                    onClick={() => {
                                                                                        modalStore.modal = true;
                                                                                        modalStore.component = React.createElement(ToLink, {
                                                                                            category: category,
                                                                                            tablesStore: tablesStore,
                                                                                            createToLink: this.createToLink.bind(this),
                                                                                            modalStore: modalStore
                                                                                        });
                                                                                    }}>
                                                                                    <i className="icon add_icon_blue glyphicon glyphicon-plus"/>
                                                                                </button>
                                                                            </div>
                                                                            <ReactTooltip data-for={'create_link' + category.id} place="top" type="dark" effect="solid"/>
                                                                            <ReactTooltip data-for={'create_ext_link' + category.id} place="top" type="dark" effect="solid"/>

                                                                            <div className="btn-group btn-group-xs" role="group">
                                                                                <button data-tip="Переименовать раздел" id={'rename_category' + category.id} onClick={()=>{category.edit = !category.edit}} className="btn btn-default">
                                                                                    <i className="glyphicon glyphicon-edit"/>
                                                                                </button>
                                                                            </div>
                                                                            <ReactTooltip data-for={'rename_category' + category.id} place="top" type="dark" effect="solid"/>

                                                                            <div className="btn-group btn-group-xs" role="group">
                                                                                <button data-tip="Удалить раздел" id={'delete_category' + category.id} style={{color: '#fff'}} onClick={()=>{this.deleteLinkCategory(category)}} className="btn btn-danger">
                                                                                    <i className="glyphicon glyphicon-remove"/>
                                                                                </button>
                                                                            </div>
                                                                            <ReactTooltip data-for={'delete_category' + category.id} place="top" type="dark" effect="solid"/>

                                                                            <div className="btn-group btn-group-xs" role="group">
                                                                                {key !== 0 ?
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            coll.categories = moveInArray(coll.categories, key, key - 1);
                                                                                            this.onCategorySort(coll);
                                                                                        }}
                                                                                        data-tip="Переместить вверх"
                                                                                        id={'move_up_category' + category.id}
                                                                                        className="btn btn-default">
                                                                                        <i className="glyphicon glyphicon-triangle-top"/>
                                                                                    </button>
                                                                                : null}
                                                                                {(key + 1) !== coll.categories.length ?
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            coll.categories = moveInArray(coll.categories, key, key + 1);
                                                                                            this.onCategorySort(coll);
                                                                                        }}
                                                                                        data-tip="Переместить вних"
                                                                                        id={'move_down_category' + category.id}
                                                                                        className="btn btn-default">
                                                                                        <i className="glyphicon glyphicon-triangle-bottom"/>
                                                                                    </button>
                                                                                : null}
                                                                            </div>
                                                                            <ReactTooltip data-for={'move_up_category' + category.id} place="top" type="dark" effect="solid"/>
                                                                            <ReactTooltip data-for={'move_down_category' + category.id} place="top" type="dark" effect="solid"/>

                                                                        </div>
                                                                    </div>
                                                                : null}
                                                            </div>
                                                        </div>
                                                        {category.links.map((link, key) => {
                                                            return (
                                                                <div key={key}>
                                                                    <div className="row">
                                                                        <div className={"col-md-12 hovered_list_item inline_elements edit_icon_handler " + (link.opened ? 'opened' : null)}>
                                                                            <i className="glyphicon glyphicon-edit edit_icon inline_element" onClick={() => {
                                                                                link.opened = !link.opened;
                                                                                coll.categories.map((cat) => {
                                                                                    cat.opened = false;
                                                                                    cat.links.map((ln) => {
                                                                                        if(ln.id !== link.id) {
                                                                                            ln.opened = false;
                                                                                        }
                                                                                    });
                                                                                });
                                                                                this.updateTableLinksColl(coll);
                                                                            }}/>
                                                                            <span data-link={this.copyLink(link)}
                                                                                  className={"inline_element link " + (category.hidden ? 'hidden_links' : 'link_name') + ' ' + (!link.edit ? 'copy_icon' : null)}>
                                                                                <EditableText
                                                                                    text={link.name}
                                                                                    field={'name'}
                                                                                    onClick={(link) => {
                                                                                        if(!tablesStore.pressed_key) {
                                                                                            this.props.router.push(
                                                                                                (!link.to_link ?
                                                                                                    '/tables/' + this.props.params.script +
                                                                                                    '/table/' + this.props.params.table +
                                                                                                    '/link/' + link.id +
                                                                                                    '/edit/'
                                                                                                :
                                                                                                    link.to_link.href + '/edit/'
                                                                                                )
                                                                                            );
                                                                                        } else if(tablesStore.pressed_key === 16) {
                                                                                            link.edit = true;
                                                                                            this.fixClipboard();
                                                                                        }
                                                                                    }}
                                                                                    submitHandler={(link) => this.updateLink(link)}
                                                                                    object={link}
                                                                                    edit={link.edit}
                                                                                    settings={{
                                                                                        placeholder: 'Имя ссылки',
                                                                                        name: 'name'
                                                                                    }}/>
                                                                            </span>

                                                                            {link.opened ?
                                                                                <div className="col-md-12 opened_toolbar">
                                                                                    <div className="btn-toolbar" role="toolbar">
                                                                                        <div className="btn-group btn-group-xs" role="group">
                                                                                            <button
                                                                                                data-tip="Скопировать адрес ссылки (Ctrl + клик по названию ссылки)"
                                                                                                id={'copy_link_address' + link.id}
                                                                                                data-link={this.copyLink(link)}
                                                                                                onClick={()=>{}} className="btn btn-default copy_icon">
                                                                                                <i className="glyphicon glyphicon-copy"/>
                                                                                            </button>
                                                                                        </div>
                                                                                        <ReactTooltip data-for={'copy_link_address' + link.id} place="top" type="dark" effect="solid"/>

                                                                                        <div className="btn-group btn-group-xs" role="group">
                                                                                            <button
                                                                                                data-tip="Переименовать ссылку (Shift + клик по названию ссылки)"
                                                                                                id={'rename_link' + link.id}
                                                                                                onClick={()=>{link.edit = !link.edit}}
                                                                                                className="btn btn-default">
                                                                                                <i className="glyphicon glyphicon-edit"/>
                                                                                            </button>
                                                                                        </div>
                                                                                        <ReactTooltip data-for={'rename_link' + link.id} place="top" type="dark" effect="solid"/>

                                                                                        <div className="btn-group btn-group-xs" role="group">
                                                                                            <button
                                                                                                data-tip="Удалить ссылку"
                                                                                                id={'delete_link' + link.id}
                                                                                                style={{color: '#fff'}}
                                                                                                onClick={()=>{this.deleteLink(link)}}
                                                                                                className="btn btn-danger">
                                                                                                <i className="glyphicon glyphicon-remove"/>
                                                                                            </button>
                                                                                        </div>
                                                                                        <ReactTooltip data-for={'delete_link' + link.id} place="top" type="dark" effect="solid"/>

                                                                                        <div className="btn-group btn-group-xs" role="group">
                                                                                            {key !== 0 ?
                                                                                                <button
                                                                                                    data-tip="Переместить вверх"
                                                                                                    id={'move_up_link' + link.id}
                                                                                                    onClick={() => {
                                                                                                        category.links = moveInArray(category.links, key, key - 1);
                                                                                                        this.onLinkSort(category);
                                                                                                    }}
                                                                                                    className="btn btn-default">
                                                                                                    <i className="glyphicon glyphicon-triangle-top"/>
                                                                                                </button>
                                                                                            : null}
                                                                                            {(key + 1) !== category.links.length ?
                                                                                                <button
                                                                                                    data-tip="Переместить вниз"
                                                                                                    id={'move_down_link' + link.id}
                                                                                                    onClick={() => {
                                                                                                        category.links = moveInArray(category.links, key, key + 1);
                                                                                                        this.onLinkSort(category);
                                                                                                    }}
                                                                                                    className="btn btn-default">
                                                                                                    <i className="glyphicon glyphicon-triangle-bottom"/>
                                                                                                </button>
                                                                                            : null}
                                                                                        </div>
                                                                                        <ReactTooltip data-for={'move_up_link' + link.id} place="top" type="dark" effect="solid"/>
                                                                                        <ReactTooltip data-for={'move_down_link' + link.id} place="top" type="dark" effect="solid"/>
                                                                                    </div>
                                                                                </div>
                                                                            : null}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                            {/*return (*/}
                                                                {/*<div key={key} category={category} link={link}>*/}
                                                                    {/*<div className="row">*/}
                                                                        {/*<div className="col-md-9 link_name">*/}
                                                                        {/*</div>*/}
                                                                        {/*<div className="col-md-1"></div>*/}
                                                                        {/*<div className="col-md-1">*/}
                                                                            {/*<span className="glyphicon glyphicon-remove icon red_icon" aria-hidden="true" onClick={()=>{this.deleteLink(link)}}/>*/}
                                                                        {/*</div>*/}
                                                                    {/*</div>*/}
                                                                {/*</div>*/}
                                                            {/*)*/}
                                                        })}
                                                </div>
                                                )
                                            })}
                                        </div>
                                    )
                                }
                            })}
                        </div>
                        <ModalWrapper
                            scriptsStore={scriptsStore}
                            tablesStore={tablesStore}
                            projectsStore={projectsStore}
                            modalStore={modalStore}/>
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
    componentDidMount() {
        $(document).on("click", "#link_text_block a", (e) => {
            e.preventDefault();
            const {router} = this.props;

            if(e.target.tagName !== 'A') {
                return router.push($(e.target).closest('a').attr('href'));
            }
            return router.push(e.target.getAttribute('href'));
        });
    }
    componentWillUnmount() {
        $('#link_text_block a').off('click');
    }
    render() {
        const {projectsStore, scriptsStore, tablesStore, modalStore, usersStore} = this.props;
        let table = tablesStore.table(this.props.params.table);
        let active_link = tablesStore.link(this.props.params.table, this.props.params.link);
        let sorted_colls = this.sortedColls();
        let coll_name, coll_size;
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
                                            }
                                        };
                                        let editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(active_link.text)), DECORATORS);
                                        text = stateToHTML(editorState.getCurrentContent(), options);
                                    } catch(err) {
                                        text = '';
                                    }
                                    return (
                                        <div className="scroll_links" key={key} style={{width: table.text_coll_size + '%'}}>
                                            {active_link ?
                                                <div>
                                                    <h4 className="table_header_text">{active_link.name}</h4>
                                                    <div id="link_text_block" dangerouslySetInnerHTML={{__html: text}}></div>
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
                                                            <span className="table_header_text">
                                                                <div className="row">
                                                                    <div className="col-md-12">
                                                                        {category.name}
                                                                    </div>
                                                                </div>
                                                            </span>
                                                            {category.links.map((link, key) => {
                                                                return (
                                                                    <div key={key}>
                                                                        <div className="row">
                                                                            <div className="col-md-12 link_name">
                                                                                <Link to={(!link.to_link ?
                                                                                        '/tables/' + this.props.params.script +
                                                                                        '/table/' + this.props.params.table +
                                                                                        '/link/' + link.id +
                                                                                        '/share/'
                                                                                    :
                                                                                        link.to_link.href + '/share/'
                                                                                    )
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

class ToLink extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            table: null,
            category: null,
            link: null
        }
    }
    onChange(select, selector) {
        const {tablesStore} = this.props;
        const {table, category, link} = this.state;
        let selected_table, selected_category, selected_link;

        if(selector === 'table') {
            selected_table = null;
            if(select)
                selected_table = tablesStore.table(select.value);
            selected_category = null;
            selected_link = null;
        } else if(selector === 'category') {
            if(table) {
                selected_table = table;
                selected_link = null;
                selected_category = null;
                if(select) {
                    let categories = [];
                    table.colls.map(coll => {
                        coll.categories.map(category => {
                            categories.push(category);
                        });
                    });
                    selected_category = categories.find(category => {return category.id === select.value});
                }
            }
        } else if(selector === 'link') {
            if(category)
                selected_table = table;
                selected_category = category;
                selected_link = null;
                if(select)
                    selected_link = category.links.find(link => {return link.id === select.value});
        }
        this.setState(update(this.state, {
            table: {$set: selected_table},
            category: {$set: selected_category},
            link: {$set: selected_link}
        }));
    }
    tablesOptions() {
        const {tablesStore} = this.props;
        return tablesStore.tables.map(table => {
            return {value: table.id, label: table.name}
        });
    }
    categoriesOptions() {
        const {table} = this.state;
        let result = [];
        if(table) {
            table.colls.map(coll => {
                coll.categories.map(category => {
                    result.push({value: category.id, label: category.name});
                });
            })
        }
        return result;
    }
    linksOptions() {
        const {category} = this.state;
        let result = [];
        if(category) {
            category.links.map(link => {
                result.push({value: link.id, label: link.name});
            });
        }
        return result;
    }
    render() {
        const {modalStore} = this.props;
        const {table, category, link} = this.state;
        return(
            <div className="row row-centered">
                <div className="col-md-12 col-centered">
                    <Select
                        name="table"
                        placeholder="Выберите таблицу"
                        value={table ? table.id : null}
                        options={this.tablesOptions()}
                        onChange={(select) => {this.onChange(select, 'table')}}/>
                </div>
                <div className="col-md-12 col-centered">
                    <Select
                        name="category"
                        placeholder="Выберите категорию"
                        value={category ? category.id : null}
                        options={this.categoriesOptions()}
                        onChange={(select) => {this.onChange(select, 'category')}}
                        disabled={!table}/>
                </div>
                <div className="col-md-12 col-centered">
                    <Select
                        name="link"
                        placeholder="Выберите ссылку"
                        value={link ? link.id : null}
                        options={this.linksOptions()}
                        onChange={(select) => {this.onChange(select, 'link')}}
                        disabled={!table || !category}/>
                </div>
                <div className="col-md-12 col-centered">
                    <button
                        className={'btn btn-success ' + (!link ? 'disabled' : null)}
                        onClick={() => {
                            const {link} = this.state;
                            if(link) {
                                return this.props.createToLink(this.props.category, link, () => {
                                    modalStore.modal = false;
                                });
                            }
                        }}>
                        Добавить
                    </button>
                </div>
            </div>
        )
    }
}

class EditableText extends React.Component {
    constructor(props) {
        super(props);

        this.delay = 50;

        this.state = {
            text: this.props.text,
            edit: props.edit ? props.edit : false,
            key: null,

            click_timer: null,
            prevent: false
        }
    }
    componentWillReceiveProps(props) {
        this.setState({text: props.text, edit: props.edit ? props.edit : false})
    }
    clearTimer() {
        let timer = this.state.timer;
        this.setState(update(this.state, {timer: {$set: null}}), () => {
            clearTimeout(timer);
        });
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
    doClickAction() {
        this.clearTimer();
        if(this.props.onClick) {
            this.props.onClick(this.props.object)
        }
    }
    render() {
        const {settings} = this.props;
        return (
            <div>
                {!this.state.edit ?
                    <span onClick={this.doClickAction.bind(this)}>{this.props.text}</span>
                :
                    <form onSubmit={this.submitHandler.bind(this)}>
                        <input
                            onChange={(e) => {this.setState(update(this.state, {text: {$set: e.target.value}}))}}
                            autoFocus={true}
                            onBlur={this.submitHandler.bind(this)}
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
