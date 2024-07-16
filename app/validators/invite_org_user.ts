import vine from '@vinejs/vine'

const createInviteOrgUserSchema = vine.object({
  email: vine.string().email(),
  orgId: vine.number(),
})

export const createInviteOrgUserValidator = vine.compile(createInviteOrgUserSchema)

const readInviteOrgUserSchema = vine.object({
  orgId: vine.number(),
})

export const readInviteOrgUserValidator = vine.compile(readInviteOrgUserSchema)

const deleteInviteOrgUserSchema = vine.object({
  inviteId: vine.number(),
})

export const deleteInviteOrgUserValidator = vine.compile(deleteInviteOrgUserSchema)
