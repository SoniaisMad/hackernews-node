const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

async function post(parent, args, context, info) {
    const { userId } = context;

    if (userId === null) {
      throw new Error('User Not authenticated');
    }
  
    const newLink = await context.prisma.link.create({
      data: {
        url: args.url,
        description: args.description,
        postedBy: { connect: { id: userId } },
      }
    })

    //pub sub
    context.pubsub.publish("NEW_LINK", newLink)
    
    return newLink
}

async function deleteLink(parent, args, context){
  const { userId } = context;

    if (userId === null) {
      throw new Error('User Not authenticated');
    }
  
    const id = +args.id;
    const deletedLink = context.prisma.link.delete({
        where: {
        id
        }
    })
    return deletedLink
}

async function updateLink(parent, args, context){
  const { userId } = context;

  if (userId === null) {
    throw new Error('User Not authenticated');
  }

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

async function signup(parent, args, context, info) {
    // 1
    const password = await bcrypt.hash(args.password, 10)
  
    // 2
    const user = await context.prisma.user.create({ data: { ...args, password } })
  
    // 3
    const token = jwt.sign({ userId: user.id }, APP_SECRET)
  
    // 4
    return {
      token,
      user,
    }
  }
  
  async function login(parent, args, context, info) {
    // 1
    const user = await context.prisma.user.findUnique({ where: { email: args.email } })
    if (!user) {
      throw new Error('No such user found')
    }
  
    // 2
    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }
  
    const token = jwt.sign({ userId: user.id }, APP_SECRET)
  
    // 3
    return {
      token,
      user,
    }
  }
  
  module.exports = {
    signup,
    login,
    post,
    updateLink,
    deleteLink
  }