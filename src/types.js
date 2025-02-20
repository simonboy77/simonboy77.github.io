const clrBorder     = '#0D313A';
const clrBackground = '#BD313A';
const clrCommon     = '#9CACAD';
const clrRare       = '#51A8D6';
const clrEpic       = '#B237C8';
const clrLegendary  = '#CEAD21';
const clrMythic     = '#FF4E1D';

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

const HopUpFlags = {
	Disruptor: 1,
};

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
	constructor(sh, hp, htRt, hdRt, lgRt, amp, mk, ff) {
		this.shield = sh; this.health = hp;
		this.hitRate = htRt; this.headshotRate = hdRt; this.legshotRate = lgRt;
		this.amped = amp; this.marked = mk; this.fortified = ff;
	}
}

class WeaponModifiers {
	constructor(mag, stock, bolt, tac, amp, splat) {
		this.magRarity = mag; this.stockRarity = stock; this.shotgunBoltRarity = bolt;
		this.tacReload = tac, this.ampReload = amp;
		this.splatterRounds = splat;
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

