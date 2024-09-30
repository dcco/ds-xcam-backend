
const _orgData = require("./org_data.json");

	/* data flattening for easier iteration */

function _flatVerSetData(list, stage, star, verSet) {
	for (const [strat, sData] of Object.entries(verSet)) {
		if (!sData.virtual) {
			list.push({
				"stage": stage.name,
				"star": star.name,
				"strat": strat,
				"idList": sData.id_list
			});
		}
	}
}

function flattenOrgData() {
	var jpData = [];
	var usData = [];
	for (const stage of _orgData) {
		if (stage.end) continue;
		for (const star of stage.starList) {
			_flatVerSetData(jpData, stage, star, star.jp_set);
			_flatVerSetData(usData, stage, star, star.us_set);
		}
	}
	return {
		"jpList": jpData,
		"usList": usData
	};
}

module.exports = {
	orgData: _orgData,
	flatData: () => flattenOrgData(_orgData)
}