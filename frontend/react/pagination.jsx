import * as React from 'react';
import {observer} from 'mobx-react';

@observer
export class Paginator extends React.Component {
    constructor(props) {
        super(props);

        this.state = props;
    }
    componentWillReceiveProps(props) {
        this.setState(props);
    }
    render() {
        const {pages, current_page, objects_length, unmargin} = this.state;
        return (
            <ul className={`pagination ${unmargin ? 'unmargin' : ''}`}>
                {current_page > 0 ?
                    <li>
                        <a href="#" onClick={() => {this.props.setPage(current_page - 1)}}>
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>
                : null}

                {Array.from(Array(pages).keys()).map(page => {
                    return(
                        <li key={page} className={current_page === page ? 'active' : ''}><a href="#" onClick={() => {this.props.setPage(page)}}>{page + 1}</a></li>
                    )
                })}

                {current_page + 1 < objects_length ?
                    <li>
                        <a href="#" onClick={() => {this.props.setPage(current_page + 1)}}>
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                : null}
            </ul>
        )
    }
}
