import express from 'express'
import serveIndex from 'serve-index'
import * as path from 'path'
import fileupload from 'express-fileupload'
import {apiRouter, authenticateToken, generateAccessToken} from './middleware'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

let app = express()
let PORT = process.env.PORT || process.argv[2] || 8080, PUBLIC_HTML = path.resolve(__dirname, 'public/cdn')

// Serve URLs like /cdn/thing as public/cdn/thing
// The express.static serves the file contents
// The serveIndex is this module serving the directory

let jsonParser = bodyParser.json()
// let urlencodedParser = bodyParser.urlencoded({extended: false})
app.post('/api/createUser', jsonParser, (req, res) => {
	const token = generateAccessToken(req.body.username)
	return res
		.cookie('accessToken', token, {
			httpOnly: true
		})
		.status(200)
		.json({
			'message': `Logged in as ${req.body.username}`
		})
})


app.use(cookieParser())
app.use(authenticateToken)
app.use('/api', apiRouter)


app.use('/cdn', express.static(PUBLIC_HTML), serveIndex(PUBLIC_HTML, {'icons': true}))
app.use(fileupload({
	limits: {fileSize: 1073741824 * 6}, useTempFiles: true, tempFileDir: path.resolve(__dirname, 'tmp')
}))
app.get('/upload', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/upload/index.html'))
})


app.post('/upload', function (req, res) {
	let file;
	let uploadPath;

	if (!req.files || Object.keys(req.files).length === 0) {
		return res.status(400).send('No files were uploaded.');
	}


	file = req.files.file;
	uploadPath = __dirname + '/public/cdn/' + file.name;


	file.mv(uploadPath, function (err) {
		if (err) return res.status(500).send(err);

		res.send('File uploaded!');
	});
});


// Listen
app.listen(PORT, () => {
	console.log(`serving ftp at: http://127.0.0.1:${PORT}/cdn`)
	console.log(`upload path: http://127.0.0.1:${PORT}/upload`)
})