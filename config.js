var config = {};

config.parse = {};

config.web = {};
config.session = {};

// baseUrl
config.web.baseUrl = 'http://mobicongress.herokuapp.com';

// // folder files
// config.folders.files = './uploads/';
// config.folders.sizeupload = 3145728; // 3MB

// parse configuration
config.parse.appId = process.env['PARSE_API_KEY_ID'] || 'Xp0hksbFeO1LwL5K1fRst3jRUBz6EPiOBydprLEA';
config.parse.jsKey = process.env['PARSE_API_JS_KEY'] || 'P1eGJnYPSLida8W43Ys7amvKPihTSuUnPOwoHFIZ';
config.parse.masterKey = process.env['PARSE_MASTER_KEY'] || 'kk0d4N1BqEt0KOLEv3uiCESvchTYC09dJqbrcUt1';

//session secret
config.session.secret = process.env.EXPRESS_SECRET || "fa2d5588dbef6144f7aa8688577bf89c2ff0686a85d4cbffb0d59779d13ee9e0a5e2c2d9792212c6";


module.exports = config;