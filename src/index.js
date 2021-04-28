const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const { KnownArgumentNamesOnDirectivesRule } = require('graphql/validation/rules/KnownArgumentNamesRule');
const path = require('path');

let links = [{
  id: 'link-0',
  url: 'www.howtographql.com',
  description: 'Fullstack tutorial for GraphQL'
},
{
  id: 'link-1',
  url: 'www.website.com',
  description: 'website tutorial'
}]
let idCount = links.length;
// 2 - resolvers objects is the actual implementation of the schema
const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: () => links,
    link: (parent, args) => {
      const result = links.find(o => o.id === args.id)
      return result
    }
  },
  Mutation: {
    post: (parent, args) => {
      const link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url
      }
      links.push(link)
      return link
    },
    deleteLink: (parent, args) => {
      let link;
      links = links.filter(o => {
        if(o.id === args.id){
          link = o
        }
        return o.id !== args.id
      })
      return link
    },
    updateLink : (parent, args) => {
      const foundIndex = links.findIndex(o => o.id === args.id)
      links[foundIndex] = {
        id: args.id,
        description: args.description,
        url: args.url
      }

      return links[foundIndex]
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
})

server
  .listen()
  .then(({ url }) =>
    console.log(`Server is running on ${url}`)
  );
