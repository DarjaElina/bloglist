const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    user: '66856614f861569d0601cc95'
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    user: '66856614f861569d0601cc95'
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const getToken = async () => {
  const users = await usersInDb()
  const user = users[0]

  const getToken = await api
    .post('/api/login')
    .send({ username: user.username, password: 'sekret' })

  return getToken.body.token
}

const createBlogByAuthorizedUser = async () => {
  const validToken = await getToken()

  const newBlog = {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
  }

  const createdBlog = await api
    .post('/api/blogs')
    .send(newBlog)
    .set({ Authorization: `Bearer ${validToken}` })

  return createdBlog.body.id
}

module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb,
  getToken,
  createBlogByAuthorizedUser
}