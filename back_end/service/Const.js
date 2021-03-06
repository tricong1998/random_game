const Const = {
  endPoint : 'http://127.0.0.1:8888',

  initAction : 'init',
  transferAction : 'transfer',
  revealAction : 'reveal',
  startRevealAction : 'startreveal',
  commitAction : 'commit',
  startCommitAction : 'startcommit',
  endGameAction : 'endgame',
  cancelAction : 'cancel',
  
  transferSmartContract : 'eosio.token',
  acticePermission : 'active',
  eosAccount: 'eosio',
  newAccountAction: 'newaccount',
  setCode: 'setcode',
  setAbi: 'setabi',
  buyRamAction: 'buyrambytes',
  delegateAction: 'delegatebw',
  
  gameTable : 'games',
  playerTable : 'people',
  stateSecondIndex : 'bystate',
  idColumn: 'byid',
  gameIdColumn: 'bygameid',
  playerColumn: 'byplayer',
  userColumn: 'byplayer',
  length: 12,
  typeRandomString: 'alphabetic',

  prefixGameSecret: 'secret_',
  prefixTokenPlayer: 'player_',
  prefixSecretPlayer: 'secret_player_',
  prefixPlayer: 'player_',


  gameJoinState: 0,
  gameCommitState: 1,
  gameRevealState: 2,
  gameHasFinish: 3,
  gameEndState: 4,
}

module.exports = Const;