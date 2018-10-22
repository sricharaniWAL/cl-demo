import React, { Component } from 'react';
import bannerImg from '../images/news-banner.jpg';
import logoImg from '../images/logo.png';
import styles from './Banner.css';


export default class Banner extends Component {
  render() {
    return (
      <div className={styles.bannerContainer}>
      <header>
          <img src={logoImg} width="100px" height="100px" />
          <h3 className={styles.heading}>News Client</h3>
      </header>
          {
            navigator.onLine ? null :
            <h3 className={styles.offline}>you are currently offline, some functionalities may not work</h3>
          }
        <img src={bannerImg} width="100%" />
      </div>
    )
  }
}
