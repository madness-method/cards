'use strict';

class Leaderboard extends React.Component {
  render() {
    return (
      <ol>
          {this.props.history.map(user => (
            <li key={user.userName}>{user.userName} - {user.wins}</li>
          ))}
      </ol>
    );
  }
}