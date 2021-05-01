const { ApolloServer, PubSub } = require('apollo-server');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { getUserId } = require('./utils');
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const User = require('./resolvers/User')
const Link = require('./resolvers/Link')
const Subscription = require('./resolvers/Subscription')

const prisma = new PrismaClient();
// 2 - resolvers objects is the actual implementation of the schema
const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Link
}

const pubsub = new PubSub()
// 3 - schema and resolvers are passed to the ApolloServer
const server = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8'
  ),
  resolvers,
  context: ({ req }) => {
    return {
      ...req,
      prisma,
      pubsub,
      userId:
        req && req.headers.authorization
          ? getUserId(req)
          : null
    };
  }
});

server
  .listen()
  .then(({ url }) =>
    console.log(`Server is running on ${url}`)
  );
