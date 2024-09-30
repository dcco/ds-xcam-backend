
const begData = require('./beg_dump.json');

const fs = require('fs');

var strats = require("./org_strat.js");

	// time reader

function _secMS(secText) {
	if (!secText.includes('.')) {
		// the gemini fix (salt cless, 8"96)
		if (secText.includes('"')) {
			var ft = secText.split('"');
			return (parseInt(ft[0]) * 100) + parseInt(ft[1]);
		}
		return parseInt(secText) * 100;
	}
	var ft = secText.split('.');
	return (parseInt(ft[0]) * 100) + parseInt(ft[1]);
}

function rawMS(fillText) {
	if (!fillText) return null;
	try {
		if (!fillText.includes(':')) {
			// the wicko fix (multiple, 1.58.46)
			var ftx = fillText.split('.');
			if (ftx.length >= 3) {
				return (parseInt(ftx[0]) * 6000) + (parseInt(ftx[1]) * 100) + parseInt(ftx[2]); 
			}
			return _secMS(fillText);
		}
		var ft = fillText.split(':');
		// the rambok fix (ccm100c+slide, 1:11:46)
		if (ft.length >= 3) {
			if (ft[1] !== "") {
				return (parseInt(ft[0]) * 6000) + (parseInt(ft[1]) * 100) + parseInt(ft[2]);
			}
			// the fizz fix (ttm100c us, 1::41.73)
			ft[1] = ft[2]; 
		}
		var min = parseInt(ft[0]);
		var sec = _secMS(ft[1]);
		return (min * 6000) + sec;
	} catch (err) {
		return null;
	}
}

	// verification

/*function verifyRows(rowData) {
	for (let i = 0; i < 17; i++) {
		if (strats.orgData[i].ext) continue;
		// main check
		var cId = strats.orgData[i].checkId;
		var checkName = strats.orgData[i].name;
		var checkStr = rowData["main"].values[cId][0];
		if (checkStr === undefined || !checkStr.includes(checkName)) {
			throw new Error("Xcam Data desync for " + checkName + " - found " + checkStr);
		}
		// ext check
		var eId = strats.orgData[i].extCheckId;
		var extStr = rowData["ext"].values[eId][0];
		if (extStr === undefined || !extStr.includes(checkName)) {
			throw new Error("Extension Data desync for " + checkName + " - found " + extStr);
		}
	}
}*/

	// row-specific (not strat specific) data

function _buildAnnVSData(rrData, verSet, v, rowData) {
	for (const strat of verSet) {
		for (const ref of strat.idList) {
			var [sx, id] = ref;
			rrData[sx]["" + id] = {
				"name": strat.strat,
				"record": rowData[sx].values[id][1],
				"ver": v
			}
		}
	}
}

function buildAnnRowData(flatData, rowData) {
	var rrData = {
		"main": {},
		"ext": {}
	};
	_buildAnnVSData(rrData, flatData.jpList, "jp", rowData);
	_buildAnnVSData(rrData, flatData.usList, "us", rowData);
	rrData["beg"] = begData;
	return rrData;
}

	// dump functions

/*function dumpXcamData(flatData, xcamData) {
	var xcamTable = {};
	for (const strat of flatData) {
		var rankList = rankPlayersStrat(strat, xcamData);
		xcamTable[strat.idList[0]] = {
			"strat": strat,
			"times": rankList,
			"xcamId": strat.idList[0]
		};
	}
	return xcamTable;
}*/

function timesRowId(rowId, xcamData) {
	var timeList = [];
	var playerTotal = xcamData.values[0].length;
	for (let i = 0; i < playerTotal; i++) {
		var fillText = xcamData.values[rowId + 1][i];
		var fillTime = rawMS(fillText);
		if (fillTime !== null) {
			timeList.push({
				"player": xcamData.values[0][i],
				"ms": fillTime
			})
		}
	}
	timeList.sort(function(a, b) { return a.ms - b.ms });
	return timeList;
}

function _dumpVSXcamData(xcamTable, verList, xcamData) {
	for (const strat of verList) {
		for (const ref of strat.idList) {
			var [sx, id] = ref;
			var timeList = timesRowId(id, xcamData[sx]);
			xcamTable[sx][id] = {
				"strat": strat,
				"times": timeList,
				"sheet": sx,
				"xcamId": id
			};
		}
	}
}

function dumpAllXcamData(flatData, xcamData) {
	var xcamTable = {
		"main": {},
		"ext": {}
	};
	_dumpVSXcamData(xcamTable, flatData.jpList, xcamData);
	_dumpVSXcamData(xcamTable, flatData.usList, xcamData);
	return xcamTable;
}

	// main dump functions

function genRowData(rowData, xcamData) {
	// read row WR data
	var flatData = strats.flatData();
	return buildAnnRowData(flatData, rowData);
}

function genXcamData(rowData, xcamData) {
	// read xcam data 
	var flatData = strats.flatData();
	return dumpAllXcamData(flatData, xcamData);
}

module.exports = {
	rawMS: rawMS,
	genRowData: genRowData,
	genXcamData: genXcamData
}
