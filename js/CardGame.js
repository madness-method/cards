'use strict';

class CardGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history:   [],
      userName:  '',
      userCards: '',
      cpuCards:  '',
      userScore: 0,
      cpuScore:  0,
      userWin:   0,
      summary:   '',
      error:     ' ',
    };
    this.apiBaseUrl      = 'http://localhost:9000/game';
    this.updateUserName  = this.updateUserName.bind(this);
    this.updateUserCards = this.updateUserCards.bind(this);
    this.handleSubmit    = this.handleSubmit.bind(this);
    this.cards = {
      2:  2,
      3:  3,
      4:  4,
      5:  5,
      6:  6,
      7:  7,
      8:  8,
      9:  9,
      10: 10,
      11: 'J',
      12: 'Q',
      13: 'K',
      14: 'A',
    };
    this.nonNumericValues = {
      'J': 11,
      'Q': 12,
      'K': 13,
      'A': 14,
    };
  }

  componentDidMount() {
    this.refreshLeaderboard();
  }

  render() {
    return (
      <div>
        <h3>Card Game</h3>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="user-name>">Name: </label>
          <input id="user-name" class="form-input" onChange={this.updateUserName} type="text"></input>
          
          <p>Valid cards include: 2 3 4 5 6 7 8 9 10 J Q K A</p>
          <label htmlFor="user-cards">Type your cards separated by spaces, then click "Play": </label><br />
          <input id="user-cards" class="form-input" onChange={this.updateUserCards} value={this.state.userCards} type="text"></input>
          
          <button>Play</button>
        </form>

        <p>Generated Hand: <span>{this.state.cpuCards}</span></p>
        
        <p id="error-message">{this.state.error}&nbsp;</p>

        <h4>Summary</h4>
        <p>Your score: {this.state.userScore}</p>
        <p>CPU score: {this.state.cpuScore}</p>

        <div id="leaderboard-wrapper">
          <h3>Leaderboard</h3>
          <Leaderboard history={this.state.history} />
        </div>
      </div>
    );
  }

  refreshLeaderboard() {
    fetch(this.apiBaseUrl + '/leaderboard')
      .then(response => response.json())
      .then(json => {
        this.setState({ history: json })
      }
    )
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.state.userName === '') {
      this.setState({ error: 'Please enter your name.' });

      return;
    }

    var userCardsArray = this.state.userCards.split(' ');
    var generatedCards = this.generateCards(userCardsArray);
    var cpuCardsArray  = generatedCards.split(' ');

    this.scoreGame(userCardsArray, cpuCardsArray);
  }

  generateCards(userCardsArray) {
    this.resetGame();

    var generatedCards  = '';
    var abortGeneration = false;

    for (var i = 0; i < userCardsArray.length; i++) {
      if (this.validateCard(userCardsArray[i])) {
        var randomCardId = Math.floor(Math.random() * (14 - 2) + 2);
        var card         = this.cards[randomCardId];
  
        generatedCards += ' ' + card;
      } else {
        abortGeneration = true;
      }
    }

    if (abortGeneration) {
      this.setState({error: 'Please ensure your cards are valid and separated by spaces.'});
      
      return;
    }

    generatedCards = generatedCards.trim();

    this.setState({ cpuCards: generatedCards });

    return generatedCards;
  }

  resetGame() {
    this.setState({ error:     ' ' });
    this.setState({ userWin:   0 });
    this.setState({ userScore: 0 });
    this.setState({ cpuScore:  0 });
  }

  validateCard(card) {
    let cardIsValidNumeric    = this.cardIsValidNumeric(card);
    let cardIsValidNonNumeric = card in this.nonNumericValues;

    if (cardIsValidNumeric || cardIsValidNonNumeric) {
      return true;
    }

    return false;
  }

  scoreGame(userCardsArray, cpuCardsArray) {
    var userTotal = 0;
    var cpuTotal  = 0;

    for (var i = 0; i < userCardsArray.length; i++) {
      var userCard = this.getCardValue(userCardsArray[i]);
      var cpuCard  = this.getCardValue(cpuCardsArray[i]);

      if (userCard > cpuCard) {
        userTotal++;
      } else {
        cpuTotal++;
      }
    }

    var userWin = (userTotal > cpuTotal) ? 1 : 0;

    this.setState({ userWin: 1 });
    this.setState({ userScore: userTotal });
    this.setState({ cpuScore: cpuTotal });

    this.persistOutcome(userTotal, userWin, cpuTotal);
  }

  getCardValue(card) {
    var value = 0;

    if (this.cardIsValidNumeric(card)) {
      value = card;  
    } else {
      value = this.nonNumericValues[card];
    }
    
    return value;
  }

  cardIsValidNumeric(card) {
    let cardIsValidNumeric = card in this.cards;

    return cardIsValidNumeric;
  }

  persistOutcome(userTotal, userWin, cpuTotal) {
    var payload = {
      userName:  this.state.userName,
      userScore: userTotal,
      userWin:   userWin,
      cpuScore:  cpuTotal,
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload }),
    };

    fetch(this.apiBaseUrl + '/save', requestOptions)
      .then(this.refreshLeaderboard());
  }

  updateUserName(event) {
    this.setState({ userName: event.target.value });
  }

  updateUserCards(event) {
    this.setState({ userCards: event.target.value });
  }
}
  