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

const HopUpFlags = {
	Disruptor: 1,
};

class DamageModifiers {
	constructor(sh, hp, ac, hr, lr, amp, mk, ff) {
		this.shield = sh; this.health = hp;
		this.accuracy = ac; this.headshotRate = hr; this.legshotRate = lr;
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

/*
class Modifiers {
	constructor(amped, marked, fortified, tacReload, accuracy, headshotRate, legRate) {
		
	}
}

class WeaponMods {
	constructor(mag, stock, bolt, disruptor, hammerpoint) {
		
	}
}*/
