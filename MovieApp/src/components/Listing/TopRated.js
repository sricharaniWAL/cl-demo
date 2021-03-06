import React, { Component } from 'react'
import { 
    Card, CardImg, CardText, CardBody,
    CardTitle, Row, Col 
} from 'reactstrap'; 
import { apiKey } from '../../config/config'
import axiosInstance from '../axiosInstance'
import { Redirect } from 'react-router-dom'
import { Pagination } from 'react-materialize'

class TopRated extends Component {
    constructor (props) {
        super (props)
        this.state = {
            topRated : [],
            page : 1,
            totalPages : 1,
            movieDetail : false,
            movieId : 0,
            setPage : false
        }
        this.setPage = this.setPage.bind(this)                
    }
    componentDidUpdate (prevProps, prevStates) {
        if(prevProps.active !== this.props.active
            && this.props.active){
            this.getTopratedMovies ()
        }
    }
    setMovieDetail (e) {
        this.setState ({
            movieDetail : true,
            movieId : e
        })
    }
    setPage (e) {
        this.setState ({
            page : e,
            setPage : true
        })
    }
    getTopratedMovies () {
        axiosInstance ({
            method : 'GET',
            url : `movie/top_rated?api_key=${apiKey}&page=${this.state.page}`
        })
        .then(res => {
            console.log(res.data)
            this.setState ({
                topRated : res.data.results,
                page : res.data.page,
                totalPages : res.data.total_pages,
                setPage : false
            })
        })
        .catch(error => {
            console.log(error)
        })
    }
    render () {
        return (
            <div className="container-fluid">
                {this.state.setPage ? this.getTopratedMovies() : null}
                <h1>Top Rated Movies</h1>
                {this.state.topRated.length > 0 ? 
                    <div className="movies-wrapper">
                        <Row>
                            {this.state.topRated.map((e, key) => {
                                return <Col sm="12" md="4" lg="3" key = {key} >
                                    <Card onClick = {() => this.setMovieDetail(e.id)}>
                                            <CardImg top width="100px" src={`https://image.tmdb.org/t/p/w500/${e.poster_path}`} alt={e.title} />
                                            <CardBody>
                                                <CardTitle>{e.title}</CardTitle>
                                                <CardText >{e.overview}</CardText>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                })
                            }
                        </Row>
                    </div>
                : <p>No Records</p>}
                {this.state.movieDetail ? <Redirect push to={{pathname:`/movie/${this.state.movieId}`, state : {id : this.state.movieId}}}/> : null }
                <div>
                    <Pagination className = "pagination" item = {this.state.totalPages} activePage = {this.state.page} maxButtons = {20} onSelect = {this.setPage}/>
                </div>
            </div>
        )
    }
}

export default TopRated;
