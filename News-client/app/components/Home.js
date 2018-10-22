// @flow
import React, { Component } from 'react';
import styles from './Home.css';
import axios from 'axios';
import { Box, SearchField, Toolbar } from 'react-desktop/macOs';
import { Route } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import classnames from 'classnames';
import { TabContent, TabPane, Nav, NavItem, NavLink, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { NewsList } from '../models';
import Banner from './Banner';
import readImg from '../images/double-checking.png';
 
export default class Home extends Component {
  constructor(Props) {
    super(Props);
    this.state = {
      activeTab: '1',
      result: '',
      modal: false,
      news: [],
      headlines: [],
      startDate: moment(),
      searchKeywords: "",
      clickedCountry : ""
    }
    this.toggle = this.toggle.bind(this);
    this.handleChangeDate = this.handleChangeDate.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getNews = this.getNews.bind(this);
    this.getHeadlines = this.getHeadlines.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
    if (this.state.activeTab === 2) {
    this.getNews();
    }
  }

  async toggleModal(index, news_url) {
    console.log(news_url)
    this.setState({
      modal: !this.state.modal,
      clickedCountry : index
    });
    
    try{
      if(news_url){
        const newsList = await NewsList.update(
          {readStatus: 1}, 
          {where: {news_url: news_url}}
        )
      }
    } catch(err){
      console.log('Update error')
      console.log(err)
    }
  }

  handleChangeDate(date) {
    let dateVal = date
    this.setState (
      (state) => ({
        startDate: dateVal,
      }), 
      () => {
        this.getNews()
      }
    )
  }

  handleSelectChange = (event) => {
    let selectVal = event.target.value
    this.setState (
      (state) => ({
        result: selectVal,
      }), 
      () => {
        this.getNews()
      }
    )
  }
  componentDidUpdate(){
    console.log(this.state)
    console.log('componentDidUpdate');

    // this.getNews();
  }

  handleOfflineSearch(){
    let filePath = path.join(__dirname, '../database.db')
    let sqlite3 = require('sqlite3').verbose();
  }

  handleChange(e) {
    console.log('HandleChange')
    console.log(e.target.value)
    let val = e.target.value;
    this.setState (
      (state) => ({
        searchKeywords: val,
      }), 
      () => {

        this.getNews()
      }
    )
  }
 

  // insertForOffline(article){

  // }

  async getNews() {
    let news_data;

    let keywords = this.state.searchKeywords
    let date;
    if(this.state.startDate){
      date = this.state.startDate.format("YYYY-MM-DD") ;
    }
    let sortResult = this.state.result
    console.log(date, 'date ***');
    let params = {
      
    };
    
    if(keywords) {
       params['q'] = keywords
    } 
    if (date) {
        params['from'] = date
    }
    if (sortResult) {
        params['sortBy'] = sortResult
    } 

    if(!navigator.onLine){
      news_data = await NewsList.findAll({
        attributes: ['author', 'source_name', 'image_url','title', 'news_url', 'created_date', 'readStatus'],
        where: {
          news_type: 'Regular-News',
        }
      })
      let formatted_data = news_data.map((data) => {
        return data.dataValues
      })
      let filterArr
      if (keywords.length !== 0 && date) {
        console.log('offline')
          filterArr = formatted_data.filter(element => {
              return element.title ? ((element.title.includes(keywords)) && (element.created_date === date  ) ? element : null) : null
          });
          this.setState({
            news: filterArr
          })
      }
       if(keywords.length === 0){
          this.setState ({
            news: []
          })
      }
      
    } else {

      axios.defaults.baseURL = 'https://newsapi.org/v2/everything';
      axios.defaults.headers.common['Authorization'] = 'e18bb330222541caab90fb31d7ed0547';
      axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
      axios({
        method: "GET",
        url: "https://newsapi.org/v2/everything",
        params: params,
      }).then((res) => {
        let data = res.data.articles.map((desc) => {
          let article={};
          article.author = desc.author;
          article.source_name = desc.source['name'];
          article.source_id = desc.source['id'];
          article.title = desc.title;
          article.image_url = desc.urlToImage;
          article.news_url = desc.url;
          article.created_date = desc.publishedAt.split("T")[0];
          article.news_type = 'Regular-News'
          NewsList.find({where: {source_id: article.source_id, title: article.title }}).then(function(d){
            if(!d){
              article.readStatus = 0;
              NewsList.create(article).then((createdData) => {
              console.log('createdData')
              })
            }
          })
          // if(!news_list){
          //   await NewsList.create(article)
          // }
          return article;
        })
        this.setState({
          news: data
        })
      }).catch((err) => {
        console.log(err)
      });
    }
    
  }

  async getHeadlines() {
    let headlines_data;
    if(!navigator.onLine){
      headlines_data = await NewsList.findAll({
        attributes: ['author', 'source_name', 'image_url','title', 'news_url', 'created_date', 'readStatus'],
        where: {news_type: 'headlines'}
      })
      let formatted_data = headlines_data.map((data) => {
        return data.dataValues
      })
      this.setState({
        headlines: formatted_data
      })
    }
    axios.defaults.baseURL = 'https://newsapi.org/v2/top-headlines';
    axios.defaults.headers.common['Authorization'] = 'e18bb330222541caab90fb31d7ed0547';
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    axios({
      method: "GET",
      url: "https://newsapi.org/v2/top-headlines",
      params: {
        country: "us"
      }
    }).then((res) => {
      
      let data = res.data.articles.map((desc, index) => {
        let article={};
        article.author = desc.author;
        article.source_name = desc.source['name'];
        article.source_id = desc.source['id']
        article.title = desc.title;
        article.image_url = desc.urlToImage;
        article.news_url = desc.url;
        article.created_date = desc.publishedAt.split("T")[0];
        article.news_type = "headlines";
        article.news_id = index + 1;
        NewsList.find({where: {source_id: article.source_id, title: article.title }}).then(function(d){
         if(!d){
           article.readStatus = 0;
            NewsList.create(article).then((createdData) => {
              console.log(createdData);
            })
         }
        })
        return article;
      })
      // NewsList.bulkCreate(data).then(function(){
      //   console.log('bulk insert completed')
      //   this.setState({
      //     headlines: data
      //   })
      // });
      this.setState({
       headlines: data
      })

    }).catch((err) => {
      console.log(err)
    });
  }


  clearSearch() {
    this.setState (
      (state) => ({
        searchKeywords: "",
        startDate: "",
        news : []
      }), 
    )
  }
  componentDidMount(){
    console.log('COmponentDidMount');
    this.getHeadlines();
  }

  
  
  render() {
    return (
      <div className={styles.container} data-tid="container">
      {/* {this.state.get ? this.getNews () : null} */}
      <Banner/>  
    <section className={styles.mainContainer}>   
     <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '1' })}
              onClick={() => { this.toggle('1'); }}
            >
              Headlines
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '2' })}
              onClick={() => { this.toggle('2'); }}
            >
              News
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="1">
             
              <ul className={styles.newsUL}>
               {
                  this.state.headlines.map((country, index) => {
                      return <li key={`country_${index}`}>
                      <section className={styles.newsWrapper}>
                          <div className={styles.headlinesContainer}>
                                <div className={styles.leftNewsPanel}>
                                  <p>
                                    {country.title}
                                    {country.readStatus ? 
                                    <img src={readImg} className={styles.readImage} />
                                    : null
                                    }
                                  </p>
                                  <p>
                                    <span>{country.author}</span> 
                                    {
                                      country.author ? 
                                      <span className={styles.seperator}>|</span>
                                      : null
                                    }

                                    <span>{country.source_name}</span> 
                                   
                                    <span className={styles.seperator}>|</span>
                                    
                                    <span>{country.created_date}</span>
                                  </p>
                                </div>
                                <div className={styles.rightImagePanel}>
                                  <img src={country.image_url} />
                                </div>
                            </div>
                            
                              <Button onClick={()=>this.toggleModal(index, country.news_url)} disabled={!navigator.onLine} {...!navigator.onLine && {'title' : 'you are offline'}}> Read More</Button> 
                              
                          <Modal size="lg" isOpen={this.state.modal && this.state.clickedCountry == index} toggle={()=>this.toggleModal(index)} className={styles.customModal}>
                            <ModalHeader toggle={()=>this.toggleModal(index)}></ModalHeader>
                            <ModalBody>
                            <div style={{width:100 + '%', height:100 + '%'}}>
                                <webview id="foo" src={country.news_url} autosize="on" style={{minWidth:100 + '%', minHeight:90 + 'vh'}}></webview>
                            </div>
                            </ModalBody>
                            <ModalFooter>
                              <Button color="secondary" onClick={()=>this.toggleModal(index)}>Cancel</Button>
                            </ModalFooter>
                          </Modal>
                      </section>
                      </li>
                })
              }
        </ul>
          </TabPane>
          <TabPane tabId="2">
             <section className={styles.navwrapper}>
               
                <div className={styles.searchContainer}>
                  <input type="text" placeholder="Search" value={this.state.searchKeywords} onChange={this.handleChange} />
                  <span className={styles.closeButton} onClick={this.clearSearch}>x</span>
                </div>
                <DatePicker
                  dateFormat="YYYY-MM-DD"
                  selected={this.state.startDate}
                  onChange={this.handleChangeDate}
                />
                  <select value={this.state.result} onChange={this.handleSelectChange} disabled={!navigator.onLine} {...!navigator.onLine && {'title' : 'you are offline'}}>
                    <option value="relevancy">Most relevant</option>
                    <option value="publishedAt">Most recent</option>
                    <option value="popularity">Most popular</option> 
                  </select> 
              </section>
              {this.state.news.length > 0 ?
                  <ul className={styles.newsUL}>
                  {
                    this.state.news.map((country, index) => {
                          return <li key={`country_${index}`}>
                          <section className={styles.newsWrapper}>
                              <div className={styles.headlinesContainer}>
                                    <div className={styles.leftNewsPanel}>
                                      <p>
                                        {country.title}
                                      </p>
                                      <p>
                                        <span>{country.author}</span> 
                                        {
                                          country.author ? 
                                          <span className={styles.seperator}>|</span>
                                          : null
                                        }
                                        <span>{country.source_name}</span>
                                        <span className={styles.seperator}>|</span>
                                        <span>{country.created_date}</span>
                                      </p>
                                    </div>
                                    <div className={styles.rightImagePanel}>
                                      <img src={country.image_url} />
                                    </div>
                                </div>
                                <Button onClick={()=>this.toggleModal(index, country.news_url)} disabled={!navigator.onLine} {...!navigator.onLine && {'title' : 'you are offline'}}>Read More</Button> 
                               
                                <Modal size="lg" isOpen={this.state.modal && this.state.clickedCountry == index} toggle={()=>this.toggleModal(index)} className={styles.customModal}>
                                  <ModalHeader toggle={()=>this.toggleModal(index)}></ModalHeader>
                                  <ModalBody>
                                  <div style={{width:100 + '%', height:100 + '%'}}>
                                      <webview id="foo" src={country.news_url} autosize="on" style={{minWidth:100 + '%', minHeight:90 + 'vh'}}></webview>
                                  </div>
                                  </ModalBody>
                                  <ModalFooter>
                                    <Button color="secondary" onClick={()=>this.toggleModal(index)}>Cancel</Button>
                                  </ModalFooter>
                              </Modal>
                          </section>
                          </li>
                    })
                  }
                 </ul>
                 : 
                 <p className={styles.noContent}>Please search something to see News</p>}
              
          </TabPane>
        </TabContent>
       </section>
       
      </div>
    );
  }
}

