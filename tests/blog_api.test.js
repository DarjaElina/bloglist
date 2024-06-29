const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')


beforeEach(async () => {
  await Blog.deleteMany({})
  
  const blogObj = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObj.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('all notes are returned as json', async () => {
  const response = await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('unique identifier is named id', async () => {
  const response = await api.get('/api/blogs')

  const blogs = response.body

  blogs.forEach(blog => {
    assert(blog.hasOwnProperty('id')),
    assert(!blog.hasOwnProperty('_id'))
  })
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(b => b.title)
  assert(titles.includes('Type wars'))
})


test('likes prop is set to zero if missing', async () => {
  const newBlog = {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
  }

  await api
  .post('/api/blogs')
  .send(newBlog)
  .expect(201)
  .expect('Content-Type', /application\/json/)

  const blogs = await helper.blogsInDb()

  const likes = blogs.map(b => b.likes)

  assert.strictEqual(likes[likes.length - 1], 0)
})

test('blog with no url is responded with 400 Bad Request', async () => {
  const blogWithNoUrl = {
    title: "Type wars",
    author: "Robert C. Martin",
  }

  await api
    .post('/api/blogs/')
    .send(blogWithNoUrl)
    .expect(400)

})

test('blog with no title is responded with 400 Bad Request', async () => {
  const blogWithNoTitle = {
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    author: "Robert C. Martin",
  }

  await api
    .post('/api/blogs/')
    .send(blogWithNoTitle)
    .expect(400)

})


after(async () => {
  await mongoose.connection.close()
})