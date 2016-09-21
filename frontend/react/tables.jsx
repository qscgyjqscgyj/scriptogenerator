import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observer} from 'mobx-react';

@observer
export class Tables extends React.Component {
    render() {
        const {scriptsStore} = this.props;
        let script = scriptsStore.script(this.props.params.script);
        if(script) {
            return(
                <div className="col-md-12">
                    {script.name}
                </div>
            );
        }
        return <div></div>;
    }
}
