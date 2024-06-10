import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tracks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.datetime('started_at').notNullable()
      table.datetime('finished_at').notNullable()
      table.integer('user_id').notNullable().references('users.id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

