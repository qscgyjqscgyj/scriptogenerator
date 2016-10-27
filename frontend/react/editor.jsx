import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import {ModalWrapper} from './modal';
import {Coll} from '../mobx/tablesStore';
import {Editor, EditorState, CompositeDecorator, Modifier, RichUtils, ContentState, convertToRaw, convertFromRaw, Entity, convertFromHTML} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';
import {stateFromHTML} from 'draft-js-import-html';
import DraftPasteProcessor from 'draft-js/lib/DraftPasteProcessor';

@observer
export class CustomEditor extends React.Component {
    constructor(props) {
        super(props);

        this.decorator = new CompositeDecorator([
            {
                strategy: findLinkEntities,
                component: Link
            }
        ]);

        this.state = {
            object: props.object,
            editorState: this.getEditorState(props),
            showURLInput: false,
            urlValue: ''
        };

        this.focus = () => this.refs.editor.focus();
        this.onChange = (editorState) => {
            this.setState(update(this.state, {editorState: {$set: editorState}}), () => {
                this.props.onChange(JSON.stringify(convertToRaw(editorState.getCurrentContent())));
            });
        };

        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.onTab = (e) => this._onTab(e);
        this.toggleBlockType = (type) => this._toggleBlockType(tycope);
        this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
        this.promptForLink = this._promptForLink.bind(this);
        this.onURLChange = (e) => this.setState({urlValue: e.target.value});
        this.confirmLink = this._confirmLink.bind(this);
        this.onLinkInputKeyDown = this._onLinkInputKeyDown.bind(this);
        this.removeLink = this._removeLink.bind(this);
        this.toggleColor = (toggledColor) => this._toggleColor(toggledColor);
    }

    getEditorState(props) {
        let editorState;
        if(props.value) {
            try {
                editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(props.value)), this.decorator);
                editorState = EditorState.moveFocusToEnd(editorState);
            } catch (err) {
                console.log(err);
                editorState = EditorState.createEmpty(this.decorator);
            }
        } else {
            editorState = EditorState.createEmpty(this.decorator);
        }
        return editorState;
    }

    componentWillReceiveProps(props) {
        if(this.state.object.id !== props.object.id) {
            this.setState(update(this.state, {object: {$set: props.object}}), () => {
                this.onChange(this.getEditorState(props));
            });
        }
    }

    _handleKeyCommand(command) {
        const {editorState} = this.state;
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return true;
        }
        return false;
    }

    _onTab(e) {
        const maxDepth = 4;
        this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
    }

    _toggleBlockType(blockType) {
        this.onChange(RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }

    _toggleInlineStyle(inlineStyle) {
        this.onChange(RichUtils.toggleInlineStyle(
                this.state.editorState,
                inlineStyle
            )
        );
    }

    _promptForLink(e) {
        e.preventDefault();
        const {editorState} = this.state;
        const selection = editorState.getSelection();
        if (!selection.isCollapsed()) {
            this.setState(update(this.state, {showURLInput: {$set: true}, urlValue: {$set: ''}}), () => {
                setTimeout(() => this.refs.url.focus(), 0);
            });
        }
    }

    _confirmLink(e) {
        e.preventDefault();
        const {editorState, urlValue} = this.state;
        const contentState = editorState.getCurrentContent();
        const entityKey = Entity.create('LINK', 'MUTABLE', {url: urlValue});
        const contentStateWithEntity = Modifier.applyEntity(
            contentState,
            editorState.getSelection(),
            entityKey
        );
        const newEditorState = EditorState.push(editorState, contentStateWithEntity, entityKey);
        this.setState(update(this.state, {
            editorState: {$set: RichUtils.toggleLink(
                newEditorState,
                newEditorState.getSelection(),
                entityKey
            )},
            showURLInput: {$set: false},
            urlValue: {$set: ''}
        }), () => {
            setTimeout(() => this.refs.editor.focus(), 0);
        });
    }

    _onLinkInputKeyDown(e) {
        if (e.which === 13) {
            this._confirmLink(e);
        }
    }

    _removeLink(e) {
        e.preventDefault();
        const {editorState} = this.state;
        const selection = editorState.getSelection();
        if (!selection.isCollapsed()) {
            this.setState(update(this.state, {
                editorState: {$set: RichUtils.toggleLink(editorState, selection, null)}
            }));
        }
    }

    _toggleColor(toggledColor) {
        const {editorState} = this.state;
        const selection = editorState.getSelection();

        // Let's just allow one color at a time. Turn off all active colors.
        const nextContentState = Object.keys(styleMap).reduce((contentState, color) => {
                return Modifier.removeInlineStyle(contentState, selection, color)
            }, editorState.getCurrentContent());

        let nextEditorState = EditorState.push(
            editorState,
            nextContentState,
            'change-inline-style'
        );

        const currentStyle = editorState.getCurrentInlineStyle();

        // Unset style override for current color.
        if (selection.isCollapsed()) {
            nextEditorState = currentStyle.reduce((state, color) => {
                return RichUtils.toggleInlineStyle(state, color);
            }, nextEditorState);
        }

        // If the color is being toggled on, apply it.
        if (!currentStyle.has(toggledColor)) {
            nextEditorState = RichUtils.toggleInlineStyle(
                nextEditorState,
                toggledColor
            );
        }

        this.onChange(nextEditorState);
    }

    render() {
        const {editorState} = this.state;
        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = 'RichEditor-editor';
        var contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== 'unstyled') {
                className += ' RichEditor-hidePlaceholder';
            }
        }

        let urlInput;
        if (this.state.showURLInput) {
            urlInput =
                <div style={styles.urlInputContainer}>
                    <input
                        onChange={this.onURLChange}
                        ref="url"
                        style={styles.urlInput}
                        type="text"
                        value={this.state.urlValue}
                        onKeyDown={this.onLinkInputKeyDown}/>
                    <button onMouseDown={this.confirmLink}>Confirm</button>
                </div>;
        }


        return (
            <div className="RichEditor-root">
                <BlockStyleControls
                    editorState={editorState}
                    onToggle={this.toggleBlockType}/>
                <ColorControls
                    editorState={editorState}
                    onToggle={this.toggleColor}/>
                <InlineStyleControls
                    editorState={editorState}
                    onToggle={this.toggleInlineStyle}/>
                <div style={styles.buttons}>
                    <button onMouseDown={this.promptForLink} style={{marginRight: 10}}>Ссылка</button>
                    <button onMouseDown={this.removeLink}>Удалить ссылку</button>
                </div>
                {urlInput}
                <div className={className} onClick={this.focus}>
                    <Editor
                        blockStyleFn={getBlockStyle}
                        customStyleMap={styleMap}
                        editorState={editorState}
                        handleKeyCommand={this.handleKeyCommand}
                        onChange={this.onChange}
                        onTab={this.onTab}
                        placeholder="Tell a story..."
                        ref="editor"
                        spellCheck={true}/>
                </div>
            </div>
        );
    }
}

const styleMap = {
    red: {color: 'rgba(255, 0, 0, 1.0)'},
    gray: {color: 'rgba(128, 128, 128, 1.0)'}
};

var COLORS = [
    {label: 'Красный', style: 'red'},
    {label: 'Серый', style: 'gray'}
];

const ColorControls = (props) => {
    var currentStyle = props.editorState.getCurrentInlineStyle();
    return (
        <div style={styles.controls}>
            {COLORS.map((type, key) =>
                <StyleButton
                    key={key}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}/>
            )}
        </div>
    );
};

function getBlockStyle(block) {
    switch (block.getType()) {
        case 'blockquote': return 'RichEditor-blockquote';
        default: return null;
    }
}

class StyleButton extends React.Component {
    constructor(props) {
        super(props);

        this.onToggle = (e) => {
            e.preventDefault();
            this.props.onToggle(this.props.style);
        };
    }

    render() {
        let className = 'RichEditor-styleButton';
        if (this.props.active) {
            className += ' RichEditor-activeButton';
        }

        return (
            <span className={className} onMouseDown={this.onToggle}>
                {this.props.label}
            </span>
        );
    }
}

const BLOCK_TYPES = [
    {label: 'H1', style: 'header-one'},
    {label: 'H2', style: 'header-two'},
    {label: 'H3', style: 'header-three'},
    {label: 'H4', style: 'header-four'},
    {label: 'H5', style: 'header-five'},
    {label: 'H6', style: 'header-six'},
    {label: 'Blockquote', style: 'blockquote'},
    {label: 'Список', style: 'unordered-list-item'},
    {label: 'Нумерованный список', style: 'ordered-list-item'},
];

const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType();

    return (
        <div className="RichEditor-controls">
            {BLOCK_TYPES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={type.style === blockType}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}/>
            )}
        </div>
    );
};

var INLINE_STYLES = [
    {label: 'Жирный', style: 'BOLD'},
    {label: 'Курсив', style: 'ITALIC'},
    {label: 'Подчеркивание', style: 'UNDERLINE'},
];

const InlineStyleControls = (props) => {
    var currentStyle = props.editorState.getCurrentInlineStyle();
    return (
        <div className="RichEditor-controls">
            {INLINE_STYLES.map(type =>
                <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}/>
            )}
        </div>
    );
};


function findLinkEntities(contentBlock, callback) {
    contentBlock.findEntityRanges((character) => {
            const entityKey = character.getEntity();
            return (
                entityKey !== null
                //&& contentState.getEntity(entityKey).getType() === 'LINK'
            );
        },
        callback
    );
}

const Link = (props) => {
    const {url} = props.decoratedText;
    return (
        <a href={url} style={styles.link}>{props.children}</a>
    );
};

const styles = {
    root: {
        fontFamily: '\'Georgia\', serif',
        fontSize: 14,
        padding: 20,
        width: 600
    },
    editor: {
        borderTop: '1px solid #ddd',
        cursor: 'text',
        fontSize: 16,
        marginTop: 20,
        minHeight: 400,
        paddingTop: 20,
        border: '1px solid #ccc',
        padding: 10
    },
    controls: {
        fontFamily: '\'Helvetica\', sans-serif',
        fontSize: 14,
        marginBottom: 10,
        userSelect: 'none'
    },
    styleButton: {
        color: '#999',
        cursor: 'pointer',
        marginRight: 16,
        padding: '2px 0'
    },
    buttons: {
        marginBottom: 10
    },
    urlInputContainer: {
        marginBottom: 10
    },
    urlInput: {
        fontFamily: '\'Georgia\', serif',
        marginRight: 10,
        padding: 3
    },
    button: {
        marginTop: 10,
        textAlign: 'center'
    },
    link: {
        color: '#3b5998',
        textDecoration: 'underline'
    }
};
