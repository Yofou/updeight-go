import Client from '#models/client'
import Org from '#models/org'
import vine from '@vinejs/vine'

const createClientSchema = vine.object({
  name: vine.string().unique(async (_, value) => {
    return !(await Client.findBy({
      name: value,
    }))
  }),

  orgId: vine.number().exists(async (_, value) => {
    return !!(await Org.find(value))
  }),
})

export const createClientValidator = vine.compile(createClientSchema)

const readClientSchema = vine.object({
  id: vine.number().exists(async (_, value) => {
    return !!(await Client.find(value))
  }),
})

export const readClientValidator = vine.compile(readClientSchema)

const updateClientSchema = vine.object({
  id: vine.number().exists(async (_, value) => {
    return !!(await Client.find(value))
  }),

  name: vine
    .string()
    .unique(async (_, value) => {
      return !(await Client.findBy({
        name: value,
      }))
    })
    .optional(),

  orgId: vine
    .number()
    .exists(async (_, value) => {
      return !!(await Org.find(value))
    })
    .optional(),
})

export const updateClientValidator = vine.compile(updateClientSchema)
