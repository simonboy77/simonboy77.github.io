const clrBackground = 'BD313A';
const clrCommon = '9CACAD';
const clrRare = '51A8D6';
const clrEpic = 'B237C8';
const clrLegendary = 'CEAD21';
const clrMythic = 'FF4E1D';

const xValues = ["None", "Common", "Rare", "Epic"];
const yValues = [19, 23, 27, 29];
const barColors = ["gray", "white","blue","purple"];

const myData = {
  labels: ['test', 'test', 'test', 'test', 'test', 'test', 'test'],
  datasets: [{
    label: 'Gun 1',
    data: [	{x:100,y:1.3},
    		{x:90,y:2.2},
    		{x:75,y:3},
    		{x:60,y:4.9},
    		{x:30,y:6.0},
    		{x:10,y:6.1}
    ],
    fill: false,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }, {
  	label: 'Gun 2',
    data: [	{x:100,y:1.5},
    		{x:90,y:2.1},
    		{x:30,y:5.6},
    		{x:10,y:6.9}
    ],
    fill: false,
    borderColor: 'rgb(12, 102, 192)',
    tension: 0.1
  }]
};

var chart = new Chart('myChart', {
	type: 'line',
	data: myData,
	
	options: {
		scales: {
			x: {
				min: 10,
				max: 100,
				type: 'linear',
				reverse: true
			},
			y: {
				min: 0,
				max: 10
			}
		},
		plugins: {
			title: {
				display: true,
				text: 'TTK Per Accuracy'
				},
			legend: {
				display: false
			}
		}
	}
});

/*var testChart = new Chart("testChart", {
	type: "bar",
	data: {
		labels: xValues,
		datasets: [{
		backgroundColor: barColors,
		data: yValues
		}],
	},
	options: {
		scales: {
			y: {
				min: 0,
			}
		},
		plugins: {
			title: {
				display: true,
				text: "Flatline Mags"
				},
			legend: {
				display: false
			}
		}
	}
});*/

/*
var slider = document.getElementById("magTierCount");

slider.oninput = function() {
	chart.data.labels.push("Goofy");
	chart.update();
}*/

// Damage mods
var armour = document.getElementById
var accuracySlider = document.getElementById("input_accuracy");
var headshotSlider = document.getElementById("input_headshot");
var legshotSlider = document.getElementById("input_legshot");

var accuracyText = document.getElementById("accuracyText");
var headshotText = document.getElementById("headshotText");
var legshotText = document.getElementById("legshotText");

function update_slider_text(slider, text)
{
	text.value = slider.value + "%";
}

function setup_page()
{
	update_slider_text(accuracySlider, accuracyText);
	update_slider_text(headshotSlider, headshotText);
	update_slider_text(legshotSlider, legshotText);
}

accuracySlider.oninput = function() { update_slider_text(this, accuracyText); }

headshotSlider.oninput = function()
{
	update_slider_text(this, headshotText);
	
	if ((Number(headshotSlider.value) + Number(legshotSlider.value)) > 100) {
		legshotSlider.value = 100 - Number(headshotSlider.value);
		update_slider_text(legshotSlider, legshotText);
	}
}

legshotSlider.oninput = function()
{
	update_slider_text(this, legshotText);
	
	if ((Number(headshotSlider.value) + Number(legshotSlider.value)) > 100) {
		headshotSlider.value = 100 - Number(legshotSlider.value);
		update_slider_text(headshotSlider, headshotText);
	}
}

