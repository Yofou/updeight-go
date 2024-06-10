import Org from '#models/org'
import vine from '@vinejs/vine'

const createOrgSchema = vine.object({
  name: vine.string().unique(async (_, value) => {
    return !(await Org.findBy({
      name: value,
    }))
  }),
})

export const createOrgValidator = vine.compile(createOrgSchema)

const readOrgSchema = vine.object({
  id: vine.number().exists(async (_, value) => {
    return !!(await Org.find(value))
  }),
})

export const readOrgValidator = vine.compile(readOrgSchema)
