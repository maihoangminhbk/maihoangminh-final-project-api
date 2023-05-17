// const AccessControl = require('accesscontrol')
import AccessControl from 'accesscontrol'

const ac = new AccessControl()

exports.roles = (function() {

  ac.grant('card-user')
    .readAny('card')
    .updateOwn('task')

  ac.grant('card-owner')
    .extend('card-user')
    .updateOwn('card')

  //   ac.grant('task-admin')
  //     .extend('basic')
  //     .readAny('profile')

  ac.grant('board-user')
    .extend('card-user')
    // .createOwn('card')

  ac.grant('board-admin')
    .extend('board-user')
    .extend('card-owner')
    .updateOwn('board')

  ac.grant('board-owner')
    .extend('board-admin')

  ac.grant('workplace-user')

  ac.grant('workplace-admin')
    .updateOwn('workplace')
    .createAny('board')
    .updateAny('board')
    .createAny('workplace-user')

  ac.grant('workplace-owner')
    .extend('workplace-admin')

  return ac
})()