import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import Org from './org.js'
import { type HasOne } from '@adonisjs/lucid/types/relations'

export default class Client extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare orgId: number

  @hasOne(() => Org, {
    localKey: 'orgId',
    foreignKey: 'id',
  })
  declare org: HasOne<typeof Org>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

