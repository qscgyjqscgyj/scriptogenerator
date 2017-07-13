import * as React from 'react';
import $ from 'jquery';
import {observer} from 'mobx-react';
import {CustomEditor, styleMap} from '../editor/editor';
import {Link} from 'react-router';
import {EditorState, ContentState, convertFromRaw, Entity} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';


@observer
class Table extends React.Component {
    constructor(props) {
        super(props);

        this.script = this.props.script;
        this.scriptsStore = this.props.scriptsStore;
    }

    fixHeight() {
        const content_height = window.innerHeight - $('.navbar').height() - 7;
        let scroll_links = [].slice.call(document.getElementsByClassName('scroll_links'));
        scroll_links.map(el => {
            $(el).css('min-height', content_height + 'px');
            $(el).css('max-height', content_height + 'px');
        });
    }

    componentWillMount() {
    }

    componentDidMount() {
        this.fixHeight();
    }

    componentDidUpdate() {
        this.fixHeight();
    }

    sortedColls() {
        const {scriptsStore, script} = this;
        if (scriptsStore) {
            const table = scriptsStore.table(script, this.props.params.table);
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
}

@observer
class TableShare extends Table {
    constructor(props) {
        super(props);

        this.script = this.props.script;
        this.sciptsStore = this.props.scriptsStore;
    }

    componentDidMount() {
        this.fixHeight();
        $(document).on("click", "#link_text_block a", (e) => {
            e.preventDefault();
            const {router} = this.props;

            if (e.target.tagName !== 'A') {
                return router.push($(e.target).closest('a').attr('href'));
            }
            return router.push(e.target.getAttribute('href'));
        });
    }

    componentWillUnmount() {
        $('#link_text_block a').off('click');
    }

    render() {
        const {scriptsStore, script} = this;
        if (scriptsStore) {
            const table = scriptsStore.table(script, this.props.params.table);
            let active_link = scriptsStore.link(script, this.props.params.link);
            let sorted_colls = this.sortedColls();
            let coll_name, coll_size;
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

                                    {/*TODO: FIX THIS SHIT (MIDDLEWARE)*/
                                    }
                                    let active_link_json = JSON.parse(active_link.text);
                                    let active_link_entities_list = $.map(active_link_json.entityMap, function (value, index) {
                                        return [value];
                                    });
                                    active_link_entities_list.forEach((entity, i) => {
                                        if (entity.type === 'LINK' && entity.data.url.includes('/table/') && !entity.data.url.includes('/tables/')) {
                                            active_link_json.entityMap[String(i)].data.url = `/tables/${script.id}${entity.data.url}`;
                                        }
                                    });

                                    let editorState = EditorState.createWithContent(convertFromRaw(active_link_json));
                                    text = stateToHTML(editorState.getCurrentContent(), options);
                                } catch (err) {
                                    text = '';
                                }
                                return (
                                    <div className="scroll_links" key={key} style={{width: table.text_coll_size + '%'}}>
                                        {active_link ?
                                            <div>
                                                <h4 className="table_header_text">{active_link.name}</h4>
                                                <div id="link_text_block"
                                                     dangerouslySetInnerHTML={{__html: text}}></div>
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
                                            if (!category.hidden) {
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
                                                            let link_url = scriptsStore.linkURL(script, table, link);
                                                            if (link_url) {
                                                                return (
                                                                    <div key={key}>
                                                                        <div className="row">
                                                                            <div className="col-md-12 link_name">
                                                                                <Link to={link_url}>{link.name}</Link>
                                                                            </div>
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
}

@observer
export class TableWrapper extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return React.createElement(TableShare, {...this.props});
    }
}
