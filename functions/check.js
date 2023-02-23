import Webmention from '../lib/webmention'
const sendMention = require('../lib/send')

const respond = (code, body) => ({ statusCode: code, body: JSON.stringify(body) })

exports.handler = async e => {
	const params = e.queryStringParameters

	if (!['GET', 'POST'].includes(e.httpMethod)) return respond(405, { error: true, message: 'method not allowed' })
	if (!params || !params.url) return respond(400, { error: true, message: 'missing url' })

	const checkWebmentions = () => new Promise((resolve, reject) => {
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
		const res = await checkWebmentions()
		return respond(200, res)
	} catch (e) {
		return respond(400, e)
	}
}
