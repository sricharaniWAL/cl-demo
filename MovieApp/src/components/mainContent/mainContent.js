import React, { Component } from 'react'
import { TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';
import classnames from 'classnames';
import { tabContents } from './tabContents'

class MainContent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0
        };
        this.toggle = this.toggle.bind(this);
    }

    toggle (tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    componentDidMount(){
        this.toggle(1)
    }

    render() {
        return (
            <div className='main-content-section'>
                <div className='sidebar-section'>
                    <Nav tabs>
                        {tabContents.map((e,key) => {
                            return <NavItem key={key}>
                                    <NavLink
                                        className={classnames({ active: this.state.activeTab === e.index })}
                                        onClick={() => {this.toggle(e.index)}}
                                    >
                                        <i className={e.icon}></i>
                                        <span>{e.title}</span>
                                    </NavLink>
                                </NavItem>
                            })
                        }
                    </Nav>
                </div>
                <div className="content-section">
                    <TabContent activeTab={this.state.activeTab}>
                        {tabContents.map((e, key) => {
                            return <TabPane key={key} tabId={e.index}>
                                    <e.component active={this.state.activeTab === e.index}/>
                                </TabPane>
                            })
                        }
                    </TabContent>
                </div>
            </div>
        )
    }
}

export default MainContent;