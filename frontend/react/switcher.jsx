import React from 'react';
import update from 'react-addons-update';
import {observer} from 'mobx-react';


export class Switcher extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            checked: this.props.checked
        }
    }

    componentWillReceiveProps(props) {
        this.setState({checked: props.checked})
    }

    setCheked(checked) {
        this.setState({checked: checked})
    }

    onChangeHandler() {
        const {checked} = this.state;

        this.setCheked(!checked);

        return this.props.onChange();
    }

    render() {
        const {checked} = this.state;

        return(
            <div className="onoffswitch">
                <input type="checkbox" name="onoffswitch" onChange={this.onChangeHandler.bind(this)} className="onoffswitch-checkbox" id={this.props.html_id} checked={checked}/>
                <label className="onoffswitch-label" htmlFor={this.props.html_id}/>
            </div>
        );
    }
}
