import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import { type HasMany, type HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Client from './client.js'

export default class Org extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare ownerId: number

  @hasOne(() => User, {
    localKey: 'ownerId',
    foreignKey: 'id',
  })
  declare owner: HasOne<typeof User>

  @hasMany(() => Client)
  declare clients: HasMany<typeof Client>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
