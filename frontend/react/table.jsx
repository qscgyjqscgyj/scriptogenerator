import * as React from 'react';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import {ModalWrapper} from './modal';
import {CustomEditor, styleMap} from './editor/editor';
import {Link} from 'react-router';
import Clipboard from 'clipboard';
import {EditorState, ContentState, convertFromRaw, Entity} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';
import {moveInArray} from './sort';
import {AccessableComponent} from './access';
import Select from 'react-select';
import {extendObservable} from 'mobx';
import {Tooltip} from './tooltip';
import {scriptsIsLoaded} from './scriptsIsLoaded';

const ALT_CODE = 18;
const CTRL_CODE = 17;

@observer
class Table extends AccessableComponent {
    constructor(props) {
        super(props);

        this.state = {
            key: null,
            clipboard: null
        }
    }
    fixHeight() {
        const content_height = window.innerHeight - $('.navbar').height() - 7;
        let scroll_links = [].slice.call(document.getElementsByClassName('scroll_links'));
        scroll_links.map(el => {
            $(el).css('min-height', content_height + 'px');
            $(el).css('max-height', content_height + 'px');
        });
    }
    fixClipboard(clear=false) {
        const {clipboard} = this.state;
        const {usersStore} = this.props;
        if(clipboard) {
            clipboard.destroy();
        }
        if(!clear) {
            let new_clipboard = new Clipboard('.copy_icon', {
                text: function(trigger) {
                    if(usersStore.pressed_key === CTRL_CODE) {
                        return trigger.getAttribute('data-link');
                    } else if($(trigger).hasClass('enable_copy_icon')) {
                        return trigger.getAttribute('data-link');
                    }
                }
            });
            this.setState(update(this.state, {clipboard: {
                $set: new_clipboard
            }}));
        }
    }
    componentWillMount() {
        const {scriptsStore} = this.props;
        const script = scriptsStore.script(this.props.params.script);
        if(script && !script.data.length > 0) {
            scriptsStore.getScriptData(script);
        }
    }
    setKeyHandlers() {
        $(document.body).on('keydown', this.handleKeyDown.bind(this));
        $(document.body).on('keyup', this.handleKeyUp.bind(this));
    }
    killKeyHandlers() {
        $(document.body).off('keydown', this.handleKeyDown.bind(this));
        $(document.body).off('keyup', this.handleKeyUp.bind(this));
    }
    componentDidMount() {
        this.fixHeight();
        this.fixClipboard();
        this.setKeyHandlers();
    }
    componentWillUnmount() {
        this.fixClipboard(true);
        this.killKeyHandlers();
    }
    componentWillUpdate() {
        this.killKeyHandlers();
        this.setKeyHandlers();
    }
    handleKeyDown(e) {
        const {usersStore} = this.props;
        if(e.keyCode === CTRL_CODE || e.keyCode === ALT_CODE) {
            usersStore.pressed_key = e.keyCode;
        }
    }
    handleKeyUp(e) {
        const {usersStore} = this.props;
        usersStore.pressed_key = null;
    }
    componentDidUpdate() {
        this.fixHeight();
    }
    sortedColls() {
        const {scriptsStore} = this.props;
        const script = scriptsStore.script(this.props.params.script);
        const table = scriptsStore.table(script, this.props.params.table);
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
        const {scriptsStore} = this.props;
        const script = scriptsStore.script(this.props.params.script);
        const table = scriptsStore.table(script, this.props.params.table);
        return scriptsStore.linkURL(script, table, link, 'share', true);
    }
    onCategorySort(coll) {
        const {scriptsStore} = this.props;
        const script = scriptsStore.script(this.props.params.script);
        const table = scriptsStore.table(script, this.props.params.table);
        coll.categories.forEach((category, key) => {
            category.order = key;
        });
        return scriptsStore.updateColl(script, table, coll, false);
    }
    onLinkSort(coll, category) {
        const {scriptsStore} = this.props;
        const script = scriptsStore.script(this.props.params.script);
        const table = scriptsStore.table(script, this.props.params.table);
        category.links.forEach((link, key) => {
            link.order = key;
        });
        return scriptsStore.updateColl(script, table, coll, false);
    }
    createToLink(script, table, coll, category, link, cb) {
        const {scriptsStore} = this.props;
        scriptsStore.createLink(script, table, coll, category, link.id);
        return cb();
    }
}

const tooltip = <Tooltip/>;

@observer
class TableEdit extends Table {
    openCategory(coll, category) {
        category.opened = !category.opened;
        coll.categories.forEach((cat) => {
            if(cat.id !== category.id) {
               cat.opened = false;
            }
            cat.links.forEach((link) => {
               link.opened = false;
            });
        });
    }
    toggleCategoryNameEditing(category) {
        category.edit = !category.edit;
    }
    openLink(coll, link) {
        link.opened = !link.opened;
        coll.categories.forEach((cat) => {
            cat.opened = false;
            cat.links.forEach((ln) => {
                if(ln.id !== link.id) {
                    ln.opened = false;
                }
            });
        });
    }
    toggleLinkNameEditing(link) {
        link.edit = !link.edit;
    }
    linkDataEditorChangeHandler(value) {
        const {scriptsStore} = this.props;
        const script = scriptsStore.script(this.props.params.script);
        let active_link = scriptsStore.link(script, this.props.params.link, true);
        active_link.link.text = value;
    }
    linkDataEditorBlurHandler(value) {
        const {scriptsStore} = this.props;
        const script = scriptsStore.script(this.props.params.script);
        let active_link = scriptsStore.link(script, this.props.params.link, true);
        active_link.link.text = value;
        scriptsStore.updateLink(script, active_link.table, active_link.coll, active_link.category, active_link.link, false);
    }

    render() {
        const {scriptsStore, modalStore, usersStore} = this.props;
        const script = scriptsStore.script(this.props.params.script);
        let table = scriptsStore.table(script, this.props.params.table);
        let active_link = scriptsStore.link(script, this.props.params.link, true);
        let sorted_colls = this.sortedColls();
        let coll_name, coll_size;

        if(usersStore.session_user) {
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
                                                    <div className="col-md-12">
                                                        <h4 className="table_header_text">{active_link.link.name}</h4>
                                                    </div>
                                                    <div className="link_text_editor">
                                                        <CustomEditor object={active_link.link} value={active_link.link.text}
                                                            onChange={this.linkDataEditorChangeHandler.bind(this)}
                                                            onBlur={this.linkDataEditorBlurHandler.bind(this)}
                                                            />
                                                    </div>
                                                </div>
                                            : null}
                                        </div>
                                    )
                                } else if (!coll.text) {
                                    coll = coll.coll;
                                    return (
                                        <div className="scroll_links colls_block unpadding_horizontal" key={key} style={{width: coll.size + '%'}}>
                                            <div className="col-md-1">
                                                <i data-tip="Добавить раздел" className="icon add_icon glyphicon glyphicon-plus" onClick={() => {scriptsStore.createLinkCategory(script, table, coll)}}/>
                                            </div>

                                            <div className="col-md-1">
                                                <i data-tip="Добавить скрытый раздел" className="icon red_icon glyphicon glyphicon-plus" onClick={() => {scriptsStore.createLinkCategory(script, table, coll, true)}}/>
                                            </div>
                                            {coll.categories.map((category, key) => {
                                                return (
                                                    <div key={key} className={category.hidden ? 'hidden_links' : ''}>
                                                        <div className={"col-md-12 inline_elements edit_icon_handler hovered_list_item " + (category.opened ? 'opened' : null)}>
                                                            <i className="glyphicon glyphicon-edit edit_icon inline_element"
                                                                onClick={() => {this.openCategory(coll, category)}}/>
                                                            <span className="inline_element">
                                                                <EditableText
                                                                    textClickHandler={(e) => {
                                                                        if(usersStore.pressed_key === ALT_CODE) {
                                                                            category.edit = true;
                                                                        }
                                                                    }}
                                                                    className="table_header_text"
                                                                    submitHandler={(category) => {
                                                                        category.edit = false;
                                                                        scriptsStore.updateLinkCategory(script, table, coll, category, false);
                                                                    }}
                                                                    object={category}
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
                                                                            <button data-tip="Создать ссылку" className="btn btn-default" onClick={()=>{scriptsStore.createLink(script, table, coll, category)}}>
                                                                                <i className="icon add_simple_link_icon glyphicon glyphicon-plus"/>
                                                                            </button>
                                                                            <button data-tip="Создать ссылку на другой сценарий" className="btn btn-default"
                                                                                onClick={() => {
                                                                                    modalStore.open_modal(
                                                                                        React.createElement(ToLink, {
                                                                                            ...this.props,
                                                                                            createToLink: this.createToLink.bind(this),
                                                                                            modalStore: modalStore,
                                                                                            script: script,
                                                                                            table: table,
                                                                                            coll: coll,
                                                                                            category: category
                                                                                        })
                                                                                    );
                                                                                }}>
                                                                                <i className="icon add_to_link_icon glyphicon glyphicon-plus"/>
                                                                            </button>
                                                                        </div>

                                                                        <div className="btn-group btn-group-xs" role="group">
                                                                            <button data-tip="Переименовать раздел (Shift + клик по названию раздела)"
                                                                                onClick={this.toggleCategoryNameEditing.bind(this, category)}
                                                                                className="btn btn-default">

                                                                                <i className="glyphicon glyphicon-edit"/>
                                                                            </button>
                                                                        </div>

                                                                        <div className="btn-group btn-group-xs" role="group">
                                                                            <button data-tip="Удалить раздел" style={{color: '#fff'}} onClick={()=>{scriptsStore.deleteLinkCategory(script, table, coll, category, key)}} className="btn btn-danger">
                                                                                <i className="glyphicon glyphicon-remove"/>
                                                                            </button>
                                                                        </div>

                                                                        <div className="btn-group btn-group-xs" role="group">
                                                                            {key !== 0 ?
                                                                                <button
                                                                                    onClick={() => {
                                                                                        coll.categories = moveInArray(coll.categories, key, key - 1);
                                                                                        this.onCategorySort(coll);
                                                                                    }}
                                                                                    data-tip="Переместить вверх"
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
                                                                                    data-tip="Переместить вниз"
                                                                                    className="btn btn-default">
                                                                                    <i className="glyphicon glyphicon-triangle-bottom"/>
                                                                                </button>
                                                                            : null}
                                                                        </div>
                                                                        {tooltip}
                                                                    </div>
                                                                </div>
                                                            : null}
                                                        </div>
                                                        {category.links.map((link, key) => {
                                                            return (
                                                                <div key={key}>
                                                                    <div className={"col-md-12 hovered_list_item inline_elements edit_icon_handler " + (link.opened ? 'opened' : null)}>
                                                                        <i className="glyphicon glyphicon-edit edit_icon inline_element" onClick={() => {this.openLink(coll, link)}}/>
                                                                        <span data-link={this.copyLink(link)}
                                                                              className={`inline_element link ${link.to_link ? 'to_link' : ''} ${category.hidden ? ' hidden_links' : ' link_name'} ${!link.edit ? 'copy_icon' : ''}`}>
                                                                            <EditableText
                                                                                textClickHandler={(e) => {
                                                                                    if(usersStore.pressed_key === ALT_CODE) {
                                                                                        link.edit = true;
                                                                                    } else if(!usersStore.pressed_key) {
                                                                                        this.props.router.push(scriptsStore.linkURL(script, table, link, 'edit'));
                                                                                    }
                                                                                }}
                                                                                submitHandler={(link) => {
                                                                                    link.edit = false;
                                                                                    scriptsStore.updateLink(script, table, coll, category, link, false)
                                                                                }}
                                                                                object={link}
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
                                                                                            data-link={this.copyLink(link)}
                                                                                            onClick={()=>{}} className="btn btn-default copy_icon enable_copy_icon">
                                                                                            <i className="glyphicon glyphicon-copy copy_icon enable_copy_icon" data-link={this.copyLink(link)}/>
                                                                                        </button>
                                                                                    </div>

                                                                                    <div className="btn-group btn-group-xs" role="group">
                                                                                        <button
                                                                                            data-tip="Переименовать ссылку (Shift + клик по названию ссылки)"
                                                                                            onClick={this.toggleLinkNameEditing.bind(this, link)}
                                                                                            className="btn btn-default">
                                                                                            <i className="glyphicon glyphicon-edit"/>
                                                                                        </button>
                                                                                    </div>

                                                                                    <div className="btn-group btn-group-xs" role="group">
                                                                                        <button
                                                                                            data-tip="Удалить ссылку"
                                                                                            style={{color: '#fff'}}
                                                                                            onClick={()=>{scriptsStore.deleteLink(script, table, coll, category, link, key)}}
                                                                                            className="btn btn-danger btn-xs">
                                                                                            <i className="glyphicon glyphicon-remove"/>
                                                                                        </button>
                                                                                    </div>

                                                                                    <div className="btn-group btn-group-xs" role="group">
                                                                                        {key !== 0 ?
                                                                                            <button
                                                                                                data-tip="Переместить вверх"
                                                                                                onClick={() => {
                                                                                                    category.links = moveInArray(category.links, key, key - 1);
                                                                                                    this.onLinkSort(coll, category);
                                                                                                }}
                                                                                                className="btn btn-default">
                                                                                                <i className="glyphicon glyphicon-triangle-top"/>
                                                                                            </button>
                                                                                        : null}
                                                                                        {(key + 1) !== category.links.length ?
                                                                                            <button
                                                                                                data-tip="Переместить вниз"
                                                                                                onClick={() => {
                                                                                                    category.links = moveInArray(category.links, key, key + 1);
                                                                                                    this.onLinkSort(coll, category);
                                                                                                }}
                                                                                                className="btn btn-default">
                                                                                                <i className="glyphicon glyphicon-triangle-bottom"/>
                                                                                            </button>
                                                                                        : null}
                                                                                    </div>
                                                                                    {tooltip}
                                                                                </div>
                                                                            </div>
                                                                        : null}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                                )
                                            })}
                                        </div>
                                    )
                                }
                            })}
                        </div>
                        <ModalWrapper stores={[scriptsStore]} modalStore={modalStore}/>
                        {tooltip}
                    </div>
                );
            }
            return null;
        }
        return null;
    }
}

@observer
class TableShare extends Table {
    componentDidMount() {
        this.fixHeight();
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
        const {scriptsStore, usersStore} = this.props;
        const script = scriptsStore.script(this.props.params.script);
        const table = scriptsStore.table(script, this.props.params.table);
        let active_link = scriptsStore.link(script, this.props.params.link);
        let sorted_colls = this.sortedColls();
        let coll_name, coll_size;
        if(usersStore.session_user) {
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

                                        {/*TODO: FIX THIS SHIT (MIDDLEWARE)*/}
                                        let active_link_json = JSON.parse(active_link.text);
                                        let active_link_entities_list = $.map(active_link_json.entityMap, function(value, index) {
                                            return [value];
                                        });
                                        active_link_entities_list.forEach((entity, i) => {
                                            if(entity.type === 'LINK' && entity.data.url.includes('/table/') && !entity.data.url.includes('/tables/')) {
                                                active_link_json.entityMap[String(i)].data.url = `/tables/${script.id}${entity.data.url}`;
                                            }
                                        });

                                        let editorState = EditorState.createWithContent(convertFromRaw(active_link_json));
                                        text = stateToHTML(editorState.getCurrentContent(), options);
                                    } catch(err) {
                                        text = '';
                                    }
                                    return (
                                        <div className="scroll_links" key={key} style={{width: table.text_coll_size + '%'}}>
                                            {active_link ?
                                                <div>
                                                    <h4 className="table_header_text">{active_link.name}</h4>
                                                    <div id="link_text_block" dangerouslySetInnerHTML={{__html: text}}/>
                                                </div>
                                                :
                                                ''
                                            }
                                        </div>
                                    )
                                } else if (!coll.text) {
                                    coll = coll.coll;
                                    return (
                                        <div className="scroll_links colls_block unpadding_horizontal" key={key} style={{width: coll.size + '%'}}>
                                            {coll.categories.map((category, key) => {
                                                if(!category.hidden) {
                                                    return (
                                                        <div key={key} className={category.hidden ? 'hidden_links' : ''}>
                                                            <span className="table_header_text">
                                                                <div className="col-md-12">
                                                                    {category.name}
                                                                </div>
                                                            </span>
                                                            {category.links.map((link, key) => {
                                                                let link_url = scriptsStore.linkURL(script, table, link);
                                                                if(link_url) {
                                                                    return (
                                                                        <div key={key}>
                                                                            <div className={`col-md-12 link_name ${usersStore.session_user.button_links_setting ? '' : ''}`}>
                                                                                <Link to={link_url}>
                                                                                    {usersStore.session_user.button_links_setting ?
                                                                                        <button className={`btn btn-default btn-sm link_button ${active_link && active_link.id === link.id ? 'active' : ''}`}>
                                                                                            {link.name}
                                                                                        </button>
                                                                                        :
                                                                                        link.name
                                                                                    }
                                                                                </Link>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                }
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
        const {scriptsStore, script} = this.props;
        const {table, category, link} = this.state;
        let selected_table, selected_category, selected_link;

        if(selector === 'table') {
            selected_table = null;
            if(select)
                selected_table = scriptsStore.table(script, select.value);
            selected_category = null;
            selected_link = null;
        } else if(selector === 'category') {
            if(table) {
                selected_table = table;
                selected_link = null;
                selected_category = null;
                if(select) {
                    let categories = [];
                    table.colls.forEach(coll => {
                        coll.categories.forEach(category => {
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
        const {scriptsStore} = this.props;
        const script = scriptsStore.script(this.props.params.script);
        return script.data.map(table => {
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
        const {scriptsStore, modalStore} = this.props;
        const {table, category, link} = this.state;
        return(
            <div className="row row-centered">
                <div className="col-md-12 col-centered">
                    <Select
                        name="table"
                        placeholder="Выберите сценарий"
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
                                return this.props.createToLink(
                                    this.props.script,
                                    this.props.table,
                                    this.props.coll,
                                    this.props.category,
                                    link, () => {
                                        modalStore.close_modal();
                                    }
                                );
                            }
                        }}>
                        Добавить
                    </button>
                </div>
            </div>
        )
    }
}

@observer
class EditableText extends React.Component {
    submitHandler(e) {
        e.preventDefault();
        const {object} = this.props;
        this.props.submitHandler(object);
    }
    onBlurHandler() {
        const {object} = this.props;
        this.props.submitHandler(object);
    }
    textChangeHandler(e) {
        const {object} = this.props;
        object.name = e.target.value;
    }
    render() {
        const {settings, object, className} = this.props;
        return (
            <div className={className}>
                {!object.edit ?
                    <span
                        onClick={this.props.textClickHandler.bind(this)}>{object.name}</span>
                :
                    <form onSubmit={this.submitHandler.bind(this)}>
                        <input
                            onChange={this.textChangeHandler.bind(this)}
                            autoFocus={true}
                            onBlur={this.onBlurHandler.bind(this)}
                            placeholder={settings.placeholder}
                            name={settings.name}
                            value={object.name}
                            type="text"/>
                    </form>
                }
            </div>
        )
    }
}

@observer
export class TableShareWrapper extends React.Component {
    render() {
        return React.createElement(scriptsIsLoaded, {...this.props, renderComponent: TableShare});
    }
}

@observer
export class TableEditWrapper extends React.Component {
    render() {
        return React.createElement(scriptsIsLoaded, {...this.props, renderComponent: TableEdit});
    }
}
