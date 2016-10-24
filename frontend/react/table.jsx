import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import {ModalWrapper} from './modal';
import {Coll} from '../mobx/tablesStore';
import {CustomEditor} from './editor';
import {Link} from 'react-router';
import Clipboard from 'clipboard';

@observer
export class Table extends React.Component {
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
        var r = confirm("Вы действительно хотите удалить категорию: " + category.name);
        if (r == true) {
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
        }
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
        var r = confirm("Вы действительно хотите удалить ссылку: " + link.name);
        if (r) {
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
        }
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
            //return sorted_colls.sort(
            //    function (a, b) {
            //        if (a.position > b.position) {
            //            return 1;
            //        }
            //        if (a.position < b.position) {
            //            return -1;
            //        }
            //        return 0;
            //    }
            //);
            return sorted_colls;
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
}

@observer
export class TableEdit extends Table {
    render() {
        const {projectsStore, scriptsStore, tablesStore, modalStore} = this.props;
        let table = tablesStore.table(this.props.params.table);
        let active_link = tablesStore.link(this.props.params.table, this.props.params.link);
        let sorted_colls = this.sortedColls();
        var coll_name, coll_size;

        if (table) {
            return (
                <div className="col-md-12 scrollable_panel">
                    <table className="table table-bordered unmargin">
                        <tbody>
                            <tr className="scroll_block">
                                {sorted_colls.map((coll, key) => {
                                    if (coll.text) {
                                        return (
                                            <td className="scroll_links" key={key} style={{width: table.text_coll_size + '%'}}>
                                                {active_link ?
                                                    <div>
                                                        <div className="row">
                                                            <div className="col-md-11">
                                                                <h4 className="table_header_text">{active_link.name}</h4>
                                                            </div>
                                                            <div className="col-md-1">
                                                                <i className="icon add_icon glyphicon glyphicon-floppy-save icon_vertical_centre" onClick={() => {this.updateLink(active_link)}}/>
                                                            </div>
                                                        </div>
                                                        <div className="link_text_editor">
                                                            <CustomEditor object={active_link} value={active_link.text} onChange={(value) => {active_link.text = value}} />
                                                        </div>
                                                    </div>
                                                    :
                                                    ''
                                                }
                                            </td>
                                        )
                                    } else if (!coll.text) {
                                        coll = coll.coll;
                                        return (
                                            <td className="scroll_links" key={key} style={{width: coll.size + '%'}}>
                                                <div className="row">
                                                    <div className="col-md-1">
                                                        <i className="icon add_icon glyphicon glyphicon-plus" onClick={() => {this.createLinkCategory(coll, false)}}/>
                                                    </div>
                                                    <div className="col-md-1">
                                                        <i className="icon red_icon glyphicon glyphicon-plus" onClick={() => {this.createLinkCategory(coll, true)}}/>
                                                    </div>
                                                </div>
                                                {coll.categories.map((category, key) => {
                                                    return (
                                                        <div key={key} className={category.hidden ? 'hidden_links' : ''}>
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
                                                            {category.links.map((link, key) => {
                                                                return (
                                                                    <div key={key}>
                                                                        <div className="row">
                                                                            <div className="col-md-10 link_name">
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
                                                                            <div className="col-md-1">
                                                                                <span className="glyphicon glyphicon-remove icon red_icon" aria-hidden="true" onClick={()=>{this.deleteLink(link)}}/>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )
                                                })}
                                            </td>
                                        )
                                    }
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        }
        return <div></div>;
    }
}

@observer
export class TableShare extends Table {
    render() {
        const {projectsStore, scriptsStore, tablesStore, modalStore} = this.props;
        let table = tablesStore.table(this.props.params.table);
        let active_link = tablesStore.link(this.props.params.table, this.props.params.link);
        let sorted_colls = this.sortedColls();
        var coll_name, coll_size;

        if (table) {
            return (
                <div className="col-md-12 scrollable_panel">
                    <table className="table table-bordered unmargin">
                        <tbody>
                            <tr className="scroll_block">
                                {sorted_colls.map((coll, key) => {
                                    if (coll.text) {
                                        return (
                                            <td className="scroll_links" key={key} style={{width: table.text_coll_size + '%'}}>
                                                {active_link ?
                                                    <div>
                                                        <h4 className="table_header_text">{active_link.name}</h4>
                                                        <div dangerouslySetInnerHTML={{__html: active_link.text}}></div>
                                                    </div>
                                                    :
                                                    ''
                                                }
                                            </td>
                                        )
                                    } else if (!coll.text) {
                                        coll = coll.coll;
                                        return (
                                            <td className="scroll_links" key={key} style={{width: coll.size + '%'}}>
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
                                            </td>
                                        )
                                    }
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        }
        return <div></div>;
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

//class CustomEditor extends React.Component {
//    constructor(props) {
//        super(props);
//
//        this.state = {
//            link: props.link,
//            value: props.value ? RichTextEditor.createValueFromString(props.value, 'html') : RichTextEditor.createEmptyValue()
//        }
//    }
//
//    componentWillReceiveProps(props) {
//        if(this.state.link.id !== props.link.id) {
//            this.setState(update(this.state, {
//                value: {$set: props.value ? RichTextEditor.createValueFromString(props.value, 'html') : RichTextEditor.createEmptyValue()},
//                link: {$set: props.link}
//            }));
//        }
//    }
//
//    onChange(value) {
//        this.setState(update(this.state, {value: {$set: value}}));
//        this.props.onChange(value.toString('html'));
//    };
//
//    render () {
//        return (
//            <RichTextEditor
//                value={this.state.value}
//                onChange={this.onChange.bind(this)}/>
//        );
//    }
//}
//
