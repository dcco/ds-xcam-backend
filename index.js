
	// Data
const SECRET = require('./secret.json');

	// Imports
const dump = require('./dump.js');

	// EXPRESS SERVER constants
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5500;

	// Sheets API variables
const {google} = require('googleapis');
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';
var API_KEY = '0000';

	// API setup
app.use(cors());

app.listen(PORT, () => {
	console.log("Server started.");
	API_KEY = SECRET.key;
});

app.get("/test", async (req, res) => {
	res.status(200).json({
		'response': "Valid",
		'id': "0000"
	});
});

	// xcam sheet functions

async function readXSheet(sheetId, range) {
	const sheets = google.sheets({ version: 'v4', auth: API_KEY });
	var response = await sheets.spreadsheets.values.get({
		spreadsheetId: sheetId,
		range: range 
	});
	return response.data;
}

async function readAllXcamData() {
	var ULT_ID = '1J20aivGnvLlAuyRIMMclIFUmrkHXUzgcDmYa31gdtCI';
 	var EXT_ID = '1X06GJL2BCy9AXjiV9Y8y-7KKkj4d9YI3dtTb2HVOyRs';

	var rd1 = await readXSheet(ULT_ID, 'Ultimate Star Spreadsheet v2!A2:E526');
	var xd1 = await readXSheet(ULT_ID, 'Ultimate Star Spreadsheet v2!M1:526');
	var rd2 = await readXSheet(EXT_ID, 'Ultimate Sheet Extensions!A2:E248');
	var xd2 = await readXSheet(EXT_ID, 'Ultimate Sheet Extensions!M1:248');
	
	rowData = { "main": rd1, "ext": rd2 };
	xcamData = { "main": xd1, "ext": xd2 };
	return [rowData, xcamData];
}

async function dumpXcamData() {
	var [rowData, xcamData] = await readAllXcamData();
	var dumpRowData = dump.genRowData(rowData, xcamData);
	var dumpXcamData = dump.genXcamData(rowData, xcamData);
	return [dumpRowData, dumpXcamData];
}

function responseWrap(f) {
	return async (req, res) => {
		try {
			var data = await f();
			res.status(200).json({
				'response': "Valid",
				'res': data
			});
		} catch (err) {
			res.status(404).json({
				'response': "Error",
				'err': err
			})
		}
	};
}

app.get("/raw_xcams", responseWrap(readAllXcamData));
app.get("/dump_xcams", responseWrap(dumpXcamData));

