import React, { Component, lazy, Suspense, Fragment } from 'react';
import {
  Card,
  Col,
  Row,
  Table,
} from 'reactstrap';
import Button from 'reactstrap/lib/Button';
import CardHeader from 'reactstrap/lib/CardHeader';
import CardBody from 'reactstrap/lib/CardBody';
import Badge from 'reactstrap/lib/Badge';


class Graph extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    
  }


  queryAndUpdate(q) {
    this.setState({ isLoading: true });
    fetch('http://localhost:5000/api/search?q=' + q)
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
