#include <eosio/eosio.hpp>
#include <eosio/print.hpp>
#include <eosio/crypto.hpp>
#include <eosio/transaction.hpp>
#include <eosio/time.hpp>
#include <eosio/system.hpp>
#include <eosio/asset.hpp>
#include<cmath>

using namespace eosio;

class [[eosio::contract]] randomgame : public contract {
  private:
    uint64_t minJoinExpireTime = 120; //2 minutes
    uint64_t maxJoinExpireTime = 600; //2 minutes
    uint64_t minCommitExpireTime = 10; //10 second
    uint64_t minNumberOfPlayers = 1;
    uint64_t minFee = 10000; // 10000 network unit
    std::string tokenName = "EOS";
    uint64_t scale = 4;

    struct [[eosio::table]] player {
      uint64_t playerId;
      name user;
      uint64_t gameId;
      checksum256 hash;
      uint8_t isCommit = 0; //0: haven't commit, //1: have commited, //2: lost turn //3 have revealed
      uint8_t isWin = 0; //0: lose, 1: win and received reward 
      std::string secret;
      uint8_t numberPredict;
      uint64_t primary_key() const { return playerId;}
      uint64_t get_gameId() const { return gameId;}
      uint64_t get_player() const { return user.value; }      
      typedef eosio::multi_index<"people"_n, player, indexed_by<"bygameid"_n, const_mem_fun<player, uint64_t, &player::get_gameId>>,
      indexed_by<"byplayer"_n, const_mem_fun<player, uint64_t, &player::get_player>>> player_index;
    };

    struct [[eosio::table]] game {
      uint64_t id;
      name admin;
      uint8_t result=7; // 7: haven't finished
      uint64_t numberPlayers;
      std::string blockHash;
      uint64_t feeJoin;
      uint32_t priceRatio; //requrie > 0;
      uint32_t startCommitTime;
      uint32_t createdAt;
      uint64_t expireCommitTime; // 10 seconds
      uint64_t expireJoinTime; //2 minutes
      uint64_t state = 0; // 0: active, 1: commit turn, 2: reveal turn, 3: have result, 4: finish
      checksum256 activeKeyHash;
      std::string activeKey;

      uint64_t primary_key() const { return id;}
      uint64_t get_state() const { return state;}
      uint64_t get_author() const { return admin.value; };
      typedef eosio::multi_index<"games"_n, game, indexed_by<"bystate"_n, const_mem_fun<game, uint64_t, &game::get_state>>> game_index;
    };

    std::string to_hex(const checksum256 &hashed) {
      std::string result;
      const char *hex_chars = "0123456789abcdef";
      const auto bytes = hashed.extract_as_byte_array();
      for (uint32_t i = 0; i < bytes.size(); ++i) {
        (result += hex_chars[(bytes.at(i) >> 4)]) += hex_chars[(bytes.at(i) & 0x0f)];
      }
      return result;
    }

    uint8_t to_number(const std::string str) {
      char *a = new char[str.length() + 1];
      strcpy(a, str.c_str());
      switch (a[0])
      {
        case '1': 
          return 1;
        case '2': 
          return 2;
        case '3': 
          return 3;
        case '4': 
          return 4;
        case '5': 
          return 5;
        case '6': 
          return 6;    
        default:
          return 0;
      }
    }

    char * to_char(std::string secret) {
      char cstr[secret.size() + 1];
	    strcpy(cstr, secret.c_str());
      return cstr;
    }

    uint8_t calculate(std::string total) {
      checksum256 convert;
      uint64_t result = 0;
      convert = sha256(to_char(total), total.length());
      const auto bytes = convert.extract_as_byte_array();
      for (uint32_t i = 0; i < bytes.size(); ++i) {
        result += bytes[i];
      }
      return result%6 + 1;
    }    
    
    void updateStateGame(uint64_t gameId, uint64_t state) {
      game::game_index games(get_self(), get_first_receiver().value);
      auto gameIterator = games.find(gameId);      
      if( gameIterator != games.end() ) {
        games.modify(gameIterator, get_self(), [&] (auto& row) {
          row.state = state;
        });
      } else {
        eosio::internal_use_do_not_use::eosio_assert( false, "game does not exist");
      }
    }

    uint64_t countPlayer(uint64_t gameId) {
      player::player_index players(get_self(), get_first_receiver().value);
      auto zip_index = players.get_index<name("bygameid")>();
      auto iterator = zip_index.find(gameId);
      uint64_t count = 0;
      while (iterator != zip_index.end()) {
        count++;
        iterator++;
      }
      return count;
    }

    void eraseGame(uint64_t gameId) {
      game::game_index games(get_self(), get_first_receiver().value);
      player::player_index players(get_self(), get_first_receiver().value);
      auto gameIterator = games.find(gameId);      
      if( gameIterator != games.end() ) {
        auto zip_index = players.get_index<name("bygameid")>();
        auto playerIterator = zip_index.find(gameId);   
        while (playerIterator != zip_index.end()) {
          zip_index.erase(playerIterator);
          playerIterator++;
        }
        games.erase(gameIterator);
      } else {
        eosio::internal_use_do_not_use::eosio_assert( false, "game does not exist");
      }      
    }

    void erasePlayer(uint64_t playerId) {
      player::player_index players(get_self(), get_first_receiver().value);
      auto playerIterator = players.find(playerId);      
      if( playerIterator != players.end() ) {
        players.erase(playerIterator);
      } else {
        eosio::internal_use_do_not_use::eosio_assert( false, "game does not exist");
      }
    }

    void send(name from, name to, std::string memo, uint64_t amount) {
      eosio::asset quantity = eosio::asset( amount, eosio::symbol(tokenName, scale) );
      action{
        permission_level{from, "active"_n},
        "eosio.token"_n,
        "transfer"_n,
        std::make_tuple(from, to, quantity, memo)
      }.send();
    }

    bool checkStateRegister(uint64_t gameId) {
      game::game_index games(get_self(), get_self().value);
      auto currentGame = games.get(gameId);
      if (currentGame.state == 0) {
        return true;
      } 
      return false;
    }

    bool checkSufficientPlayers(uint64_t gameId) {
      game::game_index games(get_self(), get_self().value);
      auto currentGame = games.get(gameId);
      uint64_t count = countPlayer(gameId);
      if (count < currentGame.numberPlayers) {
        return true;
      }
      return false;
    }

    bool checkUserUnRegistered(name user, uint64_t gameId) {
      game::game_index games(get_self(), get_self().value);
      auto currentGame = games.get(gameId);
      player::player_index players(get_self(), get_self().value);
      auto zip_index = players.get_index<name("bygameid")>();
      auto iterator = zip_index.find(gameId);
      while (iterator != zip_index.end()) {
        if (iterator->user == user) {
          return false;
        };
        iterator++;
      }
      return true;
    }

    void checkRegisterPlay(name user, uint64_t gameId) {
      eosio::internal_use_do_not_use::eosio_assert( is_account( user ), "user does not exist");
      check(checkStateRegister(gameId), "Game is not in registry state!");
      check(checkSufficientPlayers(gameId), "Number of players in game was sufficient!");
      check(checkUserUnRegistered(user, gameId), "This player has already registered");
      player::player_index players(get_self(), get_self().value);
      auto zip_index = players.get_index<name("bygameid")>();
      auto iterator = zip_index.find(gameId);
      uint64_t count = countPlayer(gameId);
      game::game_index games(get_self(), get_self().value);

      if( iterator != zip_index.end() ) {
        while (iterator != zip_index.end()) {
          check(iterator->user != user, "This player has already registered");
          iterator++;
	    	}
      }
      auto currentGame = games.get(gameId);
      check(count < currentGame.numberPlayers, "Number of players in game was sufficient");            
    }

    void refund(name user, uint64_t fee) {
      send(get_self(), user, "game_dice_refund", fee);
    }

    bool checkHash (std::string secret, checksum256 hash) {
      assert_sha256((secret.c_str()), secret.length(), hash);
      return true;
    }    
    void callJoin(name user, uint64_t gameId, uint64_t amount) {          
      player::player_index players(get_self(), get_self().value);
      game::game_index games(get_self(), get_self().value);
      auto currentGame = games.get(gameId);
      check(currentGame.feeJoin <= amount, "Amount is insufficient to join this game");
      checkRegisterPlay(user, gameId);
      players.emplace(get_self(), [&] (auto& row) {
        row.playerId = players.available_primary_key();
        row.gameId = gameId;
        row.user = user;
      });
    }

    bool is_number(const std::string& s) {
      return !s.empty() && std::find_if(s.begin(), 
          s.end(), [](char c) { return !std::isdigit(c); }) == s.end();
    }

  public:
    using contract::contract;

    randomgame(name receiver, name code,  datastream<const char*> ds): contract(receiver, code, ds) {}

    // params user
    // params numberOfPlayers: init game with specify number of players
    // params activeKeyHash: key active game will be used to caculate random number
    // admin game submit activeKeyHash to active game, concurrently open commit turn.
    // time
    [[eosio::action]]
    void init( name user, uint64_t numberOfPlayers, checksum256 activeKeyHash, uint64_t feeJoin, uint64_t expireCommitTime, uint64_t expireJoinTime, uint32_t priceRatio ) {
      require_auth( user );
      check(expireCommitTime >= minCommitExpireTime, "Require expireCommitTime greater than or equal " + std::to_string(minCommitExpireTime));
      check(expireJoinTime >= minJoinExpireTime, "Require minJoinExpireTime greater than or equal " + std::to_string(minJoinExpireTime));
      check(expireJoinTime <= maxJoinExpireTime, "Require minJoinExpireTime greater than or equal " + std::to_string(minJoinExpireTime));
      check(numberOfPlayers >= minNumberOfPlayers, "Require numberOfPlayers greater than or equal " + std::to_string(minNumberOfPlayers));
      check(feeJoin >= minFee, "Require fee join greater than or equal " + std::to_string(minFee));
      check(priceRatio > 0, "Price ratio must be greater than 0");
      game::game_index games(get_self(), get_first_receiver().value);
      uint32_t a = current_time_point().sec_since_epoch();
      games.emplace(user, [&]( auto& row ) {
        row.id = games.available_primary_key();
        row.admin = user;
        row.numberPlayers = numberOfPlayers;
        row.activeKeyHash = activeKeyHash;
        row.feeJoin = feeJoin;
        row.expireCommitTime = expireCommitTime;
        row.expireJoinTime = expireJoinTime;
        row.priceRatio = priceRatio;
        row.createdAt = a;
      });
    }

    // check duration of active time
    // send token to game admin to join
    // add player 
    [[eosio::action]] 
    void pay( name user, uint64_t gameId) {
      require_auth(user);
      checkRegisterPlay(user, gameId);
      game::game_index games(get_self(), get_first_receiver().value);
      auto game = games.get(gameId);
      uint64_t fee = game.feeJoin;
      send(user, get_self(), std::to_string(gameId), fee);
    }

    [[eosio::on_notify("eosio.token::transfer")]]
    void deposit(name hodler, name to, eosio::asset quantity, std::string memo) {
      if (hodler == get_self() || to != get_self())
      {
        return;
      }

      if (is_number(memo) == false) {
        return;
      }
      check(quantity.amount > 0, "When pigs fly");
      check(quantity.symbol.code().to_string() == tokenName, "These are not the droids you are looking for.");
      uint64_t gameId = std::stoi(memo);
      callJoin(hodler, gameId, quantity.amount);
    }    

    [[eosio::action]]
    void join( name user, uint64_t gameId ) {
      require_auth(get_self());      
      // callJoin(user, gameId);
    }

    [[eosio::action]]
    void startcommit(uint64_t gameId) {
      player::player_index players(get_self(), get_first_receiver().value);
      game::game_index games(get_self(), get_first_receiver().value);
      uint64_t count = countPlayer(gameId);
      auto currentGame = games.get(gameId);
      check(currentGame.state == 0, "Only change state into commit if game is in join state!");
      check(count == currentGame.numberPlayers, "Only start commit if game has sufficient!");
      if (currentGame.numberPlayers == count) {
        uint32_t nowWithSeconds = current_time_point().sec_since_epoch();
        auto gameIterator = games.find(gameId);      
        if( gameIterator != games.end() ) {
          games.modify(gameIterator, get_self(), [&] (auto& row) {
            row.state = 1;
            row.startCommitTime = nowWithSeconds;
          });
        } else {
          eosio::internal_use_do_not_use::eosio_assert( false, "game does not exist");
        }
      }        
    }

    [[eosio::action]]
    void cancel(uint64_t gameId) {
      game::game_index games(get_self(), get_first_receiver().value);
      player::player_index players(get_self(), get_first_receiver().value);
      uint64_t count = countPlayer(gameId);
      auto currentGame = games.get(gameId);
      check(currentGame.state == 0, "Cannot cancel game if it not in join state!");
      check(count == currentGame.numberPlayers, "Only cancel game if game has insufficient player!");
      check(currentGame.createdAt + currentGame.expireJoinTime < current_time_point().sec_since_epoch(), "Could not cancel before expire join time");

      auto zip_index = players.get_index<name("bygameid")>();
      auto currentPlayer = zip_index.find(gameId);
      while (currentPlayer != zip_index.end()) {
        refund(currentPlayer->user, currentGame.feeJoin);
        currentPlayer++;
      }              
      updateStateGame(gameId, 4);
    }

    [[eosio::action]]
    void erasegame(uint64_t gameId) {
      game::game_index games(get_self(), get_first_receiver().value);

      auto gameIterator = games.find(gameId);      
      if( gameIterator != games.end() ) {
        games.erase(gameIterator);
      } else {
        eosio::internal_use_do_not_use::eosio_assert( false, "game does not exist");
      }
    }

    [[eosio::action]]
    void eraseplayer(uint64_t playerId) {
      player::player_index players(get_self(), get_first_receiver().value);
      game::game_index games(get_self(), get_first_receiver().value);      
      auto playerIterator = players.find(playerId);      
      if( playerIterator != players.end() ) {
        players.erase(playerIterator);
      } else {
        eosio::internal_use_do_not_use::eosio_assert( false, "player does not exist");
      }
    }

    [[eosio::action]]
    void commit(checksum256 hashSecret, uint64_t playerId) {
      game::game_index games(get_self(), get_first_receiver().value);
      player::player_index players(get_self(), get_first_receiver().value);
      auto currentPlayer = players.find(playerId);
      auto currentGame = games.get(currentPlayer->gameId);
      check(currentGame.state == 1, "Only change state to commit state from join state");
      check(currentPlayer->isCommit == 0, "This player has not commited!");
      check(currentPlayer != players.end(), "Dont find out this player");
      players.modify(currentPlayer, get_self(), [&] (auto& row) {
        row.hash = hashSecret;
        row.isCommit = 1;
      });
    }

    [[eosio::action]]
    void reveal ( uint64_t playerId, std::string secret) {
      game::game_index games(get_self(), get_first_receiver().value);
      player::player_index players(get_self(), get_first_receiver().value);
      auto currentPlayer = players.find(playerId);
      auto currentGame = games.get(currentPlayer->gameId);
      check(currentGame.state == 2, "Only change state to reveal state from commit state");
      check(currentPlayer->isCommit == 1, "This player hasnt commited!");
      check(checkHash(secret, currentPlayer->hash), "Invalid secret!");
      uint8_t value = to_number(secret.substr(0,1));
      players.modify(currentPlayer, get_self(), [&] (auto& row) {
        row.secret = secret;
        row.numberPredict = value;
        row.isCommit = 3;
      });
    }

    [[eosio::action]]
    void startreveal ( uint64_t gameId, std::string secretAdmin) {
      game::game_index games(get_self(), get_first_receiver().value);
      player::player_index players(get_self(), get_first_receiver().value);
      auto currentGame = games.get(gameId);
      check(currentGame.state == 1, "Game is not in commit turn");
      check(checkHash(secretAdmin, currentGame.activeKeyHash), "Invalid secret!");
      int prefixBlock = tapos_block_prefix(); //TODO
      std::string total = secretAdmin; 
      total = (total.append(std::to_string(prefixBlock)));
      check(currentGame.startCommitTime + currentGame.expireCommitTime < current_time_point().sec_since_epoch(), "Could not start reveal before expire commit time");
      auto zip_index = players.get_index<name("bygameid")>();
      auto iterator = zip_index.find(gameId);        
      while (iterator != zip_index.end()) {
        if (iterator->isCommit == 0) {
          zip_index.modify(iterator, get_self(), [&] (auto& row) {
            row.isCommit = 2;
          });
        } else {
          total.append(to_hex(iterator->hash));
        }
        iterator++;
      }      
      uint8_t re = calculate(total);
      auto gameIterator = games.find(gameId);      
      check(gameIterator != games.end(), "Game is not exist");
      games.modify(gameIterator, get_self(), [&] (auto& row) {
        row.state = 2;
        row.result = re;
        row.activeKey = secretAdmin;
        row.blockHash = std::to_string(prefixBlock);
      });
    }

    [[eosio::action]] 
    void endgame(uint64_t gameId) {
      game::game_index games(get_self(), get_first_receiver().value);
      player::player_index players(get_self(), get_first_receiver().value);
      auto currentGame = games.get(gameId);
      check(currentGame.state == 2, "Only end game if state is reveal");
      auto zip_index = players.get_index<name("bygameid")>();
      auto checkPlayer = zip_index.find(gameId);
      while (checkPlayer != zip_index.end()) {     
        check((checkPlayer->isCommit == 3 || checkPlayer->isCommit == 2), "Could not finished game if there is one or more player hasn't commited or revealed");
        checkPlayer++;
      }      
      auto playIterator = zip_index.find(gameId);
      while (playIterator != zip_index.end()) {     
        if (playIterator->numberPredict == currentGame.result && playIterator->isWin == 0) {
          send(get_self(), playIterator->user, "game_dice_reward", currentGame.feeJoin*currentGame.priceRatio/100 + currentGame.feeJoin);
          zip_index.modify(playIterator, get_self(), [&] (auto& row) {
            row.isWin = 1;
          });
        }
        playIterator++;
      }
      updateStateGame(gameId, 4);
    }
};