import Webmention from '../lib/webmention'
const sendMention = require('../lib/send')

const send = (code, body) => ({ statusCode: code, body: JSON.stringify(body) })

exports.handler = async e => {
	const params = e.queryStringParameters

	if (!['GET', 'POST'].includes(e.httpMethod)) return send(405, { error: true, message: 'method not allowed' })
	if (!params || !params.url) return send(400, { error: true, message: 'missing url' })

	const checkWMs = () => new Promise((resolve, reject) => {
		const wm = new Webmention({ limit: params.limit || 10 })
		wm.on('error', e => {
			reject({ error: true, message: e.message })
		})

		wm.on('endpoints', urls => {
			if (e.httpMethod == 'POST') {
				return Promise.all(urls.map(sendMention)).then(reply => {
					resolve({ urls: reply })
				})
			}
			if (urls.length === 0 && wm.mentions.length > 0) {
				reject({
					error: true,
					message: `No webmention endpoints found in the ${
						wm.mentions.length
					} content ${wm.mentions.length === 1 ? 'entry' : 'entries'}`,
				})
			} else {
				resolve({ urls })
			}
		})

		wm.fetch(params.url)
	})

	try {
		const res = await checkWMs()
		return send(200, res)
	} catch (e) {
		return send(400, e)
	}
}
