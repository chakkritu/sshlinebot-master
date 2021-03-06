const functions = require('firebase-functions')
const request = require('request-promise')

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message'
const LINE_HEADER = {
  'Content-Type': 'application/json',
  Authorization: `Bearer {xhH7xTTDRzArYSvBwwfIlDInD/qf/IyT8/FfYhGOJsapVs7vZuSitRczgO7yYHZEGv9WW4/JKaXQuixh7ZpFrfN685J9ub2FANkb1B+rOmbyzNsqF/IE8vT+eqx4F5/fNo+HDirZX2Yhujd0f1fX4gdB04t89/1O/w1cDnyilFU=}` //// ----> LINE Authentication Key (Channel access token)
}

let node_ssh = require('node-ssh')
let ssh = new node_ssh()

exports.LineBot = functions.https.onRequest((req, res) => {
  reply(req.body)
})

const reply = bodyResponse => {
  const command = bodyResponse.events[0].message.text
  ssh
    .connect({
      host: 'http://kritja.cloudddns.com:88', //// ----> host ของเครื่องที่เราจะเข้าไปใช้งาน
      username: 'ec2-user',
      privateKey: 'privatekey.pem'  //// ----> ที่อยู่ของ privatekey.pem ไว้ที่ /functions/privatekey.pem
    })
    .then((result, error) => {
      ssh
        .execCommand(command, { cwd: '/var/www' })
        .then(function(result) {
          request({
            method: `POST`,
            uri: `${LINE_MESSAGING_API}/reply`,
            headers: LINE_HEADER,
            body: JSON.stringify({
              replyToken: bodyResponse.events[0].replyToken,
              messages: [
                {
                  type: `text`,
                  text: result.stdout
                }
              ]
            })
          })
            .then(() => {
              return res.status(200).send(`Done`)
            })
            .catch(error => {
              return Promise.reject(error)
            })
        })
        .catch(error => {
          return Promise.reject(error)
        })
    })
    .catch(error => {
      return Promise.reject(error)
    })
}