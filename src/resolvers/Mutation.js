const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

async function signup(parent, args, context, info) {
    // 1
    const hashedPassword = await bcrypt.hash(args.password, 10)
    // 2
    const {password, ...user} = await context.prisma.user.create({
        data: {
            ...args,
            password: hashedPassword
        },
    })
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
    const {password, ...user} = await context.prisma.user.findOne({
        where: {
            username: args.username
        }
    })
    if (!user) {
      throw new Error('No User found with that username')
    }
  
    // 2
    const valid = await bcrypt.compare(args.password, password)
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

function createPost(parent, args, context, info) {
    const userId = getUserId(context)
    return context.prisma.post.create({
        data: {
            content: args.content,
            attatchment_url: args.attatchment_url,
            author: { connect: { id: userId } },
        }
    })
}     

function updatePost(parent, args, context, info) {
    const userId = getUserId(context)
    return context.prisma.post.update({
        where: {
            id: parseInt(args.post_id),
        },
        data: {
            content: args.content,
            attatchment_url: args.attatchment_url,
            author: { connect: { id: userId } },
        }
    })
}

function deletePost(parent, args, context, info) {
    const userId = getUserId(context)
    return context.prisma.post.delete({
        where: {
            id: parseInt(args.post_id),
        }
    })
}

function createComment(parent, args, context, info) {
    const userId = getUserId(context)
    console.log(userId)
    return context.prisma.comment.create({
        data: {
            content: args.content,
            author: { connect: { id: userId } },
            post: { connect: { id: args.post_id } }
        }
    })
}    

function deleteComment(parent, args, context, info) {
    const userId = getUserId(context)
    return context.prisma.comment.delete({
        where: {
            id: parseInt(args.comment_id),
        }
    })
}

function createPostClap(parent, args, context, info) {
    const userId = getUserId(context)
    return context.prisma.post_Clap.create({
        data: {
            author: { connect: { id: userId } },
            post: { connect: { id: args.post_id } }
        }
    })
}

function deletePostClap(parent, args, context, info) {
    const userId = getUserId(context)
    return context.prisma.post_Clap.delete({
        where: {
            id: parseInt(args.post_clap_id),
        }
    })
}

function createPostTag(parent, args, context, info) {
    const userId = getUserId(context)
    return context.prisma.post_Tag.create({
        data: {
            post: { connect: { id: args.post_id } },
            tag: { connect: { id: args.tag_id } }
        }
    })
}

function createTag(parent, args, context, info) {
    const userId = getUserId(context)
    return context.prisma.tag.create({
        data: {
            tag: args.tag
        }
    })
}

module.exports = {
    signup,
    login,
    createPost,
    updatePost,
    deletePost,
    createComment,
    deleteComment,
    createPostClap,
    deletePostClap,
    createPostTag,
    createTag
}