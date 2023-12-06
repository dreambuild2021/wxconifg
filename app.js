const express = require('express')
const cors = require('cors')
const axios = require('axios')
const sign = require('./sign')

const app = express()
app.use(cors())

const port = 9000
const globalStore = {
  appid: 'wx03ec3333acc0b717',
  secret: '4759df52c84f6f9543e0f3c274962f3f',
  accessToken: {
    value: null,
    expires: null
  },
  ticket: {
    value: null,
    expires: null
  }

}

async function getAccessToken() {
  if (globalStore.accessToken.value && globalStore.accessToken.expires > Date.now()) {
    return globalStore.accessToken.value
  }
  const res = await axios.post('https://api.weixin.qq.com/cgi-bin/stable_token', {
    "grant_type": "client_credential",
    "appid": globalStore.appid,
    "secret": globalStore.secret
  })
  const { errmsg, access_token, expires_in } = res.data
  if (!errmsg) {
    globalStore.accessToken.value = access_token
    globalStore.accessToken.expires = Date.now() + expires_in * 1000
    return access_token
  }
  return false
}

async function getTicket() {
  if (globalStore.ticket.value && globalStore.ticket.expires > Date.now()) {
    return globalStore.ticket.value
  }
  const accessToken = await getAccessToken()
  if (!accessToken) {
    return false
  }
  const res = await axios.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket', {
    params: {
      access_token: accessToken,
      type: 'jsapi'
    }
  })
  const { errmsg, ticket, expires_in } = res.data
  if (errmsg === 'ok') {
    globalStore.ticket.value = ticket
    globalStore.ticket.expires = Date.now() + expires_in * 1000
    return ticket
  }
  return false
}

app.get('/config', async (req, res) => {
  const ticket = await getTicket()
  const config = sign(ticket, req.query.url)
  res.send(config)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})