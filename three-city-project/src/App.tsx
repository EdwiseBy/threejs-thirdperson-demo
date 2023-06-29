import React, { Component, ReactNode } from 'react';
import './App.less';
import MainPage from './page/mainPage/mainPage';
import { observer } from 'mobx-react';

@observer
class App extends Component {
  render(): ReactNode {
    return <div className="App">
      <MainPage></MainPage>
    </div>;
  }
}

export default App;