import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Invite org user, POST /org/invite', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('to be written', async ({ client }) => {
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
})
