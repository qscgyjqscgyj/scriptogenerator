import React from 'react';
import update from 'react-addons-update';
import {observer} from 'mobx-react';

export function moveInArray(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        let k = new_index - arr.length;
        while ((k--) + 1) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
}

@observer
export class Sort extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: props.children
        }
    }
    componentWillReceiveProps(props) {
        this.setState(update(this.state, {items: {$set: props.children}}));
    }
    moveItem(index, new_index) {
        let {items} = this.state;
        items = moveInArray(items, index, new_index);
        this.setState(update(this.state, {items: {$set: items}}), () => {
            return this.props.onSort(items);
        });
    }
    render() {
        let {items, itemUp, itemDown} = this.state;
        return(
            <div>
                {items.map((item, key) => {
                    if(this.props.sortStoreItems) {
                       return(
                           <div key={key}>
                               {item}
                           </div>
                       )
                    }
                    return(
                        <div key={key} className="sort_block">
                            {!this.props.left ?
                                <div className="sort_item">
                                    {item}
                                </div>
                            : null}
                            <div className="sort_icons">
                                {key !== 0 ?
                                    <i
                                        className="glyphicon glyphicon-triangle-top"
                                        aria-hidden="true"
                                        onClick={() => {this.moveItem(key, key - 1)}}/> : null}
                                {(key + 1) !== this.props.children.length ?
                                    <i
                                        className="glyphicon glyphicon-triangle-bottom"
                                        aria-hidden="true"
                                        onClick={() => {this.moveItem(key, key + 1)}}/> : null}
                            </div>
                            {this.props.left ?
                                <div className="sort_item">
                                    {item}
                                </div>
                            : null}
                        </div>
                    )
                })}
            </div>
        );
    }
}
