import React, { Component } from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import Selector from './components/Selector';
import Form from './components/Form';
import CategoryPicker from './components/CategoryPicker';
import RecipeSearchResults from './components/RecipeSearchResults';
import RecipeInstructions from './components/RecipeInstructions';

const Wrapper = styled.main`
    color: rgb(255,255,255);
    font-family: 'Lato', 'Helvetica Neue', sans-serif;
    height: 100vh;
    padding: 2em 1em;
    @media(min-width: 768px){
      padding: 2.5em 3em;
    }
`;

class App extends Component {
  constructor(props) {
    super(props);
    this.initialState = {
      timeOfDay: '',
      categories: ['beef', 'chicken', 'pasta', 'pork', 'seafood', 'vegetarian', 'vegan'],
      isSearched: false,
      isSearchError: null,
      isRecipeSelected: false,
      results: [],
      recipe: {},
      activeResult: 0,
      selectedCategory: ''
    };
    this.state = this.initialState;

    this.resetState = this.resetState.bind(this);
    this.setTimeOfDay = this.setTimeOfDay.bind(this);
    this.searchStringChangeHandler = this.searchStringChangeHandler.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.searchRecipes = this.searchRecipes.bind(this);
    this.searchRandomRecipe = this.searchRandomRecipe.bind(this);
    this.getRecipeInstructions = this.getRecipeInstructions.bind(this);
    this.categoryClickHandler = this.categoryClickHandler.bind(this);
    this.catRandomClickHandler = this.catRandomClickHandler.bind(this);
    this.denyRecipeHandler = this.denyRecipeHandler.bind(this);
    this.acceptRecipeHandler = this.acceptRecipeHandler.bind(this);

  }
  componentDidMount() {
    this.setTimeOfDay();
  }
  resetState() {
    this.setState({
      ...this.initialState
    });
  }
  setTimeOfDay() {
    const currentHour = (new Date()).getHours();
    const greeting = currentHour < 18 ?
      'Today' :
      'Tonight';

    this.setState({
      ...this.state,
      timeOfDay: greeting
    });
  }
  // Form input handlers
  searchStringChangeHandler(e) {
    console.log(e.target.value);
  }
  // Click handler
  categoryClickHandler(e) {
    e.stopPropagation();
    let { category } = e.target.dataset;
    if (!category) category = e.target.parentNode.dataset.category;
    // Set state on chosen category 
    if (!!category) {
      this.setState({
        ...this.state,
        isSearched: true,
        selectedCategory: category
      });
      // Set async request for recipe search
      window.setTimeout(this.searchRecipes, 1750);
    }
  }
  catRandomClickHandler(e) {
    e.stopPropagation();
    this.setState({
      ...this.state,
      isSearched: true,
      selectedCategory: 'random'
    });
    window.setTimeout(this.searchRandomRecipe, 1750);
  }
  // Async search recipes 
  searchRecipes() {
    const category = this.state.selectedCategory;
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
      .then(response => response.json())
      .then(data => {
        // Set state based on API response
        const { meals } = data;
        if (!meals.length) {
          // No results found
          this.setState({
            ...this.state,
            isSearchError: false,
            results: []
          });
        } else {
          // Return search state results
          this.setState({
            ...this.state,
            isSearchError: false,
            results: [...meals]
          })
        }
      }).catch(err => {
        // Error handling
        this.setState({
          ...this.state,
          isSearchError: true,
          results: []
        })
      })
  };
  searchRandomRecipe() {
    fetch(`https://www.themealdb.com/api/json/v1/1/random.php`)
      .then(response => response.json())
      .then(data => {
        // Set state based on API response
        const { meals } = data;
        if (!meals.length) {
          // No results found
          this.setState({
            ...this.state,
            isSearchError: false,
            results: []
          });
        } else {
          // Return search state results
          this.setState({
            ...this.state,
            isSearchError: false,
            results: [...meals]
          })
        }
      }).catch(err => {
        // Error handling
        this.setState({
          ...this.state,
          isSearchError: true,
          results: []
        })
      });
  }
  // Async get recipe instructions
  getRecipeInstructions() {
    const { activeResult, results } = this.state;
    const { idMeal } = results[activeResult];
    // Toggle recipe selected to 
    // render recipe instructions view
    this.setState({
      ...this.state,
      isRecipeSelected: true
    });

    if (!!idMeal) {
      const getRecipeURL = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`;
      fetch(getRecipeURL)
        .then(response => response.json())
        .then(data => {
          const { meals } = data;
          this.setState({
            ...this.state,
            recipe: meals[0]
          });
        })
        .catch(err => {
          console.log('error getting recipe instructions', err.message);
        });
    }
  }

  // Decision handlers
  // Swipe left/deny recipe in view
  denyRecipeHandler() {
    const { results, activeResult } = this.state;
    if (activeResult < results.length - 1) {
      const swipeContainer = document.querySelector('.swipeable');
      this.setState({
        ...this.state,
        activeResult: this.state.activeResult + 1
      })
      swipeContainer.classList.add('swipe--rejected');
    } else {
      console.log('limit reached!');
    }
  }
  // Swipe right/accept recipe in view
  acceptRecipeHandler() {
    setTimeout(this.getRecipeInstructions(), 1500);
    const swipeContainer = document.querySelector('.swipeable');
    swipeContainer.classList.add('swipe--accepted');
  }

  // Form submission handler
  submitHandler(e) {
    e.preventDefault();
  }
  render() {
    return (
      <Wrapper>
        <Header
          timeOfDay={this.state.timeOfDay}
          recipe={this.state.recipe}
        />
        <Selector
          isCatSelected={this.state.isSearched}
          isRecipeSelected={!!this.state.recipe.idMeal}
          selectedCategory={this.state.selectedCategory}
          reset={this.resetState}
        />
        <RecipeSearchResults
          isCategorySelected={this.state.isSearched}
          isRecipeSelected={!!this.state.recipe.idMeal}
          selectedCategory={this.state.selectedCategory}
          recipes={this.state.results}
          isError={this.state.isSearchError}
          activeResult={this.state.activeResult}
          randomClick={this.catRandomClickHandler}
          onDeny={this.denyRecipeHandler}
          onAccept={this.acceptRecipeHandler}
        />
        <RecipeInstructions
          isRecipeSelected={this.state.isRecipeSelected}
          instructions={this.state.recipe}
          reset={this.resetState}
        />
        <CategoryPicker
          isSelected={this.state.isSearched}
          choices={this.state.categories}
          categoryClick={this.categoryClickHandler}
          randomClick={this.catRandomClickHandler}
        />
        {/* <Form
          timeOfDay={this.state.timeOfDay}
          onSearchStringChange={this.searchStringChangeHandler}
          submitHandler={this.submitHandler}
          submitted={this.state}
        /> */}
      </Wrapper>
    );
  }
};

export default App;