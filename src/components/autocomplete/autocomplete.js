import React from 'react';
import ReactDOM from "react-dom";
import styles from './autocomplete.css';
import searchLogo from './search.png';
import tapeLogo from './tape.png';
import backgroundImage from './background.jpg';


class Autocomplete extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            answer: [],
            selection: 0,
            selected: false
        };
        this.placeholder = 'Enter movie name';
        this.changed = this.changed.bind(this);
        this.navigate = this.navigate.bind(this);
        this.blur = this.blur.bind(this);
    }

    ajax(text){
        const url = 'https://api.themoviedb.org/3/search/movie?api_key=cab2afe8b43cf5386e374c47aeef4fca&language=en-US&query='+
            text+'&page=1&include_adult=false';
        fetch(url)
            .then(res => res.json())
            .then(result => {
                this.setState({answer: result['results'].filter((value, index) => index < 8),
                    selection: 0,
                    selected: false});
            });
    }

    changed(e) {
        console.log(this.state.answer);
        if(e.target.value.length >= 3){
            this.ajax(e.target.value)
        }else{
            this.setState({answer: [],
                selection: 0,
                selected: false});
        }
    }

    navigate(e){
        if(this.state.answer.length > 0) {
            if (e.key == 'ArrowUp') {
                if (this.state.selection === 0) {
                    this.setState({answer: this.state.answer, selection: this.state.answer.length, selected: false});
                } else {
                    this.setState({answer: this.state.answer, selection: this.state.selection - 1, selected: false});
                }
            } else if (e.key == 'ArrowDown') {
                if (this.state.selection === this.state.answer.length) {
                    this.setState({answer: this.state.answer, selection: 0, selected: false});
                } else {
                    this.setState({answer: this.state.answer, selection: this.state.selection + 1, selected: false});
                }
            } else if (e.key == 'Enter') {
                if(this.state.selection !== 0) {
                    this.clickSuggestion(this.state.answer[this.state.selection - 1]['title']);
                    e.stopPropagation();
                    e.target.blur();
                }else{
                    e.stopPropagation();
                    e.target.blur();
                }
            }else if(e.key == 'Escape'){
                this.setState({answer: this.state.answer, selection: 0, selected: true});
            }
        }
    }

    clickSuggestion(text){
        ReactDOM.findDOMNode(this).querySelector('#search').value = text;//I had problems with fast typing so I'd rather not invoke render()...
        this.setState({answer: this.state.answer,
            selection: this.state.selection,
            selected: true});
    }

    blur(e){
        let list = [...ReactDOM.findDOMNode(this).querySelectorAll('div[data-suggestion="true"]')];
        let success = false;
        for(let i = 0; i < this.state.answer.length; i++){
            if(list[i] == e.relatedTarget){
                success = true;
            }
        }
        if(!success) {
            this.setState({answer: this.state.answer, selection: 0, selected: true});
        }
    }

    render() {
        return (
            <div className={styles.father}>
                <div className={styles.container}>
                    <div className={styles.tape}><img src={tapeLogo} /></div>
                    <img src={searchLogo} className={styles.searchButton} />
                    <input onChange={this.changed} onKeyDown={this.navigate} onFocus={this.changed} autoComplete={"off"}
                           id='search' placeholder={this.placeholder} onBlur={this.blur}/>

                    <div className={styles.placeholder}>
                        <img src={tapeLogo} />
                        {this.placeholder}
                    </div>
                    {!this.state.selected?(
                        <div className={styles.suggestions}>
                            {this.state.answer.map((val, id) =>
                                <div className={(this.state.selection === (id+1))?styles.focused:''}
                                     onClick={() => this.clickSuggestion(val.title)} tabIndex='-1'
                                        data-title={val.title} data-suggestion="true">
                                    {val.title}<br />
                                    <span className={styles.additionalInfo}>
                                        {val.vote_average} Rating, {val.release_date.split('-')[0]}
                                    </span>
                                </div>
                            )}
                        </div>
                    ):''}
                </div>
            </div>
        )
    }
}

export default Autocomplete;
