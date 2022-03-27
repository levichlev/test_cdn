import {config as dotenv} from 'dotenv'
import jwt from 'jsonwebtoken'
import express from 'express'

dotenv()

const secret = process.env.TOKEN_SECRET

export const apiRouter = express.Router()

export const generateAccessToken = (username) => {
	return jwt.sign({username}, secret, {expiresIn: '1800s'})
}

export const authenticateToken = (req, res, next) => {
	const token = req.cookies['accessToken']
	if (!token) return res.sendStatus(401)

	jwt.verify(token, secret, {},(err, user) =>{
		// console.error(err)

		if(err) return res.sendStatus(403)

		req.user = user

		next()
	})
}

apiRouter.get('/', (req, res) => {
	console.log(req.user)
	return res.json({username: req.user.username})
})