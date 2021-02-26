import React from 'react';

export class TableRows extends React.Component{
    constructor(props)
    {
        super(props);
        this.rowData = new Array();
    }

    render = () => {
        console.log(`rowData: ${JSON.stringify(this.props.rowData)}`)
        return(
            this.props.rowData.map((rd) => {
                return (
                    <tr key={rd.id}>
                        <td>{rd.login}</td>
                        <td><img src={rd.avatar_url} width="50" height="50"/></td>
                        <td><a target="_blank" rel="noopener noreferrer" href={rd.html_url}>{rd.html_url}</a></td>   
                        <td>{rd.email}</td>
                        <td>{rd.location}</td>
                        <td>{rd.created_at}</td>
                        <td>{rd.updated_at}</td>
                    </tr> 
                )
            })
        )
    }
}

export default TableRows;