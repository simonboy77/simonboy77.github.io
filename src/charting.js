const ChartTypes = {
	TTK_OVER_ACCURACY: 0,
	DAMAGE_OVER_TIME:  1,
	DPS_PER_MAG:       2,
	DAMAGE_PER_MAG:    3
};

function get_chart_title(type)
{
	switch(type)
	{
		case ChartType.TTK_OVER_ACCURACY: { return 'TTK Over Accuracy'; } break;
		case ChartType.DAMAGE_OVER_TIME:  { return 'Damage Over Time'; } break;
		case ChartType.DAMAGE_PER_MAG:    { return 'Damage Per Mag'; } break;
		case ChartType.DPS_PER_MAG:       { return 'DPS Per Mag'; } break;
	}
	
	return 'Unknown Chart Type';
}

let baseOptions = {
	scales: {
		x: {
			min: 0,
			max: 0,
			type: 'linear'
		},
		y: {
			min: 0,
			max: 0,
		}
	},
	plugins: {
		title: {
			display: true,
			text: 'Base Chart'
		},
		legend: {
			display: true,
			labels: {
				filter: function(item, data) { return true; }
			}
		},
		tooltip: {
			enabled: false
		}
	},
	elements: {
		line: {
			borderWidth: 2
		},
		point: {
			pointStyle: false
		}
	},
	animation: {
		duration: 0
	},
	maintainAspectRatio: false
}

//let ttkOverAccuracyOptions = JSON.parse(JSON.stringify(baseOptions));
let ttkOverAccuracyOptions = cloneDeep(baseOptions);
ttkOverAccuracyOptions.scales.x.min = 10;
ttkOverAccuracyOptions.scales.x.max = 100;
ttkOverAccuracyOptions.scales.y.max = 10.0;
ttkOverAccuracyOptions.plugins.title.text = 'TTK Over Accuracy';

let damageOverTimeOptions = cloneDeep(baseOptions);
damageOverTimeOptions.scales.x.max = 10.0;
damageOverTimeOptions.scales.y.max = 800;
damageOverTimeOptions.plugins.title.text = 'Damage Over Time';
damageOverTimeOptions.plugins.legend.labels.filter = function(item, data) { return item.text; };

const shieldOverlayDataset = [
	{ // Common Shield
		data: [{x:0,y:150},{x:10,y:150}],
		borderColor: clrCommon,
		borderWidth: 1,
		borderDash: [5, 5]
	}, { // Rare Shield
		data: [{x:0,y:175},{x:10,y:175}],
		borderColor: clrRare,
		borderWidth: 1,
		borderDash: [5, 5]
	}, { // Epic Shield
		data: [{x:0,y:200},{x:10,y:200}],
		borderColor: clrEpic,
		borderWidth: 1,
		borderDash: [5, 5]
	}, { // Mythic Shield
		data: [{x:0,y:225},{x:10,y:225}],
		borderColor: clrMythic,
		borderWidth: 1,
		borderDash: [5, 5]
	}
];

function chart_update_ttk_over_accuracy(chart, datasets, graphMods)
{
	chart.data.datasets = datasets;
	chart.update();
}

function chart_update_damage_over_time(chart, datasets, graphMods)
{
	// todo: destroy previous dataset?
	chart.data.datasets = datasets;
	if(graphMods.showShields) {
		for(let shieldIndex = 0; shieldIndex < shieldOverlayDataset.length; ++shieldIndex) {
			shieldOverlayDataset[shieldIndex].data[1].x = graphMods.seconds;
		}
		
		chart.data.datasets = chart.data.datasets.concat(shieldOverlayDataset);
	}
	
	damageOverTimeOptions.scales.x.max = graphMods.seconds
	chart.update();
}

function chart_update(chart, datasets, chartMods)
{
	switch(chartMods.type)
	{
		case ChartTypes.TTK_OVER_ACCURACY: {
			chart_update_ttk_over_accuracy(chart, datasets, chartMods);
		} break;
		
		case ChartTypes.DAMAGE_OVER_TIME: {
			chart_update_damage_over_time(chart, datasets, chartMods);
		} break;
		
		case ChartTypes.DPS_PER_MAG: {  } break;
		case ChartTypes.DAMAGE_PER_MAG: {  } break;
	}
}

function chart_set_type(chart, chartMods)
{
	switch(chartMods.type) {
		case ChartTypes.TTK_OVER_ACCURACY: {
			chart.type = 'line';
			chart.options = ttkOverAccuracyOptions;
		} break;
		
		case ChartTypes.DAMAGE_OVER_TIME: {
			chart.type = 'line';
			chart.options = damageOverTimeOptions;
		} break;
		
		case ChartTypes.DPS_PER_MAG: {
			
		} break;
		
		case ChartTypes.DAMAGE_PER_MAG: {
			
		} break;
	}
}

function chart_create(canvasId, graphMods)
{
	const chart = new Chart(canvasId, {
		type: 'line',
		data: {
			datasets: []
		},
		options: damageOverTimeOptions
	});

	chart_set_type(chart, graphMods);
	chart_update(chart, [], graphMods);
	return chart;
}
