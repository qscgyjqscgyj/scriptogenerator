import * as React from 'react';
import {observer} from 'mobx-react';
import {Link} from 'react-router';

@observer
export class scriptsIsLoaded extends React.Component {
    render() {
        const {scriptsStore, renderComponent} = this.props;
        if((scriptsStore.scripts && scriptsStore.scripts.length > 0) || (scriptsStore.available_scripts && scriptsStore.available_scripts.length > 0)) {
            if(this.props.params.script) {
                const script = scriptsStore.script(this.props.params.script);
                if(script && script.data) {
                    return React.createElement(renderComponent, this.props);
                }
                return null;
            }
            return React.createElement(renderComponent, this.props);
        }
        return null;
    }
}
