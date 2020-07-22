import React, { Component, } from 'react';
import {
  Card,
  
} from 'reactstrap';
const SERVER = 'http://' + window.location.hostname + ':5000'

class Graph extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    
  }


  queryAndUpdate(q) {
    this.setState({ isLoading: true });
    fetch(SERVER + '/api/search?q=' + q)
      .then(res => res.json())
      .then((data) => {
        this.setState({ isLoading: false })

        this.setState({ results: data })
        if (data == null) {
          this.setState({ results: [] })
        }
      })
      .catch((e) => {
        console.log(e);
        this.setState({ results: [] });
      });
  }

  componentDidMount() {

    // this.queryAndUpdate();
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>



  render() {

    return (
      <Card>
          
      </Card>
    );
  }
}

export default Graph;
