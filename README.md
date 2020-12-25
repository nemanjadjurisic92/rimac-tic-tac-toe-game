# Rimac Tic-Tac-Toe Game
The object of Tic Tac Toe is to get three in a row. You play on a three by three game board. The first player is known as X and the second is O. Players alternate placing Xs and Os on the game board until either oppent has three in a row or all nine squares are filled. X always goes first, and in the event that no one has three in a row, the stalemate is called a cat game.

## Running frontend
Frontend is under 'web' folder. At the start when you clone this project use under 'web' folder in command line 'npm install' to install Node Package Manager modules. This is Angular 10 project and to run this server use 'ng serve', navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Running backend
Backend is under 'api' folder. At the start when you clone this project use under 'api' folder in command line 'npm install' to install Node Package Manager modules. This is Node.js project and to run this server use 'npm run start', navigate to `http://localhost:4020/`. The app will automatically reload if you change any of the source files.

## Database
Database is Sqlite, and database will be automatically create when you run backend server.

## Description of the project
Frontend is Angular 10 framework, backend is Node.js and requests are through Graphql. Typescript was used in both projects. Typescript configurations for each project is in tsconfig.json files. For Graphql use path 'http://localhost:4020/graphql', 'ws://localhost:4020/' use for Graphql Subscriptions. In this project for Graphql was used Query, Mutation and Subscription. Type was created through GraphQLObjectType, all this logic is in 'schema.ts' which is exported and used in 'server.ts'. In Angular Graphql configurations is in 'graphql.module.ts' under 'src/app'. In this file was created two links one for Graphql one for Graphql subscriptions. All frontend logic and queries are in 'board.component.ts' under 'src/app/board/'. For both servers was used Apollo for connection in Graphql.