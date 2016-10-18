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
import RichTextEditor from 'react-rte';

@observer
export class Table extends React.Component {
    componentWillMount() {
        const {tablesStore} = this.props;
        tablesStore.pullTables(this.props.params.script);
    }

    componentDidMount() {
        new Clipboard('.copy_icon', {
            text: function(trigger) {
                return trigger.getAttribute('data-link');
            }
        });
    }

    createLinkCategory(coll) {
        const {tablesStore} = this.props;
        var r = confirm("Вы хотите создать скрытый раздел?");
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-link-categories-url'),
            data: JSON.stringify({name: 'Пустой раздел', table: coll.id, hidden: r}),
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
            table.colls.map(coll => {
                sorted_colls.push({coll: coll, position: coll.position, text: false});
            });
            sorted_colls.push({position: table.text_coll_position, text: true});
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
                    <Link to={
                            '/tables/' + this.props.params.script +
                            '/table/' + this.props.params.table +
                            (this.props.params.link ? ('/link/' + this.props.params.link) : '') +
                            '/share/'
                        }>
                        <button className="btn btn-success">Просмотр</button>
                    </Link>
                    <table className="table table-bordered">
                        <tbody>
                            <tr className="scroll_block">
                                {sorted_colls.map((coll, key) => {
                                    if (coll.text) {
                                        return (
                                            <td key={key} style={{width: table.text_coll_size + '%'}}>
                                                {active_link ?
                                                    <div>
                                                        <h3>{active_link.name}</h3>
                                                        <button className="btn btn-success" onClick={() => {this.updateLink(active_link)}}>Сохранить</button>
                                                        <div className="link_text_editor">
                                                            <CustomEditor objects={active_link} value={active_link.text} onChange={(value) => {active_link.text = value}} />
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
                                            <td key={key} style={{width: coll.size + '%'}}>
                                                <button onClick={() => {this.createLinkCategory(coll)}} className="btn btn-success">+ категория</button>
                                                {coll.categories.map((category, key) => {
                                                    return (
                                                        <div key={key} className={category.hidden ? 'hidden_links' : ''}>
                                                            <h3>
                                                                <div className="row">
                                                                    <div className="col-md-10">
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
                                                                    </div>
                                                                    <div className="col-md-2">
                                                                        <span className="glyphicon glyphicon-remove icon remove_icon" aria-hidden="true" onClick={()=>{this.deleteLinkCategory(category)}}/>
                                                                    </div>
                                                                </div>
                                                            </h3>
                                                            <button className="btn btn-success" onClick={()=>{this.createLink(category)}}>+ ссылка</button>
                                                            <ul className="list-group">
                                                                {category.links.map((link, key) => {
                                                                    return (
                                                                        <li key={key} className="list-group-item">
                                                                            <div className="row">
                                                                                <div className="col-md-8">
                                                                                    <EditableText
                                                                                        text={link.name}
                                                                                        field={'name'}
                                                                                        submitHandler={(link) => this.updateLink(link)}
                                                                                        object={link}
                                                                                        settings={{
                                                                                            placeholder: 'Имя ссылки',
                                                                                            name: 'name'
                                                                                        }}/>
                                                                                </div>
                                                                                <div className="col-md-1">
                                                                                    <span className="glyphicon glyphicon-copy icon copy_icon" aria-hidden="true" data-link={this.copyLink(link)}/>
                                                                                </div>
                                                                                <div className="col-md-1">
                                                                                    <Link to={
                                                                                            '/tables/' + this.props.params.script +
                                                                                            '/table/' + this.props.params.table +
                                                                                            '/link/' + link.id +
                                                                                            '/edit/'
                                                                                        }>
                                                                                        <span className="glyphicon glyphicon-edit icon edit_icon" aria-hidden="true"/>
                                                                                    </Link>
                                                                                </div>
                                                                                <div className="col-md-1">
                                                                                    <span className="glyphicon glyphicon-remove icon remove_icon" aria-hidden="true" onClick={()=>{this.deleteLink(link)}}/>
                                                                                </div>
                                                                            </div>
                                                                        </li>
                                                                    )
                                                                })}
                                                            </ul>
                                                            <hr/>
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
                    <table className="table table-bordered">
                        <tbody>
                            <tr className="scroll_block">
                                {sorted_colls.map((coll, key) => {
                                    if (coll.text) {
                                        return (
                                            <td key={key} style={{width: table.text_coll_size + '%'}}>
                                                {active_link ?
                                                    <div>
                                                        <h3>{active_link.name}</h3>
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
                                            <td key={key} style={{width: coll.size + '%'}}>
                                                {coll.categories.map((category, key) => {
                                                    if(!category.hidden) {
                                                        return (
                                                            <div key={key} className={category.hidden ? 'hidden_links' : ''}>
                                                                <h3>
                                                                    <div className="row">
                                                                        <div className="col-md-12">
                                                                            {category.name}
                                                                        </div>
                                                                    </div>
                                                                </h3>
                                                                <ul className="list-group">
                                                                    {category.links.map((link, key) => {
                                                                        return (
                                                                            <li key={key} className="list-group-item">
                                                                                <div className="row">
                                                                                    <div className="col-md-12">
                                                                                        <Link to={
                                                                                            '/tables/' + this.props.params.script +
                                                                                            '/table/' + this.props.params.table +
                                                                                            '/link/' + link.id +
                                                                                            '/share/'
                                                                                        }>{link.name}</Link>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        )
                                                                    })}
                                                                </ul>
                                                                <hr/>
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
        this.state = {text: this.props.text, edit: false}
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
                    <span onDoubleClick={() => {this.setEdit(true)}}>{this.props.text}</span>
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
