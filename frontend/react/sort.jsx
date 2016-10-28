import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import update from 'react-addons-update';
import {observer} from 'mobx-react';
import {ModalWrapper} from './modal';
import {Coll} from '../mobx/tablesStore';
import { sortable } from 'react-sortable';

class ListItem extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'SortableListItem';
    }
    render() {
        return (
        <div {...this.props} className="list-item">{this.props.children}</div>
        )
    }
}

var SortableListItem = sortable(ListItem);

export class SortableList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            draggingIndex: null,
            data: props.data
        }
    }
    updateState(obj) {
        this.setState(obj, () => {this.state.data.sortHandler(obj)});
    }
    componentWillReceiveProps(props) {
        if(!this.state.draggingIndex) {
            this.setState(update(this.state, {data: {$set: props.data}}));
        }
    }
    render() {
        var childProps = { className: 'myClass1' };
        var listItems = this.state.data.items.map(function(item, i) {
            return (
                <SortableListItem
                    key={i}
                    updateState={this.updateState.bind(this)}
                    items={this.state.data.items}
                    draggingIndex={this.state.draggingIndex}
                    sortId={i}
                    outline="list"
                    childProps={childProps}>{item.name}</SortableListItem>
            );
        }, this);

        return (
            <div className="list">{listItems}</div>
        )
    }
}