const clrBorder     = '#0D313A';
const clrBackground = '#BD313A';
const clrCommon     = '#9CACAD';
const clrRare       = '#51A8D6';
const clrEpic       = '#B237C8';
const clrLegendary  = '#CEAD21';
const clrMythic     = '#FF4E1D';

const chartLineWidth = 2;

const Rarity = {
	NONE:        0,
	COMMON:      1,
	RARE:        2,
	EPIC:        3,
	LEGENDARY:   4,
	MYTHIC:      5,
	UNAVAILABLE: 6
};

function get_rarity_name(rarity) {
	switch(rarity) {
		case Rarity.NONE:      { return 'No'; } break;
		case Rarity.COMMON:    { return 'Common'; } break;
		case Rarity.RARE:      { return 'Rare'; } break;
		case Rarity.EPIC:	   { return 'Epic'; } break;
		case Rarity.LEGENDARY: { return 'Legendary'; } break;
		case Rarity.MYTHIC:    { return 'Mythic'; } break;
	}

	return 'Unavailable';
}

function get_hop_up_name(hopUp) {
	switch(hopUp) {
		case HopUp.DISRUPTOR: { return 'Disruptor Rounds'; } break;
		case HopUp.HAMMERPOINT: { return 'Hammerpoint Rounds'; } break;
		case HopUp.BOOSTED_LOADER: { return 'Boosted Loader'; } break;
		case HopUp.SPLATTER: { return 'Splatter Rounds'; } break;
		case HopUp.SELECTFIRE: { return 'Selectfire Receiver'; } break;
		case HopUp.TURBO: { return 'Turbocharger'; } break;
	}

	return 'None';
}

const Attachment = {
	MAG:   0x01,
	STOCK: 0x02, // Also counts for sniper stock
	BOLT:  0x04,
};

// Only the ones that are relevenant to damage output (0 means no Hop-Up)
const HopUp = {
	DISRUPTOR:      0x01, // Unimplemented
	HAMMERPOINT:    0x02, // Unimplemented
	BOOSTED_LOADER: 0x04,
	SPLATTER:       0x08,
	SELECTFIRE:     0x10,
	TURBO:          0x20, // Unimplemented

	COUNT:			6, // increment this when adding new ones
};

const Trait = {
	MODDED_LOADER:   0x01, // LMG increase mag capacity and faster reload
};

/*
specials:
- reloading bullets one at a time (ask user if they want to fully reload or do 1-shoot-1-shoot)
*/


function get_shield_health(shieldRarity) {
	switch (shieldRarity) {
		case Rarity.COMMON:    { return 50; } break;
		case Rarity.RARE:      { return 75; } break;
		case Rarity.EPIC:
		case Rarity.LEGENDARY: { return 100; } break;
		case Rarity.MYTHIC:    { return 125; } break;

		default: break;
	}

	return 0;
}

class DamageModifiers {
	constructor(sh, hp, htRt, hdRt, lgRt, ds, amp, mk, ff) {
		this.shield = sh; this.health = hp;
		this.hitRate = htRt; this.headshotRate = hdRt; this.legshotRate = lgRt;
		this.distance = ds;
		this.amped = amp; this.marked = mk; this.fortified = ff;
	}
}

class WeaponModifiers {
	constructor(mag, stock, bolt, hpUp, tac, amp, tr, flw) {
		this.magRarity = mag; this.stockRarity = stock; this.boltRarity = bolt;
		this.hopUp = hpUp;
		this.tacReload = tac, this.ampReload = amp;
		this.traits = tr;

		this.followGlobal = flw;
	}
}

class ChartModifiers {
	constructor(id, tp, sec, sh, minA, maxA) {
		this.canvasId = id;
		this.type = tp;
		this.seconds = sec;
		this.showShields = sh;
		this.minAccuracy = minA; this.maxAccuracy = maxA;
	}
}

function byte_to_hex_string(byte) {
	let hexString = byte.toString(16);
	if(hexString.length == 1) { hexString = '0' + hexString; }

	return hexString;
}

// https://gist.github.com/mjackson/5311256
function hsl_to_hex_string(h, s, l) {
	let r, g, b;

	if (s == 0) {
		r = g = b = l; // achromatic
	} else {
		function hue_to_rgb(p, q, t) {
		  if (t < 0) t += 1;
		  if (t > 1) t -= 1;
		  if (t < 1/6) return p + (q - p) * 6 * t;
		  if (t < 1/2) return q;
		  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
		  return p;
		}

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;

		r = hue_to_rgb(p, q, h + 1/3);
		g = hue_to_rgb(p, q, h);
		b = hue_to_rgb(p, q, h - 1/3);
	}

	r = Math.round(r * 255); g = Math.round(g * 255); b = Math.round(b * 255);
	return ('#' + byte_to_hex_string(r) + byte_to_hex_string(g) + byte_to_hex_string(b));
}

function hex_color_from_index(index) {
	let loopMult = 0.15; // loopin' around the color circle
	let loopLoc = index * loopMult;

	let hue = (loopLoc) % 1.0;
	let sat = 1.0 - ((Math.floor(loopLoc) * 0.2) % 1);

	return hsl_to_hex_string(hue, sat, 0.4);
}
