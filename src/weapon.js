class Weapon {
	constructor(name, bd, hm, lm, rps, mNone, mCommon, mRare, mEpic, rf, rt) {
		this.name = name;
		this.bodyDamage = bd; this.headshotMultiplier = hm; this.legshotMultiplier = lm;
		
		this.roundsPerSecond = rps;
		this.roundsPerMinute = this.roundsPerSecond * 60.0;
		this.secondsPerRound = 1.0 / this.roundsPerSecond;
		
		this.magSizeNone = mNone; this.magSizeCommon = mCommon;
		this.magSizeRare = mRare; this.magSizeEpic = mEpic;
		
		this.reloadTimeFull = rf; this.reloadTimeTac   = rt;
	}
	
	get_mag_size(weaponMods, onlyBase = false) {
		let magSize = this.magSizeNone;
		
		switch(weaponMods.magRarity) {
			case Rarity.COMMON: { magSize = this.magSizeCommon; } break;
			case Rarity.RARE:   { magSize = this.magSizeRare; } break;
			case Rarity.EPIC:
			case Rarity.LEGENDARY:
			case Rarity.MYTHIC: { magSize = this.magSizeEpic; } break;
		}
		
		if(!onlyBase) {
			if(weaponMods.tacReload) { magSize -= 1; }
		}
		
		return magSize;
	}
	
	get_reload_time(weaponMods) {
		let reloadTime = (weaponMods.tacReload) ? this.reloadTimeTac : this.reloadTimeFull;
		
		switch(weaponMods.stockRarity) {
			case Rarity.COMMON:  { reloadTime *= 0.967; } break; // -3.3%
			case Rarity.RARE:    { reloadTime *= 0.933; } break; // -6.7%
			case Rarity.EPIC:
			case Rarity.LEGENDARY: { reloadTime *= 0.9; } break; // -10%
			
			default: break;
		}
		
		if(weaponMods.ampReload) { reloadTime *= 0.6; } // -40%
		if(weaponMods.splatterRounds) { reloadTime *= 0.75; } // -25%
		return reloadTime;
	}
	
	get_body_damage(damageMods, doRounding = true) {
		let damage = this.bodyDamage;
		
		if(damageMods.amped) { damage *= 1.2; }
		if(damageMods.marked) { damage *= 1.15; }
		if(damageMods.fortified) { damage *= 0.85; }
		if(doRounding) { damage = Math.round(damage); }
		
		return damage;
	}
	
	get_headshot_damage(damageMods, doRounding = true) {
		let damage = this.get_body_damage(damageMods, false) * this.headshotMultiplier;
		if(doRounding) { damage = Math.round(damage); }
		
		return damage;
	}
	
	get_legshot_damage(damageMods, doRounding = true) {
		let damage = this.get_body_damage(damageMods, false) * this.legshotMultiplier;
		if(doRounding) { damage = Math.round(damage); }
		
		return damage;
	}
	
	get_average_damage(damageMods, doRounding = true) {
		let averageDamage = 0.0;
		let bodyshotRate = 1.0;
		
		if(damageMods.headshotRate > 0.0) {
			let headshotDamage = this.get_headshot_damage(damageMods);
			averageDamage += headshotDamage * damageMods.headshotRate;
			bodyshotRate -= damageMods.headshotRate;
		}
		
		if(damageMods.legshotRate > 0.0) {
			let legshotDamage = this.get_legshot_damage(damageMods);
			averageDamage += legshotDamage * damageMods.legshotRate;
			bodyshotRate -= damageMods.legshotRate;
		}
		
		averageDamage += this.get_body_damage(damageMods) * bodyshotRate;
		averageDamage *= damageMods.hitRate;
		if(doRounding) { averageDamage = Math.round(averageDamage); }
		
		return averageDamage;
	}
	
	validate_weapon(weaponMods) {
		if (this.bodyDamage <= 0.0) {
			console.warn('invalid bodyDamage: ', this.bodyDamage);
			return false;
		}
		else if (this.get_mag_size(weaponMods) <= 0) {
			console.warn('invalid magSize: ', this.get_mag_size(weaponMods));
			return false;
		}
		
		return true;
	}
	
	get_damage_per_mag(damageMods, weaponMods, onlyBase = false) {
		let totalMagSize = this.get_mag_size(weaponMods, onlyBase);		
		let averageDamage = this.get_average_damage(damageMods);
		
		return totalMagSize * averageDamage;
	}
	
	get_fire_time_per_mag(weaponMods) {
		let totalMagSize = this.get_mag_size(weaponMods);
		return this.secondsPerRound * (totalMagSize - 1); // first bullet is instant
	}
	
	fire_for_time(seconds, damageMods, weaponMods) {
		const data = [];
		
		if (!this.validate_weapon(weaponMods)) { return data; }
		if (seconds <= 0.0) {
			console.warn('invalid seconds :', seconds);
			return data;
		}
		
		let totalMagSize = this.get_mag_size(weaponMods);		
		let averageDamage = this.get_average_damage(damageMods);
		let reloadTime = this.get_reload_time(weaponMods);
		
		let totalDamage = 0.0;
		let secondsPassed = 0.0;
		let curMag = totalMagSize;
		
		while (secondsPassed < seconds) {
			curMag -= 1;
			totalDamage += averageDamage;
			data.push({x:secondsPassed,y:totalDamage});
			
			if(curMag > 0) {
				secondsPassed += this.secondsPerRound;
			}
			else {
				curMag = totalMagSize;
				secondsPassed += reloadTime;
				
				if(secondsPassed > seconds) { secondsPassed = seconds; }
				data.push({x:secondsPassed,y:totalDamage});
			}
		}
		
		return data;
	}
	
	calc_ttk(damageMods, weaponMods) {
		if (!this.validate_weapon(weaponMods)) { return 0.0; }
		
		let totalMagSize = this.get_mag_size(weaponMods);		
		let averageDamage = this.get_average_damage(damageMods);
		let averageDamagePerMag = this.get_damage_per_mag(damageMods, weaponMods);
		
		let reloadTime = this.get_reload_time(weaponMods);
		let fireTime = this.get_fire_time_per_mag(weaponMods);
		
		let targetHP = damageMods.shield + damageMods.health;
		let secondsPassed = 0.0;
		
		while(targetHP >= averageDamagePerMag) {
			targetHP -= averageDamagePerMag;
			secondsPassed += (fireTime + reloadTime);
		}
		
		let finalRounds = Math.ceil(targetHP / averageDamage);
		secondsPassed += this.secondsPerRound * (finalRounds - 1); // first bullet is instant
		
		return secondsPassed;
	}
}

class Shotgun extends Weapon {
	constructor(pc, bd, hm, lm) {
		super(bd, hm, lm);
		
		this.pelletCount = pc;
	}
}

class ModdedWeapon {
	constructor(weapon, weaponMods) {
		this.weapon = weapon;
		this.weaponMods = weaponMods;
		
		let letters = '0123456789ABCDEF';
		this.color = '#';
		for (let charIndex = 0; charIndex < 6; ++charIndex) {
			this.color += letters[Math.floor(Math.random() * 16)];
		}
	}
	
	get_name() {
		return this.weapon.name;
	}
	
	calc_ttk(damageMods) {
		return this.weapon.calc_ttk(damageMods, this.weaponMods);
	}
	
	fire_for_time(seconds, damageMods) {
		return this.weapon.fire_for_time(seconds, damageMods, this.weaponMods);
	}
	
	get_damage_per_mag(damageMods) {
		return this.weapon.get_damage_per_mag(damageMods, this.weaponMods, true);
	}
}

const weapons_S24 = [
	// Havoc
	new Weapon('Flatline', 19.0, 1.3, 0.75, 10.0, 19, 23, 27, 29, 3.1, 2.4),
	// Hemlok
	new Weapon('R-301', 14.0, 1.3, 0.75, 13.5, 21, 23, 28, 31, 3.2, 2.4),
	// Nemesis
	new Weapon('Alternator', 18.0, 1.2, 0.8, 10.0, 19, 23, 26, 28, 2.23, 1.9),
	// Prowler
	new Weapon('R-99', 13.0, 1.2, 0.8, 18.0, 17, 20, 23, 26, 2.45, 1.8),
	new Weapon('Volt', 15.0, 1.25, 0.8, 12.0, 19, 21, 23, 26, 2.03, 1.44),
	new Weapon('C.A.R.', 14.0, 1.25, 0.8, 15.4, 19, 22, 24, 27, 2.13, 1.7),
	// Devotion
];

