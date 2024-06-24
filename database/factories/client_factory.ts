import factory from '@adonisjs/lucid/factories'
import Client from '#models/client'
import { OrgFactory } from './org_factory.js'

export const ClientFactory = factory
  .define(Client, async ({ faker }) => {
    return {
      name: faker.company.name(),
    }
  })
  .relation('org', () => OrgFactory)
  .build()
