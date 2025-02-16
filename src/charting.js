const ChartTypes = {
	TTK_OVER_ACCURACY: 0,
	DAMAGE_OVER_TIME:  1,
	DAMAGE_PER_MAG:    2,
	DPS_PER_MAG:       3
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

function legend_filter(legend, chart)
{
	
}

const ttkOverAccOptions = {
	scales: {
		x: {
			min: 10,
			type: 'linear'
		},
		y: {
			min: 0
		}
	},
	plugins: {
		title: {
			display: true,
			text: 'TTK Over Accuracy'
		},
		legend: {
			display: true,
			labels: {
				// If legendItem has no text we don't display it. Used for dotted shield lines
				filter: function(legendItem, data) { return legendItem.text; }
			}
		},
		tooltip: {
			enabled: false
		}
	},
	interaction: {
		intersect: false,
		axis: 'y',
		mode: 'nearest'
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
};

const dmgOverTimeOptions = ttkOverAccOptions;
dmgOverTimeOptions.scales.x.min = 0;
dmgOverTimeOptions.scales.y.max = 800;
dmgOverTimeOptions.plugins.title.text = 'Damage Over Time';

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

function create_chart_damage_over_time(canvasId, seconds, showShields)
{	
	let chartDataset = [];
	if(showShields || true) {
		for(let shieldIndex = 0; shieldIndex < shieldOverlayDataset.length; ++shieldIndex) {
			shieldOverlayDataset[shieldIndex].data[1].x = seconds;
		}
		
		chartDataset = shieldOverlayDataset;
	}
	
	let chartOptions = dmgOverTimeOptions;
	chartOptions.scales.x.max = seconds;
	
	let chart = new Chart(canvasId, {
		type: 'line',
		data: {
			datasets: chartDataset
		},
		options: chartOptions
	});
	
	return chart;
}

function update_chart_damage_over_time(chart, datasets, seconds, showShields)
{
	// todo: destroy previous dataset?
	chart.data.datasets = datasets;
	if(showShields) {
		for(let shieldIndex = 0; shieldIndex < shieldOverlayDataset.length; ++shieldIndex) {
			shieldOverlayDataset[shieldIndex].data[1].x = seconds;
		}
		
		chart.data.datasets = chart.data.datasets.concat(shieldOverlayDataset);
	}
	
	chart.update();
}
