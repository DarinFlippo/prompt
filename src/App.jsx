import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import { encode } from "base-64";
import Pagination from "react-js-pagination";
import TableRows from './TableRows'
import './bootstrap.min.css';
import './App.css'

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
    if (this.searchFor != null && event.target.value.length > 0){
       this.getData(event.target.value);
    }
    else
      this.setState({resultrows: null});
  }

  // Fetch data from GitHub
  async getData(user){
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
    var users = await fetch(url, 
    {
      method: 'get', 
      headers: new Headers(
        {
          'Authorization': 'Basic ' + encode(this.username + ":" + this.token),
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        }
      )
    });

    var user_data = await users.json(); 
    this.totalItems = user_data.total_count;
    
    var rows = new Array();
    let len = user_data.items.length;
    for(var i = 0; i < len; i++)
    {
      var row = user_data.items[i];
      var data = await this.getUserData(row.login);
      var obj = 
      {
        id: row.id,
        login: row.login,
        avatar_url: row.avatar_url,
        html_url: row.html_url,
        email: data.email ?? "",
        location: data.location ?? "",
        created_at: data.created_at ?? "",
        updated_at: data.updated_at ?? ""
      }
      rows.push(obj);
    }

    this.setState({resultrows: rows});
      
  }

  async getUserData(user){
    const url = `${this.userQuery}/${user}`;
    let response = await fetch(url, 
    {
      method: 'get', 
      headers: new Headers(
        {
          'Authorization': 'Basic ' + encode(this.username + ":" + this.token),
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        }
      )
    });

    return await response.json();  
  }

  // Build the table body
  renderResultRows = () => {
    if (this.state.resultrows != null && this.state.resultrows.length > 0)
      return(<TableRows rowData={this.state.resultrows}/>)
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
