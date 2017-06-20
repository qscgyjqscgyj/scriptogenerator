import * as React from 'react';
import {Link} from 'react-router';
import {observer} from 'mobx-react';

@observer
export class Nav extends React.Component {
    constructor(props) {
        super(props);

        this.scriptsStore = this.props.scriptsStore;
        this.script = this.props.script;
    }

    render() {
        if(this.script && this.scriptsStore) {
            return(
                <nav className={"navbar navbar-default unmargin"}>
                    <div className="container-fluid">
                        <ul className="nav navbar-nav">
                            <li className={`dropdown ${this.props.location.pathname.includes('/tables/') ? 'active' : ''}`}>
                                <Link to={this.scriptsStore.scriptUrl(this.script)} className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                    Сценарии <span className="caret"/>
                                </Link>
                                <ul className="dropdown-menu">
                                    {this.script.data.map((table, key) => {
                                        return(
                                            <li key={key} className={table.id === this.props.params.table ? 'active' : null}>
                                                <Link to={this.scriptsStore.tableUrl(this.script, table, 'share')}>{table.name}</Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </li>
                        </ul>
                    </div>
                </nav>
            );
        }
        return null;
    }
}
