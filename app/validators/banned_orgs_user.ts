import vine from '@vinejs/vine'

const createBannedOrgUserSchema = vine.object({
  userId: vine.number(),
  orgId: vine.number(),
})

export const createBannedOrgUserValidator = vine.compile(createBannedOrgUserSchema)

const readBannedOrgUserSchema = vine.object({
  orgId: vine.number(),
})

export const readBannedOrgUserValidator = vine.compile(readBannedOrgUserSchema)

const deleteBannedOrgUserSchema = vine.object({
  bannedId: vine.number(),
})

export const deleteBannedOrgUserValidator = vine.compile(deleteBannedOrgUserSchema)
