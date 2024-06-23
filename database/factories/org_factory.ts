import factory from '@adonisjs/lucid/factories'
import Org from '#models/org'
import { UserFactory } from './user_factory.js'

export const OrgFactory = factory
  .define(Org, async ({ faker }) => {
    return {
      name: faker.company.name(),
    }
  })
  .relation('owner', () => UserFactory)
  .build()
