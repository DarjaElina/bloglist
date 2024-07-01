const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if (!blogs || blogs.length === 0) return null

  const total = blogs.reduce((accumulator, blog) => {
    return accumulator += blog.likes
  }, 0)

  return total
}

const findFavouriteBlog = (blogs) => {
  if (!blogs || blogs.length === 0) return null

  const max = blogs.reduce((accumulator, blog) => {
    return Math.max(accumulator, blog.likes)
  }, blogs[0].likes)

  const favouriteBlog = blogs.find(blog => blog.likes === max)

  if (favouriteBlog) {
    const { title, author, likes } = favouriteBlog
    return { title, author, likes }
  } else return null

}

const mostBlogs = (blogs) => {
  if (!blogs || blogs.length === 0) {
    return null
  }

  const sortedByAuthor = _.groupBy(blogs, 'author')

  const blogCounts = _.map(sortedByAuthor, (authorBlogs, author) => ({
    author: author,
    blogs: authorBlogs.length
  }))

  const authorWithMostBlogs = _.maxBy(blogCounts, 'blogs')

  return authorWithMostBlogs
}

const topLikes = (blogs) => {
  if (!blogs || blogs.length === 0) {
    return null
  }

  const sortedByAuthor = _.groupBy(blogs, 'author')

  const likeCounts = _.map(sortedByAuthor, (authorBlogs, author) => ({
    author: author,
    likes: _.sumBy(authorBlogs, 'likes')
  }))

  const authorWithMostLikes = _.maxBy(likeCounts, 'likes')

  return authorWithMostLikes
}





module.exports = {
  dummy,
  totalLikes,
  findFavouriteBlog,
  mostBlogs,
  topLikes
}