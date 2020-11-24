import React, { Component, Fragment } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { Table } from 'reactstrap';


class Authors extends Component {
    constructor(props) {
        super(props);
    }

    _flatten(arr, fields) {
        // console.log(fields);
        var fs = Object.values(fields);
        return arr.map((r, i) => {
            // console.log("Current index: " + i);
            var row = r.map((c, j) => {
                if (fs[j].type === "person") {
                    // console.log(c);
                    return c.c_name_chn
                } else return c
            })
            return row;

        })
    }
    renderAuthors() {
            return (
                <Table hover responsive className="table-outline align-bottom mb-0 d-none d-sm-table data-table">
                    <thead className="">
                        <tr>
                            <th>Begins at 始於行號</th>
                            <th>Person_ID</th>
                            <th>Writer 作者</th>
                            <th>Birth year 生年</th>
                            <th>Death year 卒年</th>
                        </tr>
                    </thead>

                    <tbody>
                    <tr><td>51</td><td>34531</td><td>羅倫</td><td>1431</td><td>1478</td></tr>
                    <tr><td>78</td><td>29570</td><td>陳獻章</td><td>1428</td><td>1500</td></tr>
                    <tr><td>223</td><td>30631</td><td>胡居仁</td><td>1434</td><td>1484</td></tr>
                    <tr><td>289</td><td>34522</td><td>何喬新</td><td>1427</td><td>1502</td></tr>
                    <tr><td>314</td><td>24579</td><td>蔡清</td><td>1453</td><td>1508</td></tr>
                    <tr><td>380</td><td>67166</td><td>謝鐸</td><td>1435</td><td>1510</td></tr>
                    <tr><td>442</td><td>34573</td><td>賀欽</td><td>1437</td><td>1510</td></tr>
                    <tr><td>480</td><td>33842</td><td>徐禎卿</td><td>1479</td><td>1511</td></tr>
                    <tr><td>484</td><td>28691</td><td>李東陽</td><td>1447</td><td>1516</td></tr>
                    <tr><td>534</td><td>34592</td><td>張吉</td><td>1451</td><td>1518</td></tr>
                    <tr><td>542</td><td>128585</td><td>林光</td><td>1439</td><td>1519</td></tr>
                    <tr><td>669</td><td>34648</td><td>何景明</td><td>1483</td><td>1521</td></tr>
                    <tr><td>677</td><td>34579</td><td>王鏊</td><td>1450</td><td>1524</td></tr>
                    <tr><td>692</td><td>24554</td><td>林俊</td><td>1452</td><td>1527</td></tr>
                    <tr><td>807</td><td>128596</td><td>林希元</td><td>1481</td><td>1565</td></tr>
                    <tr><td>850</td><td>34624</td><td>李夢陽</td><td>1475</td><td>1531</td></tr>
                    <tr><td>877</td><td>131629</td><td>程文德</td><td>1497</td><td>1559</td></tr>
                    <tr><td>887</td><td>30374</td><td>王守仁</td><td>1472</td><td>1528</td></tr>
                    <tr><td>1077</td><td>28825</td><td>張邦奇</td><td>1484</td><td>1544</td></tr>
                    <tr><td>1172</td><td>29602</td><td>程敏政</td><td>1444</td><td>1499</td></tr>
                    <tr><td>1324</td><td>131843</td><td>楊廉</td><td>1452</td><td>1525</td></tr>
                    <tr><td>1427</td><td>67756</td><td>張元禎</td><td>1437</td><td>1506</td></tr>
                    <tr><td>1439</td><td>34645</td><td>康海</td><td>1475</td><td>1540</td></tr>
                    <tr><td>1482</td><td>123973</td><td>申時行</td><td>1535</td><td>1614</td></tr>
                    <tr><td>3036</td><td>33860</td><td>呂柟</td><td>1479</td><td>1542</td></tr>
                    <tr><td>3083</td><td>126976</td><td>毛憲</td><td>1469</td><td>1535</td></tr>
                    </tbody>
                </Table>
            )

    }
    render() {
        return (

            <div>

                <Card className="mt-4">
                    <Card.Body>
                        {this.renderAuthors()}
                    </Card.Body>
                </Card>
            </div>


        )
    }
}

export default Authors;
