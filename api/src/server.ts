import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import http from 'http'
import schema from './schema'
const server = new ApolloServer({ 
    schema,
    subscriptions: {
       onConnect: () => console.log('Connected to websocket'),
     },
   });

const app = express();
server.applyMiddleware({ app });
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(4020, () => {
 console.log(`Server ready at http://localhost:${4020}${server.graphqlPath}`)
 console.log(`Subscriptions ready at ws://localhost:${4020}${server.subscriptionsPath}`)
})