const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
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
    const { title, author, likes } = favouriteBlog;
    return { title, author, likes }
  } else return null;
  
}


module.exports = {
  dummy,
  totalLikes,
  findFavouriteBlog
}