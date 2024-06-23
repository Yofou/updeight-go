import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Session, /login', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('fails if password doesnt match', async ({ client }) => {
    const response = await client
      .post('/login')
      .json({
        email: 'reach@yofou.dev',
        password: 'thisIsWrongPassword',
      })
      .send()

    response.assertBody({
      errors: [
        {
          message: 'Invalid user credentials',
        },
      ],
    })
  })

  test('fails if email doesnt match', async ({ client }) => {
    const response = await client
      .post('/login')
      .json({
        email: 'wrongEmail@gmail.com',
        password: 'password123',
      })
      .send()

    response.assertBody({
      errors: [
        {
          message: 'Invalid user credentials',
        },
      ],
    })
  })

  test('passes if credentials match and ', async ({ client, assert }) => {
    const user = await UserFactory.merge({ password: 'password123' }).create()
    const response = await client
      .post('/login')
      .json({
        email: user.email,
        password: 'password123',
      })
      .send()

    response.assertBody(user.serialize())

    assert.exists(response.cookiesJar)
  })
})

test.group('Session, /register', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('fails if fields are not supplied', async ({ client }) => {
    const response = await client.post('/register').json({}).send()

    response.assertBody({
      errors: [
        {
          field: 'username',
          message: 'The username field must be defined',
          rule: 'required',
        },
        {
          field: 'email',
          message: 'The email field must be defined',
          rule: 'required',
        },
        {
          field: 'password',
          message: 'The password field must be defined',
          rule: 'required',
        },
        {
          field: 'confirm',
          message: 'The confirm field must be defined',
          rule: 'required',
        },
      ],
    })
  })

  test('fails if email is not unique', async ({ client }) => {
    const response = await client
      .post('/register')
      .json({
        email: 'reach@yofou.dev',
        username: 'yofou',
        password: 'password123',
        confirm: 'password123',
      })
      .send()

    response.assertBody({
      errors: [
        {
          field: 'email',
          message: 'The email has already been taken',
          rule: 'database.unique',
        },
      ],
    })
  })

  test('fails if password does not match confirm', async ({ client }) => {
    const response = await client
      .post('/register')
      .json({
        email: 'new@yofou.dev',
        username: 'yofou',
        password: 'password123',
        confirm: 'password12',
      })
      .send()

    response.assertBody({
      errors: [
        {
          field: 'password',
          message: 'The password field and confirm field must be the same',
          rule: 'confirmed',
          meta: {
            otherField: 'confirm',
          },
        },
      ],
    })
  })

  test('fails if password is too long', async ({ client }) => {
    const response = await client
      .post('/register')
      .json({
        email: 'new@yofou.dev',
        username: 'yofou',
        password: '0123456789012345678901234567891',
        confirm: '0123456789012345678901234567891',
      })
      .send()

    response.assertBody({
      errors: [
        {
          field: 'password',
          message: 'The password field must not be greater than 30 characters',
          rule: 'maxLength',
          meta: {
            max: 30,
          },
        },
      ],
    })
  })

  test('passes and creates account', async ({ client, assert }) => {
    const response = await client
      .post('/register')
      .json({
        email: 'new@yofou.dev',
        username: 'yofou3',
        password: 'password123',
        confirm: 'password123',
      })
      .send()

    assert.containsSubset(response.body(), {
      email: 'new@yofou.dev',
      username: 'yofou3',
    })
  })
})

test.group('Session, /me', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('fails if not logged in', async ({ client }) => {
    const response = await client.get('/me').send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('passed if logged in', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.get('/me').loginAs(user).send()

    response.assertBody({
      createdAt: user.serialize().createdAt,
      email: user.email,
      id: user.id,
      updatedAt: user.serialize().updatedAt,
      username: user.username,
    })
  })
})

test.group('Session, /logout', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('fails if not logged in', async ({ client }) => {
    const response = await client.delete('/logout').send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('passed if logged in', async ({ client }) => {
    const user = await User.findByOrFail({
      email: 'reach@yofou.dev',
    })

    const response = await client.delete('/logout').withGuard('web').loginAs(user).send()

    response.assertBody({ logout: true })
  })
})
