import * as React from 'react';
import {observer} from 'mobx-react';

@observer
export class Paginator extends React.Component {
    // PROPS:
    //     :pages - count of pages
    //     :current_page - current page
    //     :objects_length - count of all objects
    //     :unmargin - pagination without margin css
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
                        <a className="cursor-pointer" onClick={() => {
                            this.props.setPage(current_page - 1)
                        }}>
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>
                    : null}

                {Array.from(Array(pages).keys()).map(page => {
                    return (
                        <li key={page} className={current_page === page ? 'active' : ''}><a className="cursor-pointer" onClick={() => {
                            this.props.setPage(page)
                        }}>{page + 1}</a></li>
                    )
                })}

                {current_page < objects_length ?
                    <li>
                        <a className="cursor-pointer" onClick={() => {
                            this.props.setPage(current_page + 1)
                        }}>
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                    : null}
            </ul>
        )
    }
}

export function getPagesCount(objects_length, per_page = 10) {
    let pages = objects_length / per_page;
    switch (true) {
        case (pages <= 1):
            return 0;
        case (pages > 1):
            return Math.ceil(pages);
        default:
            return 0;
    }
}

export function getChunkedArray(array, length) {
    let chunked_array = [];
    let i, j, chunk = length;
    for (i = 0, j = array.length; i < j; i += chunk) {
        chunked_array.push(array.slice(i, i + chunk));
    }
    return chunked_array;
}