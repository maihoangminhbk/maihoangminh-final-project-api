import cron from 'node-cron'
import { CardService } from '../services/card.service'
import { NotificationService } from '../services/notification.service'

import SENDMAIL, { setOptions } from '../mailer/mailer'

export function checkDeadline() {
  cron.schedule('* * * * *', () => {
    // Get card deadline
    CardService.checkCardLate(0).then(result => {
      const promises = []
      result.map(card => {
        const email = card.usersInfo[0].email
        const link = `https://localhost:3000/workplaces/${card.workplaceId.toString()}/boards/${card.boardId.toString()}`
        const mailOption = setOptions('Deadline notification', card.title + ' in ' + card.boardInfo[0].title, 'This card catched deadline. Please check ' + link, email)
        promises.push(SENDMAIL(mailOption, () => {
          console.log('Email sent successfully')
        }))

        const notificationData = {
          workplaceId: card.workplaceId.toString(),
          boardId: card.boardId.toString(),
          boardTitle: card.boardInfo[0].title,
          notificationType: 'late',
          userCreateId: card.userId.toString(),
          action: 'had',
          userTargetId: card.userId.toString(),
          objectTargetType: 'card',
          objectTargetId: card._id.toString()
        }

        promises.push(NotificationService.createNew(notificationData))

        const cardUpdateData = {
          status: 4
        }

        promises.push(CardService.update(card._id.toString(), card.userId.toString(), cardUpdateData))
      })

      Promise.all(promises).then((result) => {
      }).catch(e => {
        console.log(e)
      })
    })

    // Get card deadline after 1 day
    CardService.checkCardDeadline(1).then(result => {
      const promises = []
      result.map(card => {
        const email = card.usersInfo[0].email
        const link = `https://localhost:3000/workplaces/${card.workplaceId.toString()}/boards/${card.boardId.toString()}`
        const mailOption = setOptions('Deadline notification', card.title + ' in ' + card.boardInfo[0].title, 'This card only 1 day before deadline. Please check ' + link, email)
        promises.push(SENDMAIL(mailOption, () => {
          console.log('Email sent successfully')
        }))

        const notificationData = {
          workplaceId: card.workplaceId.toString(),
          boardId: card.boardId.toString(),
          boardTitle: card.boardInfo[0].title,
          notificationType: 'deadline',
          userCreateId: card.userId.toString(),
          action: 'had',
          userTargetId: card.userId.toString(),
          objectTargetType: 'card',
          objectTargetId: card._id.toString()
        }

        promises.push(NotificationService.createNew(notificationData))
      })

      Promise.all(promises).then((result) => {
      }).catch(e => {
        console.log(e)
      })
    })
  })
}
