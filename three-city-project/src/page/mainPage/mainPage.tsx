//@ts-nocheck
import React, { Component, ReactNode } from "react";
import { observer } from "mobx-react";
import { MainScene } from "../../game/mainScene";
import store from "../../store";
import './mainPage.less';

@observer
class MainPage extends Component {

    game: MainScene;
    componentDidMount() {
        if (!this.game)
            this.game = new MainScene(this.container);
    }

    componentWillUnmount(): void {
        if (this.game) {
            this.game.destroy();
            this.game = null;
        }
    }


    render(): ReactNode {
        const { curLabel } = store;
        return (
            <div className="mainPage" ref={ref => this.container = ref}>
                <div className='testDiv'>{curLabel}</div>
            </div >
        );
    }
}

export default MainPage;