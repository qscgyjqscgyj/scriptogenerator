import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import {ModalWrapper} from './modal';
import {Coll} from '../mobx/tablesStore';
import {Link} from 'react-router';

@observer
export class Table extends React.Component {
    componentWillMount() {
        const {tablesStore} = this.props;
        tablesStore.pullTables(this.props.params.script);
    }

    createLinkCategory(coll) {
        const {tablesStore} = this.props;
        $.ajax({
            method: 'POST',
            url: document.body.getAttribute('data-link-categories-url'),
            data: JSON.stringify({name: 'Пустой раздел', table: coll.id}),
            success: (res) => {
                tablesStore.tables = res.tables;
            },
            error: (res) => {
                console.log(res);
            }
        });
    }

    deleteLinkCategory(coll) {
        $.ajax({
            method: 'delete',
            url: document.body.getAttribute('data-link-categories-url'),
            data: {id: coll.id},
            success: (res) => {
                this.tables = res.tables;
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
                            <tr className="scroll_header">
                                {sorted_colls.map((coll, key) => {
                                    if (coll.text) {
                                        coll_name = table.text_coll_name;
                                        coll_size = table.text_coll_size;
                                    }
                                    else if (!coll.text) {
                                        coll_name = coll.coll.name;
                                        coll_size = coll.coll.size;
                                    }
                                    return (
                                        <td key={key} style={{width: coll_size + '%'}}>
                                            {coll_name}
                                        </td>
                                    )
                                })}
                            </tr>
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
                                                <button onClick={() => {this.createLinkCategory(coll)}} className="btn btn-success">+ категория</button>
                                                {coll.categories.map((category, key) => {
                                                    return (
                                                        <div key={key} className={category.hidden ? 'hidden_links' : ''}>
                                                            <h3>{!category.hidden ? category.name : 'Скрытый раздел'} <i className="fa fa-times" aria-hidden="true" onClick={()=>{this.deleteLinkCategory(coll)}}/></h3>
                                                            <button className="btn btn-success">+ ссылка</button>
                                                            <ul className="list-group">
                                                                {category.links.map((link, key) => {
                                                                    return (
                                                                        <li key={key} className="list-group-item">{link.name}</li>
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
export class SharedTable extends React.Component {
    render() {
        return (
            <li key={key} className="list-group-item">
                <Link to={
                        '/tables/' + this.props.params.script +
                        '/table/' + this.props.params.table +
                        '/link/' + link.id
                    }
                      params={{active_link: link}}>{link.name}</Link>
            </li>
        )
    }
}
