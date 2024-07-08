import { render, screen } from '@testing-library/react'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'

test('form calls the event handler prop with the right details when a new blog is created', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  const { container } = render(<BlogForm createBlog={createBlog} />)

  const titleInput = screen.getByTestId('title-input')
  const authorInput = screen.getByTestId('author-input')
  const urlInput = screen.getByTestId('url-input')
  const sendButton = screen.getByText('create')

  await user.type(titleInput, 'some blog')
  await user.type(authorInput, 'John')
  await user.type(urlInput, 'http://some_blog.com')
  await user.click(sendButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0]).toEqual({
    title: 'some blog',
    author: 'John',
    url: 'http://some_blog.com'
  })
})