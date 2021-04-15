'use strict';

class Leaderboard extends React.Component {
  render() {
    // if (this.props.history !== undefined) {
      console.log(this.props.history);
      return (
        <ol>
            {this.props.history.map(user => (
              <li key={user.userName}>{user.userName} - {user.wins}</li>
            ))}
        </ol>
      );
    // } else {
    //   return(<ol></ol>);
    // }
  }
}