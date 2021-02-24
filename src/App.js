import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import { encode } from "base-64";
import Pagination from "react-js-pagination";
import './bootstrap.min.css';
import './App.css'
import { data } from 'jquery';
import { ajax } from 'jquery';

export class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {searchType: 'login', resultrows: null, isFetching: false, error: null};
    this.handleChange = this.handleChange.bind(this);
    this.setSearchType = this.setSearchType.bind(this);
    this.getData = this.getData.bind(this);
    this.getUserData = this.getUserData.bind(this);
    this.renderResultRows = this.renderResultRows.bind(this);
    this.baseUrl = "https://api.github.com/search";
    this.userQuery = "https://api.github.com/users";
    this.username = "";
    this.token = "";
    this.page = 1;
    this.searchFor = "";
    this.totalItems = 0; 
    this.itemsPerPage = 5;
  }

  // Paging event handler
  handlePageChange(pageNumber){
    console.log(`active page is ${pageNumber}`);
    this.page = pageNumber;
    this.getData(this.searchFor);
  }

  // Set search type (email or login) event handler
  setSearchType(event){
    // Reset state, trigger re-render
    this.page = 1;
    this.totalItems = 0;
    this.setState({searchType: event.target.value, resultrows: null});
  }

  // Set search expression event handler
  handleChange(event){
    this.searchFor = event.target.value;
    this.page = 1;
    this.totalItems = 0;
    if (this.searchFor != null && event.target.value.length > 0)
      this.setState({resultrows: this.getData(event.target.value)});
    else
      this.setState({resultrows: null});
  }

  // Fetch data from GitHub
  getData(user){
    var url = `${this.baseUrl}/users?q=${user}`;
    
    if (this.state.searchType == 'login'){
        url = url + ` in:login type:user&sort=best match&order=desc&per_page=${this.itemsPerPage}&page=${this.page}`;
    }
    else{
      url = url +  ` in:email type:user&sort=best match&order=desc&per_page=${this.itemsPerPage}&page=${this.page}`;
    }

    console.log(`url is ${url}`);

    // Used a  temporary account to avoid data throttling
    // because each keypress executes a fetch, they add up quickly.
    // TODO:  Implement input rate control on this end.
    fetch(url, 
    {
      method: 'get', 
      headers: new Headers(
        {
          'Authorization': 'Basic ' + encode(this.username + ":" + this.token),
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        }
      )
    })
    .then(res => res.json())
    .then(
      (result) => {
        this.totalItems = result.total_count;
        this.setState({isFetching: false, resultrows: result.items});
      },
      (e) => {
        console.log(`Error: ${e}.`);
        this.setState({isFetching: false, error: e, resultrows: null});
      }
    );
  }

  getUserData(user){
    const url = `${this.userQuery}/${user}`;
    let returned = '';
    console.log(`url is ${url}`);
    ajax({
      url: url,
      data: user,
      async: false,
      headers: { 
        'Authorization': 'Basic ' + encode(this.username + ":" + this.token),
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      success: function(data){returned = data;}
    });
    //console.log(`data is ${JSON.stringify(returned)}`)
    return returned;
    /* return fetch(url, 
      {
        method: 'get', 
        headers: new Headers(
          {
            'Authorization': 'Basic ' + encode(this.username + ":" + this.token),
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          }
        )
      })
      .then(res => res.json()); */
  }
  

  
  // Build the table body
  renderResultRows = () => {
    if (this.state.resultrows != null){
       return this.state.resultrows.map((r) => {
        const data = this.getUserData(r.login);
        return (
        <tr key={r.id}>
            <td>{r.login}</td>
            <td><img src={r.avatar_url} width="50" height="50"/></td>
            <td><a target="_blank" rel="noopener noreferrer" href={r.html_url}>{r.html_url}</a></td>   
            <td>{data.email}</td>
            <td>{data.location}</td>
            <td>{data.created_at}</td>
            <td>{data.updated_at}</td>
        </tr>
        )
      }); 
    }
  }
  
  // Build the NavBar Html
  renderNav = () => {
    return(
      <div className="App">
        <Navbar bg="dark" expand="lg">
        <Navbar.Brand href="#home" className="text-light">Github User Search</Navbar.Brand>
          <Form inline>
            <select class="form-control pull-left mr-3" value={this.state.value} onChange={this.setSearchType}>
              <option value="login">Login</option>
              <option value="email">Email</option>
            </select>
            <FormControl 
              type="text" 
              value = {this.state.value}
              onChange={this.handleChange}
              placeholder="Search" 
              className="mr-sm-2 search-box" />
          </Form>
        </Navbar>
      </div>
    );
  }

  // Build the table header
  // Table was chosen in the event that I implemented
  // Datatables.net JavaScript library.
  renderHeader = () => {
    return <thead><tr>
      <th scope="col" className="login-cell">Username</th>
      <th scope="col" className="image-cell">Avatar</th>
      <th scope="col" className="link-cell">Github Link</th>
      <th scope="col" className="link-cell">Email</th>
      <th scope="col" className="link-cell">Location</th>
      <th scope="col" className="link-cell">Created</th>
      <th scope="col" className="link-cell">Updated</th>
    </tr></thead>
  }


  // Build the pagination component
  renderPager = () => {
    if (this.totalItems > 0){
      return (<Pagination
        activePage={this.page}
        itemsCountPerPage={10}
        totalItemsCount={this.totalItems}
        pageRangeDisplayed={5}
        hideFirstLastPages={true}
        itemClass="page-item"
        linkClass="page-link"
        innerClass="pagination justify-content-center"
        onChange={this.handlePageChange.bind(this)}
    />);
    }
  }
 
  // Renders the page using the rendering sub-components
  render = () => {
    return (
      <div className="App">
        {this.renderNav()}
        <div className="container mx-auto results-container">
          <div className="row">
            <div className="col mt-3">
              <table className="table table-striped table-dark table-hover">
                {this.renderHeader()}
                <tbody>
                  {this.renderResultRows()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="mx-auto pager-container">
          {this.renderPager()}
        </div>
      </div>
      
    );
  }
}
export default App;
