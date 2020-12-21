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
                    <tr><td>3133</td><td>30713</td><td>黃宗羲</td><td>1610</td><td>1695</td></tr>
                    <tr><td>3154</td><td>34252</td><td>顧炎武</td><td>1613</td><td>1682</td></tr>
                    <tr><td>3201</td><td>29584</td><td>陳子龍</td><td>1608</td><td>1647</td></tr>
                    <tr><td>3239</td><td>30849</td><td>高攀龍</td><td>1562</td><td>1626</td></tr>
                    <tr><td>3475</td><td>29707</td><td>劉永澄</td><td>1576</td><td>1612</td></tr>
                    <tr><td>3529</td><td>30239</td><td>錢謙益</td><td>1582</td><td>1664</td></tr>
                    <tr><td>3599</td><td>30598</td><td>徐光啟</td><td>1562</td><td>1633</td></tr>
                    <tr><td>3601</td><td>30602</td><td>徐世溥</td><td>1608</td><td>1658</td></tr>
                    <tr><td>3614</td><td>30657</td><td>黃淳耀</td><td>1605</td><td>1645</td></tr>
                    <tr><td>3629</td><td>34742</td><td>顧憲成</td><td>1550</td><td>1612</td></tr>
                    <tr><td>3728</td><td>34744</td><td>馮從吾</td><td>1556</td><td>1627</td></tr>
                    <tr><td>3765</td><td>34747</td><td>鄒元標</td><td>1551</td><td>1624</td></tr>
                    <tr><td>4114</td><td>34786</td><td>沈思孝</td><td>1542</td><td>1611</td></tr>
                    <tr><td>4139</td><td>34919</td><td>屠隆</td><td>1542</td><td>1605</td></tr>
                    <tr><td>4468</td><td>30240</td><td>馮夢禎</td><td>1548</td><td>1605</td></tr>
                    <tr><td>5059</td><td>30734</td><td>倪元璐</td><td>1593</td><td>1644</td></tr>
                    <tr><td>5095</td><td>34926</td><td>沈壽民</td><td>1607</td><td>1675</td></tr>
                    <tr><td>5256</td><td>35076</td><td>魏禧</td><td>1624</td><td>1680</td></tr>
                    <tr><td>5302</td><td>35118</td><td>吳偉業</td><td>1609</td><td>1671</td></tr>
                    <tr><td>5309</td><td>35127</td><td>楊漣</td><td>1571</td><td>1625</td></tr>
                    <tr><td>5447</td><td>35222</td><td>袁宏道</td><td>1568</td><td>1610</td></tr>
                    <tr><td>5904</td><td>54845</td><td>徐燦</td><td>1610</td><td>1678</td></tr>
                    <tr><td>5987</td><td>54903</td><td>李因</td><td>1616</td><td>1685</td></tr>
                    <tr><td>6018</td><td>56589</td><td>侯方域</td><td>1618</td><td>1654</td></tr>
                    <tr><td>6037</td><td>59750</td><td>程嘉燧</td><td>1565</td><td>1644</td></tr>
                    <tr><td>6050</td><td>63882</td><td>孫承宗</td><td>1563</td><td>1638</td></tr>

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
