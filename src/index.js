const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
// 2 - resolvers objects is the actual implementation of the schema
const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: async (parent, args, context, info) => {
      return context.prisma.link.findMany()
    },
    link: (parent, args, context) => {
      const result = context.prisma.link.findUnique({
        where: {
          url: args.url
        }
      })
      return result
    }
  },
  Mutation: {
    post: (parent, args, context) => {
      const newLink = context.prisma.link.create({
        data: {
          url: args.url,
          description: args.description
        }
      })
      return newLink
    },
    deleteLink: (parent, args, context) => {
      const id = +args.id;
      const deletedLink = context.prisma.link.delete({
        where: {
          id
        }
      })
      return deletedLink
    },
    updateLink : (parent, args, context) => {
      const id = +args.id;
      const updatedLink = context.prisma.link.update({
        where: {
          id
        },
        data : {
          url: args.url,
          description: args.description
        }
      })
      return updatedLink
    }
  },
  Link: {
    id: (parent) => parent.id,
    description: (parent) => parent.description,
    url: (parent) => parent.url,
  }
}

// 3 - schema and resolvers are passed to the ApolloServer
const server = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8'
  ),
  resolvers,
  context: {
    prisma
  }
})

server
  .listen()
  .then(({ url }) =>
    console.log(`Server is running on ${url}`)
  );
