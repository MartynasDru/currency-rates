import React, { Component } from 'react';
import axios from 'axios';
var to_json = require('xmljson').to_json;

class App extends Component {
  constructor(props) {
    super(props);
    let today = new Date();
    today = today.toISOString().substr(0, 10);

    this.state = {
      ccy: 'usd',
      dtFrom: today,
      dtTo: today,
      today: today,
      data: '',
      rateChange: 0,
      loading: false
    };
    this.fetchData = this.fetchData.bind(this);
    this._handleCurrencyChange = this._handleCurrencyChange.bind(this);
    this._handleDateFromChange = this._handleDateFromChange.bind(this);
    this._handleDateToChange = this._handleDateToChange.bind(this);
    this.countRateChange = this.countRateChange.bind(this);
  }

  fetchData() {
    const self = this;
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const url = 'https://old.lb.lt/webservices/FxRates/FxRates.asmx/getFxRatesForCurrency';
    this.setState({ loading: true })
    axios.get(proxyurl + url, {
      params: {
        tp: 'eu',
        ccy: this.state.ccy,
        dtFrom: this.state.dtFrom,
        dtTo: this.state.dtTo
      }
    })
    .then(function (response) {
      to_json(response.data, function(error, data) {
        response.data = data;
      });
      let data  = response.data.FxRates.FxRate;
      if (data.Tp != undefined) {
        data = { '0': data};
      }
      self.countRateChange(data);
      self.setState({ data: data });
      self.setState({ loading: false });
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  _handleCurrencyChange(e) {
    this.setState({ ccy: e.target.value })
  }

  _handleDateFromChange(e) {
    this.setState({ dtFrom: e.target.value })
  }

  _handleDateToChange(e) {
    this.setState({ dtTo: e.target.value })
  }

  countRateChange(data) {
    const firstRate = data[0].CcyAmt[1].Amt;
    const lastRate = data[Object.keys(data)[Object.keys(data).length - 1]].CcyAmt[1].Amt;
    let rateChange = lastRate - firstRate;
    rateChange = rateChange == 0 ? 0 : rateChange.toFixed(3);
    this.setState({ rateChange: rateChange })
  }

  render() {
    const navigationStyle = {
      width: '50%',
      margin: '0 auto',
      textAlign: 'center'
    }

    let rateChangeStyle = {
      textAlign: 'center',
      color: this.state.rateChange < 0 ? 'red' : this.state.rateChange > 0 ? 'green' : 'black'
    }

    let thStyle = {
      width: '33%'
    }

    const data = this.state.data;
    const generateCurrencyList = Object.keys(data).map(function(key, index) {
      const date = data[index].Dt;
      const currency = data[index].CcyAmt[1].Ccy;
      const rate = data[index].CcyAmt[1].Amt;
      return (
        <tr key={index}>
          <th style={thStyle}>{date}</th>
          <th style={thStyle}>{currency}</th>
          <th style={thStyle}>{rate}</th>
        </tr>
      )
    });

    return (
      <div className="App">
        <div className="navigationPanel" style={navigationStyle}>
          <form>
            <select
              name="currencies"
              onChange={this._handleCurrencyChange}
            >
              EUR TO
              <option value="USD">USD</option>
              <option value="CAD">CAD</option>
              <option value="SEK">SEK</option>
              <option value="NOK">NOK</option>
            </select>
          </form>
          <input
            type="date"
            name="date-from"
            onChange={this._handleDateFromChange}
            value={this.state.dtFrom}
            min="2014-09-30"
            max={this.state.today}
          />
          <input
            type="date"
            name="date-to"
            onChange={this._handleDateToChange}
            value={this.state.dtTo}
            min="2014-09-30"
            max={this.state.today}
          />
          <button onClick={this.fetchData}>Get currency rates</button>
        </div>
        {this.state.data != '' && this.state.loading == false ? <div className="currencyList">
        <table style={{margin: '0 auto'}}>
          <tbody>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Currency</th>
              <th style={thStyle}>Rate EUR/your currency</th>
            </tr>
            {generateCurrencyList}
            <tr>
              <td colSpan="5" style={rateChangeStyle}>
              Rate change: {this.state.rateChange}
              </td>
            </tr>
          </tbody>
        </table>
        </div> :
        this.state.loading == true ? <div style={{width: '200px', margin: '0 auto', textAlign: 'center'}}>Loading...</div>
        : null
        }
      </div>
    );
  }
}

export default App;
