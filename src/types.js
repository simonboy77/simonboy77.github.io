const Rarity = {
	NONE:      0,
	COMMON:    1,
	RARE:      2,
	EPIC:      3,
	LEGENDARY: 4,
	MYTHIC:    5
};

class Modifiers {
	constructor(amp, mk, ff, tac, ac, hr, lr) {
		this.amped = amp;
		this.marked = mk;
		this.fortified = ff;
		this.tacReload = tac;
		this.accuracy = ac;
		this.headshotRate = hr;
		this.legshotRate = lr;
	}
}

class WeaponModifiers {
	constructor(mag, stock, bolt) {
		this.magRarity = mag;
		this.stockRarity = stock;
		this.shotgunBoltRarity = bolt;
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
