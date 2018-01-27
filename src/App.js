import React, { Component } from 'react';
import {clients} from './badgeforce-utils';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.test = this.test.bind(this);
    this.test();
  }
  async test() {
    try {
      // this is the address of your deployed Holder smart contract
    const contractAddress = "0xc89ce4735882c9f0f0fe26686c53074e09b0d550";
    // Holder object instantiated with the data of a Holder smart contract deployed at contractAddress
    const holder = await clients.holder.getInstance(contractAddress);
    const info = await holder.getHolderInfo();
    console.log(info);
    } catch (e) {
      console.log(e);
    }
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
