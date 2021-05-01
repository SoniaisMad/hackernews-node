function feed (parent, args, context, info) {
    const {userId} = context
    return context.prisma.link.findMany()
}

module.exports = {
    feed,
}