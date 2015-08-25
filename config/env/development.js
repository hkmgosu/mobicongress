console.log(process.env.PARSE_ACCOUNT_USER);
module.exports = {
	MONGOLAB_URI: process.env.MONGOLAB_URI,
	PARSE_ACCOUNT_USER: process.env.PARSE_ACCOUNT_USER,
	PARSE_ACCOUNT_PASSWORD: process.env.PARSE_ACCOUNT_PASSWORD,
	sessionSecret: 'developmentSessionSecret'
};