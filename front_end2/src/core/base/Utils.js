const Utils = {
  qs: function (key) {
    key = key.replace(/[*+?^$.[]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    let match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  },
  standardizeGame: function(game) {
    switch (game.state) {
      case 0:
        game.state = 'Active';
        break;
      case 1:
        game.state = 'Commit Turn';
        break;
      case 2:
        game.state = 'Reveal Turn';
        break;
      case 3:
        game.state = 'Have result';
        break;     
      case 4:
        game.state = 'Finished';
        break;                                     
    }
    if (game.result === 7) {
      game.result = 'None'
    }
    if (typeof game.activeKeyHash === 'string' && game.activeKeyHash.length > 7) {
      game.activeKeyHash = `${game.activeKeyHash.substring(0,7)}...`
    }
    if (typeof game.activeKey === 'string' && game.activeKey.length > 7) {
      game.activeKey = `${game.activeKey.substring(0,7)}...`
    }         
    return game;
  },
  standardizePlayers: function(player) {
    switch (player.isCommit) {
      case 0:
        player.isCommit = 'Joined';
        break;
      case 1:
          player.isCommit = 'Commited';
        break;
      case 2:
          player.isCommit = 'Revealed';
        break;
      case 3:
          player.isCommit = 'Finished';
        break;                               
    }
    return player;
  }    
}

export default Utils;