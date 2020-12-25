import { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLList, GraphQLID, GraphQLInt } from 'graphql';
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('database.db');
import { PubSub } from 'graphql-subscriptions';
const pubsub = new PubSub();

db.run('CREATE TABLE IF NOT EXISTS games ( id PRIMARY_KEY INT, winner STRING, name STRING, squares STRING, type STRING)', function (err) {
  if (err) {
    return console.error(err.message);
  }
});

function get(sql: string, single: boolean) {
  return new Promise((resolve, reject) => {
    var callback = (err: any, result: any) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    };

    if (single) db.get(sql, callback);
    else db.all(sql, callback);
  });
}

function insert(sql: string) {
  return new Promise((resolve, reject) => {
    var callback = (err: any, result: any) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    };

    db.run(sql, callback);
  });
}

const GameType = new GraphQLObjectType({
  name: "Game",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    winner: { type: GraphQLString },
    squares: { type: GraphQLString },
    type: { type: GraphQLString },
    update: { type: GraphQLInt }
  })
});

const Query = new GraphQLObjectType({
  name: "Query",
  fields: {
    games: {
      type: new GraphQLList(GameType),
      args: {
        id: { type: GraphQLID },
        winner: { type: GraphQLString },
        name: { type: GraphQLString },
        squares: { type: GraphQLString },
        type: { type: GraphQLString }
      },
      resolve(parent, args) {
        return get(
          `SELECT * FROM games`,
          false
        );
      }
    },
    getGame: {
      type: new GraphQLList(GameType),
      args: {
        id: { type: GraphQLID },
        winner: { type: GraphQLString },
        name: { type: GraphQLString },
        squares: { type: GraphQLString },
        type: { type: GraphQLString }
      },
      resolve(parent, args) {
        return get(
          `SELECT * FROM games WHERE id=${args.id} LIMIT 1`,
          true
        );
      }
    }
  }
});
const GAME_CHANGED = 'GAME_CHANGED';

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    game: {
      type: GameType,
      args: {
        id: { type: GraphQLID },
        winner: { type: GraphQLString },
        name: { type: GraphQLString },
        squares: { type: GraphQLString },
        type: { type: GraphQLString },
        update: { type: GraphQLInt }
      },
      resolve(parent, args, context, info) {
        const newGame = {
          id: args.id,
          name: args.name,
          winner: args.winner,
          squares: args.squares,
          type: args.type
        };
        pubsub.publish(GAME_CHANGED, {gameChanged: newGame});

        if (args.update == 0) {
          insert(
            `INSERT INTO games (id, winner, name, squares, type) VALUES (${args.id}, '${args.winner}', '${args.name}', '${args.squares}', '${args.type}')`
          );
          return newGame
        } else {
           insert(
            `UPDATE games SET winner='${args.winner}', name='${args.name}', squares='${args.squares}' WHERE id=${args.id}`
          );
          return newGame
        }

      }
    }
  }
});
const Subscription = new GraphQLObjectType({
  name: "Subscription",
  fields: {
    gameChanged: {
      type: GameType,
      args: {
        id: { type: GraphQLID },
        winner: { type: GraphQLString },
        name: { type: GraphQLString },
        squares: { type: GraphQLString },
        type: { type: GraphQLString },
        update: { type: GraphQLInt }
      },
      subscribe(){
        return pubsub.asyncIterator(GAME_CHANGED)
      }
    }
  }
});

export default new GraphQLSchema({
  query: Query,
  mutation: Mutation,
  subscription: Subscription
});
