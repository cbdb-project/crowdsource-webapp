// import * as R from 'ramda'

import React, { Component, Fragment, } from 'react';
import { ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import ReactModal from 'react-modal';

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
import Circos from 'circos';
import * as _ from 'lodash';
// import * as d3 from "d3";

// import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
// import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities'

// const brandPrimary = getStyle('--primary')
// const brandSuccess = getStyle('--success')
// const brandInfo = getStyle('--info')
// const brandWarning = getStyle('--warning')
// const brandDanger = getStyle('--danger')


class AssocModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      toggle: false
    };
    // this.assocChart = React.createRef();
    this.onAfterOpen = this.onAfterOpen.bind(this);
    this.setToggle = this.setToggle.bind(this);
    console.log("Assoc Modal constructor props: ");
    console.log(this.props);


  }

  windowOpened(personid, collection) {
    // this.setState({
    //   personid: personid,
    //   collection: collection
    // });


    // console.log("collection 1");
    // console.log(collection);
  }

  setToggle() {
    this.setState({
      toggle: !this.state.toggle,
    });
    console.log("SetToggle Props ...");
    console.log(this.props.collection[1].c_personid);
  }
  onAfterOpen(e, props) {

    console.log("After open .. props = ");
    console.log(this.props);
    console.log(this.props.collection[1].c_personid);

    // super(prevProps, prevState, snapshot);
    // console.log("Target person id:" + this.state.personid)
    if (this.props.collection && this.props.personid) {
      this.renderAffiliatesOf(this.props.collection, this.props.personid);
    }
  }



  renderSocialCircle(collection) {


    var affiliates = {};


    console.log("Affiliate constructed - " + Object.values(affiliates).length);
    console.log(affiliates);

  }

  // Render a certain person's association among a collection 
  renderAffiliatesOf(collection, targetid) {
    console.log("render affiliates of");

    var target;

    // Find that person first
    for (const p of collection) {
      if (p.c_personid === targetid) {
        target = p;
      }
    }
    const affiliates = target.assoc_data;

    const peopleIds = {};
    const peopleMatches = _.intersectionWith(collection, affiliates, (b, a) => {
      if (a.c_assoc_id === b.c_personid && !peopleIds[a.c_assoc_id]) {
        peopleIds[a.c_assoc_id] = true;
        return true;
      }
      return false;
    });

    console.log(peopleMatches);
    console.log(Object.keys(peopleIds).sort());
    this._renderPeopleGraph(peopleMatches);

  }

  async _renderPeopleGraph(people) {
    var width = document.getElementById("assocChart").offsetWidth / 1.5;
    var colors = [
      "#996600",
      "#666600",
      "#99991E",
      "#CC0000",
      "#FF0000",
      "#FF00CC",
      "#FFCCCC",
      "#FF9900",
      "#FFCC00",
      "#FFFF00",
      "#CCFF00",
      "#00FF00",
      "#358000",
      "#0000CC",
      "#6699FF",
      "#99CCFF",
      "#00FFFF",
      "#CCFFFF",
      "#9900CC",
      "#CC33FF",
      "#CC99FF",
      "#666666",
      "#999999",
      "#CCCCCC",
    ]
    var circos = new Circos({
      container: '#assocChart',
      width: width,
      height: width,
    })

    var chordData = [];
    var chordMappings = {};
    var peopleData = [];
    var i = 0, j = 0;
    await people.forEach(async function (d) {

      peopleData.push({
        id: "" + d.c_personid,
        label: d.c_name_chn,
        color: colors[i++ % colors.length],
        len: 10,
      });
      if (d.assoc_data == null) {
        return (null);
      }
      if (chordMappings[d.c_personid] == null) {

        chordMappings[d.c_personid] = [];
      }
      await d.assoc_data.map((assoc) => {
        if (assoc == null) {
          return (null);
        }


        // Filter to associations among 1st-degree affiliates
        for (const p of people) {

          if (p.c_personid === assoc.c_assoc_id) {
            var chord = {
              color: colors[j++ % colors.length],
              assoc_desc: assoc.c_assoc_desc_chn,
              source: {
                id: "" + d.c_personid,
                name: d.c_name_chn,
                start: 1,
                end: 2
              },
              target: {
                id: "" + assoc.c_assoc_id,
                start: 1,
                name: p.c_name_chn,
                end: 2
              }
            };
            if (!chordMappings[p.c_personid]) {

              chordMappings[p.c_personid] = [];
            }

            chordMappings[p.c_personid].push(chord);
            chordMappings[d.c_personid].push(chord);
            chordData.push(chord);
          }
        }
        return (null);

      });

    });

    var chordConf = {
      logScale: false,
      opacity: 0.3,

      tooltipContent: function (d) {
        return '<h3>' + d.source.name + '(' + d.assoc_desc + ') ➤ ' + d.target.name + '</h3><i></i>'
      },
      events: {
        'mouseover.demo': function (d, i, nodes, event) {
          // console.log(d, i, nodes, event.pageX)
        }
      }
    }

    console.log(peopleData);
    console.log(chordData);
    console.log(chordMappings);

    circos
      .layout(peopleData, {
        innerRadius: width / 3,
        outerRadius: width / 2,
        cornerRadius: 10,
        events: {
          'mouseover.demo': function (d, i, nodes, event) {

            circos.removeTracks('assoc');
            circos.chords('assoc', chordMappings[d.id], chordConf);
            circos.render();
          }
        }
      })
      .chords('assoc', chordData, chordConf)
      .render()

    // 
  }

  render() {

    return (
      <div>
        <ReactModal isOpen={this.state.toggle} toggle={this.setToggle} onAfterOpen={this.onAfterOpen}>
          <ModalHeader toggle={this.setToggle}>Social Affiliations</ModalHeader>
          <ModalBody>
            <Card id="assocChart" className="vh-100">

            </Card>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.setToggle}>Close</Button>{' '}
          </ModalFooter>
        </ReactModal>
      </div>
    )

  }
}

class Dashboard extends Component {



  constructor(props) {
    super(props);
    this.state = {
      results: [],
      isLoading: true,
      personSelected: -1,
      view: "list"
    };
    this.assocModal = React.createRef();
    this.searchTyping = this.searchTyping.bind(this);
    this.viewToggle = this.viewToggle.bind(this);
    // this._personClicked = this._personClicked.bind(this);

  }



  queryAndUpdate(q) {
    this.setState({ isLoading: true });
    fetch('http://' + window.location.hostname + ':5000/api/search?q=' + q)
      .then(res => res.json())
      .then((data) => {
        this.setState({ isLoading: false })

        this.setState({ results: data })
        if (data == null) {
          this.setState({ results: [] })
        }
        console.log("Query result size: " + data.length);
        console.log(data);

      })
      .catch((e) => {
        console.log(e);
        this.setState({ results: [] });

      });
  }




  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>


  componentDidMount() {
    // this.queryAndUpdate();
    // this.assocChart.componentDidMount = () => {
    //   console.log("Painting assoc graph");
    //   console.log(document.getElementById("chordsChart"));
    //   this.drawAssocGraph(1);

    // }
  }

  lastEvents = {};
  handlers = [];
  searchTyping(e, doubleTap) {
    if (!doubleTap) {
      var st = this.searchTyping;
      // var ne = R.clone(e);
      var ne = {};
      ne = Object.assign(ne, e);
      this.lastEvents[e.target] = {};
      this.lastEvents[e.target].t = Date.now();
      console.log(e.target.value + " 1st triggered .. @" + this.lastEvents[e.target].t);

      for (var i = 0; i < this.handlers.length; i++) {
        clearInterval(this.handlers[i]);
      }
      this.handlers.push(setInterval(function () {
        st(ne, true)
      }, 600));
      return;
    } else {
      // Some new event triggered in between
      var passed = (Date.now() - this.lastEvents[e.target].t)
      console.log("2nd trigger " + e.target.value + " // " + passed);
      if (passed < 500)
        return;
      else {
        for (var i = 0; i < this.handlers.length; i++) {
          clearInterval(this.handlers[i]);
        }
      }
      console.log("2nd trigger executed! " + e.target.value);
    }
    var q = e.target.value;
    if (q) {
      this.queryAndUpdate(q);
    }
  }

  viewToggle(e) {
    var btn = e.target.id;
    // console.log("Button ... ");
    // console.log(btn);
    if (btn === "btnListView") {
      this.setState({ view: "list" })
    } else if (btn === "btnCardView") {
      this.setState({ view: "card" })
    } else if (btn === "btnGraphView") {
      this.setState({ view: "graph" })
    }
  }


  renderSearchBox() {
    this.searchTyping = this.searchTyping.bind(this);
    return (
      <Fragment>

        <Row>
          <Col>
            <div className="jumbotron jumbotron-fluid">
              <form className="form-inline d-flex justify-content-center md-form form-sm active-purple active-purple-2 mt-2">
                <i className="cil-search form-control-large" aria-hidden="true"></i>
                <input onChange={this.searchTyping} className="form-control search-input form-control-large ml-3 w-75" type="text" placeholder="Search"
                  aria-label="Search" />
              </form>
            </div>
          </Col>
        </Row>

        {(this.state.results.length > 0) ? (
          <div>

            <Button className="btn-ghost-dark" onClick={this.viewToggle} >
              <i className="c-icon-2xl cil-align-left" id="btnListView"></i>
            </Button>

            <Button className="btn-ghost-dark" onClick={this.viewToggle}>
              <i className="c-icon-2xl cil-applications" id="btnCardView" ></i>
            </Button>

          </div>
        ) : null}
      </Fragment>
    )
  }

  renderListView() {
    return (
      <Card>
        <Table hover responsive className="table-outline mb-0 d-none d-sm-table">
          <thead className="thead-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Matching</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.results.map((row, index) => {
                return (
                  <tr key={index}>
                    <td>
                      <div>{row.c_personid}</div>
                    </td>
                    <td>
                      <div>
                        {row.c_name_chn}
                      </div>

                    </td>
                    <td>
                      {Object.entries(row._highlights).map((high, i) => {
                        // console.log(high);
                        return (
                          <div key={index + "hh_" + i}>
                            <div className="small text-muted">
                              <span>{Object.values(high)[0]}</span>
                            </div>
                            <div className="search-result" dangerouslySetInnerHTML={{ __html: Object.values(high)[1] }}>
                            </div>
                            {
                              // console.log(Object.values(row._highlights)[0][0])
                            }
                          </div>
                        )
                      })}
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </Table>
      </Card>
    )
  }

  _personClicked(e) {
    console.log("New person selected: " + e);
    this.setState({ personSelected: e });
    console.log("Collection ... #2nd person");
    console.log(this.state.results[1].c_personid);

    this.assocModal.current.setToggle();
  }
  _renderCard(item) {
    let modifiers = item.c_female === "1" ? "border-secondary text-white bg-gradient-warning" : "border-primary bg-gradient-primary  text-white ";
    return (
      <Col className="col-sm-4">
        <Card >
          <CardHeader className={modifiers}>

            <b>{item.c_name} </b>  {item.c_name_chn} ({item.c_birthyear} - {item.c_deathyear})
            <Button id={item.c_personid} onClick={this._personClicked.bind(this, item.c_personid)} className="float-right" >
              <i className="cil-album"></i>
            </Button>
          </CardHeader>
          <CardBody className="vh-25 overflow-hidden" >
            {item.status_data.map((s) => {
              if (s.c_status_desc_chn !== null) {
                // console.log(s.c_status_desc_chn);
                return (

                  <Badge pill primary className="m-1">{s.c_status_desc_chn}</Badge>

                );
              }
              return (null);
            })
            }
            <div>
              Notes:
            {item.c_notes}
            </div>

          </CardBody>
        </Card>
      </Col>
    )
  }

  renderCardView() {
    let finalArr = [], columns = [];
    for (let index = 0; index < this.state.results.length - 1; index++) {
      let item = this.state.results[index];
      columns.push(this._renderCard(item));
      // after three items add a new row 
      if ((index + 1) % 3 === 0) {
        finalArr.push(<Row>{columns}</Row>);
        columns = [];
      }
    }

    if (this.state.results.length % 3 > 0) {
      finalArr.push(<Row><Col className="col-sm-6">{columns}</Col></Row>);
    }
    return finalArr;


  }




  render() {

    return (
      <Fragment>
        {this.renderSearchBox()}

        {/* {this.renderGraph()} */}
        <AssocModal ref={this.assocModal} personid={this.state.personSelected} collection={this.state.results}></AssocModal>
        <div>
          {(this.state.view === "list") && this.renderListView()}
          {(this.state.view === "card") && this.renderCardView()}

        </div>
      </Fragment >
    );
  }
}

export default Dashboard;
