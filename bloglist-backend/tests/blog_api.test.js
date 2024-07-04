const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const Blog = require('../models/blog')
const User = require('../models/user')

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'new user',
      name: 'Ivan Ivanov',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'superuser',
      password: 'salainen'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with missing username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'anna',
      password: '12345'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('`username` is required'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)

  })

  test('creation fails with invalid username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username:  'a',
      name: 'anna',
      password: '12345'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('username must be at least 3 characters long'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)

  })

  test('creation fails with missing password', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ann111',
      name: 'anna',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)



    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('password is required'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)

  })

  test('creation fails with invalid password', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ann111',
      name: 'anna',
      password: '1'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)



    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('password must be at least 3 characters long'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)

  })
})

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('unique identifier is named id', async () => {
    const response = await api.get('/api/blogs')

    const blogs = response.body

    blogs.forEach(blog => {
      assert(Object.prototype.hasOwnProperty.call(blog, 'id')),
      assert(!Object.prototype.hasOwnProperty.call(blog, '_id'))
    })
  })

  describe('addition of a new blog', () => {

    test('fails with status code 401 if the token is missing', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const newBlog = {
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      }

      const result = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtStart.length, blogsAtEnd.length)

      assert(result.body.error.includes('token missing or invalid'))

      const titles = blogsAtEnd.map(b => b.title)
      assert(!titles.includes('Type wars'))
    })

    test('fails with status code 401 if the token is invalid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const invalidToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXWCJ9.eyJ1c2VybmFtZSI6Iml2YW4iLCJpZCI6IjY2ODI3ZDI1Y2I2ZGU3OWRkOTYwNDcxNSIsImlhdCI6MTcxOTgzNjM0NX0.HyAbTFLuYvLVg_MkJuAk7XAAyE9tQOUr28Db6hG1gAc'

      const newBlog = {
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      }

      const result = await api
        .post('/api/blogs')
        .send(newBlog)
        .set({ Authorization: invalidToken })
        .expect(401)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtStart.length, blogsAtEnd.length)

      assert(result.body.error.includes('token invalid'))

      const titles = blogsAtEnd.map(b => b.title)
      assert(!titles.includes('Type wars'))
    })

    test('succeeds with status code 201 with valid token and valid data', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const validToken = await helper.getToken()

      const newBlog = {
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .set({ Authorization: `Bearer ${validToken}` })
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtStart.length + 1, blogsAtEnd.length)

      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes('Type wars'))
    })

    test('fails with status code 400 if there is no url', async () => {
      const validToken = await helper.getToken()

      const blogWithNoUrl = {
        title: 'Type wars',
        author: 'Robert C. Martin',
      }

      await api
        .post('/api/blogs/')
        .set({ Authorization: `Bearer ${validToken}` })
        .send(blogWithNoUrl)
        .expect(400)
    })

    test('fails with status code 400 if there is no title', async () => {
      const validToken = await helper.getToken()

      const blogWithNoTitle = {
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        author: 'Robert C. Martin',
      }

      await api
        .post('/api/blogs/')
        .set({ Authorization: `Bearer ${validToken}` })
        .send(blogWithNoTitle)
        .expect(400)
    })

    test('likes prop is set to zero if missing', async () => {
      const validToken = await helper.getToken()

      const newBlog = {
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      }

      await api
        .post('/api/blogs')
        .set({ Authorization: `Bearer ${validToken}` })
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogs = await helper.blogsInDb()

      const likes = blogs.map(b => b.likes)

      assert.strictEqual(likes[likes.length - 1], 0)
    })
  })

  describe('deletion of a blog', () => {
    test('fails with status code 401 if the token is missing', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(401)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, blogsAtEnd.length)
    })

    test('fails with status code 401 if the token is invalid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]
      const invalidToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXWCJ9.eyJ1c2VybmFtZSI6Iml2YW4iLCJpZCI6IjY2ODI3ZDI1Y2I2ZGU3OWRkOTYwNDcxNSIsImlhdCI6MTcxOTgzNjM0NX0.HyAbTFLuYvLVg_MkJuAk7XAAyE9tQOUr28Db6hG1gAc'

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set({ Authorization: invalidToken })
        .expect(401)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, blogsAtEnd.length)
    })

    test('succeeds with status code 204 with valid token and valid id', async () => {

      const id = await helper.createBlogByAuthorizedUser()
      const validToken = await helper.getToken()
      const blogsAtStart = await helper.blogsInDb()

      await api
        .delete(`/api/blogs/${id}`)
        .set({ Authorization: `Bearer ${validToken}` })
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
    })

    test('fails with status 400 if id is invalid', async () => {
      const invalidId = '5a422a851b54a676234d17f'
      const validToken = await helper.getToken()

      await api
        .delete(`/api/blogs/${invalidId}`)
        .set({ Authorization: `Bearer ${validToken}` })
        .expect(400)
    })

    test('fails with status code 404 if blog does not exist', async () => {
      const nonExistingButValidId = '5a422ba71b54a676234d17fb'
      const validToken = await helper.getToken()

      await api
        .delete(`/api/blogs/${nonExistingButValidId}`)
        .set({ Authorization: `Bearer ${validToken}` })
        .expect(404)
    })
  })

  describe('updating of a blog', () => {
    test('succeeds with status code 200 with valid token and valid id', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      const id = await helper.createBlogByAuthorizedUser()
      const validToken = await helper.getToken()
      const newTitle = 'Updated title'

      const updatedBlog = {
        title: newTitle,
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: blogToUpdate.likes
      }

      await api
        .put(`/api/blogs/${id}`)
        .send(updatedBlog)
        .set({ Authorization: `Bearer ${validToken}` })
        .expect(200)
    })

    test('succeeds with like updates for authorized user', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToLike = blogsAtStart[0]
      const id = blogToLike.id
      const validToken = await helper.getToken()

      const updatedBlog = {
        title: blogToLike.title,
        author: blogToLike.author,
        url: blogToLike.url,
        likes: blogToLike.likes + 1
      }

      await api
        .put(`/api/blogs/${id}`)
        .send(updatedBlog)
        .set({ Authorization: `Bearer ${validToken}` })
        .expect(200)

      const blogsAtEnd = await helper.blogsInDb()
      const updatedBlogFromDb = blogsAtEnd.find(b => b.id === id)
      assert.strictEqual(updatedBlogFromDb.likes, blogToLike.likes + 1)
    })

    test('fails with status code 403 if a user tries to update title, author or url of a blog they did not create', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      const id = blogToUpdate.id
      const validToken = await helper.getToken()

      const updatedBlog = {
        title: 'Unauthorized update',
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: blogToUpdate.likes
      }

      const result = await api
        .put(`/api/blogs/${id}`)
        .send(updatedBlog)
        .set({ Authorization: `Bearer ${validToken}` })
        .expect(403)

      assert(result.body.error.includes('blog may be updated only by user who created it'))
    })

    test('fails with status code 400 if id is invalid', async () => {
      const invalidId = '5a422a851b54a676234d17f'
      const newTitle = 'Updated title'
      const validToken = await helper.getToken()

      const updatedBlog = {
        title: newTitle,
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        likes: 2
      }

      await api
        .put(`/api/blogs/${invalidId}`)
        .send(updatedBlog)
        .set({ Authorization: `Bearer ${validToken}` })
        .expect(400)
    })

    test('fails with status code 404 if blog does not exist', async () => {
      const nonExistingButValidId = '5a422ba71b54a676234d17fb'
      const newTitle = 'Updated title'
      const validToken = await helper.getToken()

      const updatedBlog = {
        title: newTitle,
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        likes: 2
      }

      await api
        .put(`/api/blogs/${nonExistingButValidId}`)
        .send(updatedBlog)
        .set({ Authorization: `Bearer ${validToken}` })
        .expect(404)
    })
  })
})



after(async () => {
  await mongoose.connection.close()
})