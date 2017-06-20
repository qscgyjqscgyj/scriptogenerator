import * as React from 'react';
import {observer} from 'mobx-react';
import {Link} from 'react-router';
import ScriptsStore from '../../mobx/scriptsStore';

@observer
class Tables extends React.Component {
    constructor(props) {
        super(props);

        this.script = this.props.script;
        this.scriptsStore = this.props.scriptsStore;
    }

    componentWillMount() {
    }

    render() {
        let {script, scriptsStore} = this;
        if (scriptsStore) {
            return (
                <div className="col-md-12">
                    <div className="row">
                        <div className="col-md-12">
                            <table className="table">
                                <thead>
                                <tr>
                                    <td>Название сценария</td>
                                </tr>
                                </thead>
                                <tbody>
                                {script.data.map((table, key) => {
                                    return (
                                        <tr key={key}>
                                            <td>
                                                <Link to={scriptsStore.tableUrl(script, table)}>{table.name}</Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }
}


@observer
export class TablesWrapper extends React.Component {
    render() {
        return React.createElement(Tables, {...this.props});
    }
}
