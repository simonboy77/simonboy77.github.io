// TODO:
// - add get_seconds_per_round function to weapon class, so the shotgun class only needs to 
// overwrite that and get_average_damage/headshot/legshot, and not rewrite the ttk/dpm/dps functions
// - give the modded weapon class another weaponmods instance, but wrapped with a boolean
// 'followGlobal', which is used for individual changes to weapon mods

class Weapon {
	constructor(name, bd, hm, lm, rps, mNone, mCommon, mRare, mEpic, rf, rt) {
		this.name = name;
		this.bodyDamage = bd; this.headshotMultiplier = hm; this.legshotMultiplier = lm;
		
		this.baseRoundsPerSecond = rps;
		this.baseRoundsPerMinute = this.baseRoundsPerSecond * 60.0;
		this.baseSecondsPerRound = 1.0 / this.baseRoundsPerSecond;
		
		this.magSizeNone = mNone; this.magSizeCommon = mCommon;
		this.magSizeRare = mRare; this.magSizeEpic = mEpic;
		
		this.reloadTimeFull = rf; this.reloadTimeTac   = rt;
	}
	
	get_rounds_per_second(weaponMods) {
		return this.baseRoundsPerSecond;
	}
	
	get_seconds_per_round(weaponMods) {
		return (1.0 / this.get_rounds_per_second(weaponMods));
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
	
	get_average_damage_per_shot(damageMods) {
		return this.get_average_damage(damageMods);
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
	
	get_fire_time_per_mag(weaponMods) {
		let totalMagSize = this.get_mag_size(weaponMods);
		let secondsPerRound = this.get_seconds_per_round(weaponMods);
		
		return secondsPerRound * (totalMagSize - 1); // first bullet is instant
	}
	
	calc_dpm(damageMods, weaponMods, onlyBase = false) {
		let totalMagSize = this.get_mag_size(weaponMods, onlyBase);		
		let averageDamage = this.get_average_damage_per_shot(damageMods);
		
		return totalMagSize * averageDamage;
	}
	
	calc_dot(seconds, damageMods, weaponMods) {
		const data = [];
		
		if (!this.validate_weapon(weaponMods)) { return data; }
		if (seconds <= 0.0) {
			console.warn('invalid seconds :', seconds);
			return data;
		}
		
		let totalMagSize = this.get_mag_size(weaponMods);		
		let averageDamage = this.get_average_damage_per_shot(damageMods);
		let secondsPerRound = this.get_seconds_per_round(weaponMods);
		let reloadTime = this.get_reload_time(weaponMods);
		
		let totalDamage = 0.0;
		let secondsPassed = 0.0;
		let curMag = totalMagSize;
		
		while (secondsPassed < seconds) {
			curMag -= 1;
			totalDamage += averageDamage;
			data.push({x:secondsPassed,y:totalDamage});
			
			if(curMag > 0) {
				secondsPassed += secondsPerRound;
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
		let averageDamage = this.get_average_damage_per_shot(damageMods);
		let averageDamagePerMag = this.calc_dpm(damageMods, weaponMods);
		
		let reloadTime = this.get_reload_time(weaponMods);
		let fireTime = this.get_fire_time_per_mag(weaponMods);
		
		let targetHP = damageMods.shield + damageMods.health;
		let secondsPassed = 0.0;
		
		while(targetHP >= averageDamagePerMag) {
			targetHP -= averageDamagePerMag;
			secondsPassed += (fireTime + reloadTime);
		}
		
		let finalRounds = Math.ceil(targetHP / averageDamage);
		let secondsPerRound = this.get_seconds_per_round(weaponMods);
		
		secondsPassed += secondsPerRound * (finalRounds - 1); // first bullet is instant
		
		return secondsPassed;
	}
	
	calc_dps(damageMods, weaponMods) {
		if (!this.validate_weapon(weaponMods)) { return 0.0; }
		
		let damage = this.get_average_damage_per_shot(damageMods);
		let dps = damage * this.get_rounds_per_second(weaponMods);
		
		return dps;
	}
}

class Burst extends Weapon {
	constructor(name, bd, hm, lm, rps, mNone, mCommon, mRare, mEpic, rf, rt, brs, brd) {
		super(name, bd, hm, lm, rps, mNone, mCommon, mRare, mEpic, rf, rt);
		
		this.burstSize = brs;
		this.burstDelay = brd;
	}
	
	get_average_damage_per_burst(damageMods) {
		return (this.get_average_damage_per_shot(damageMods) * this.burstSize);
	}
	
	get_seconds_per_burst(weaponMods) {
		return ((this.burstSize * this.get_seconds_per_round(weaponMods)) + this.burstDelay);
	}
	
	calc_dot(seconds, damageMods, weaponMods) {
		const data = [];
		
		if (!this.validate_weapon(weaponMods)) { return data; }
		if (seconds <= 0.0) {
			console.warn('invalid seconds :', seconds);
			return data;
		}
		
		let totalMagSize = this.get_mag_size(weaponMods);		
		let averageDamage = this.get_average_damage_per_shot(damageMods);
		let secondsPerRound = this.get_seconds_per_round(weaponMods);
		let reloadTime = this.get_reload_time(weaponMods);
		
		let totalDamage = 0.0;
		let secondsPassed = 0.0;
		let curMag = totalMagSize;
		let curBurst = this.burstSize;
		
		while (secondsPassed < seconds) {
			--curMag;
			--curBurst;
			
			totalDamage += averageDamage;
			data.push({x:secondsPassed,y:totalDamage});
			
			if(curMag > 0) {
				if(curBurst > 0) {
					secondsPassed += secondsPerRound;
				}
				else {
					curBurst = this.burstSize;
					secondsPassed += this.burstDelay;
					
					if(secondsPassed > seconds) { secondsPassed = seconds; }
					data.push({x:secondsPassed,y:totalDamage});
				}	
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
		let averageDamage = this.get_average_damage_per_shot(damageMods);
		let averageDamagePerBurst = this.get_average_damage_per_burst(damageMods);
		let averageDamagePerMag = this.calc_dpm(damageMods, weaponMods);
		
		let reloadTime = this.get_reload_time(weaponMods);
		let fireTime = this.get_fire_time_per_mag(weaponMods);
		
		let targetHP = damageMods.shield + damageMods.health;
		let secondsPassed = 0.0;
		
		while(targetHP >= averageDamagePerMag) {
			targetHP -= averageDamagePerMag;
			secondsPassed += (fireTime + reloadTime);
		}
		
		// Apply final bursts
		let finalBursts = Math.floor(targetHP / averageDamagePerBurst);
		let spBurst = this.get_seconds_per_burst(weaponMods);
		
		secondsPassed += spBurst * finalBursts;
		targetHP -= averageDamagePerBurst * finalBursts;
		
		// Apply final rounds
		let finalRounds = Math.ceil(targetHP / averageDamage);
		let spRound = this.get_seconds_per_round(weaponMods);
		
		secondsPassed += spRound * (finalRounds - 1); // first bullet is instant
		
		return secondsPassed;
	}
	
	calc_dps(damageMods, weaponMods) {
		if (!this.validate_weapon(weaponMods)) { return 0.0; }
		
		let dpBurst = this.get_average_damage_per_burst(damageMods);
		let spBurst = this.get_seconds_per_burst(weaponMods);
		let dps = dpBurst / spBurst;
		
		return dps;
	}
}

class Scatter extends Weapon {
	constructor(name, bd, hm, lm, rps, mNone, mCommon, mRare, mEpic, rf, rt, pc) {
		super(name, bd, hm, lm, rps, mNone, mCommon, mRare, mEpic, rf, rt);
		this.projectileCount = pc;
	}
	
	get_average_damage_per_shot(damageMods) {
		let averageDamage = this.get_average_damage(damageMods);
		return (averageDamage * this.projectileCount);
	}
}

class Shotgun extends Scatter {
	constructor(name, bd, hm, lm, rps, mNone, rf, rt, pc) {
		super(name, bd, hm, lm, rps, mNone, mNone, mNone, mNone, rf, rt, pc);
	}
	
	get_rounds_per_second(weaponMods) {
		let rps = this.baseRoundsPerSecond;
		switch(weaponMods.boltRarity)
        {
            case Rarity.COMMON:    { rps *= 1.15; } break;
            case Rarity.RARE:      { rps *= 1.25; } break;
            case Rarity.EPIC:
            case Rarity.LEGENDARY:
            case Rarity.MYTHIC:    { rps *= 1.35; } break;

            default: break;
        }
        
        return rps;
	}
}

class ModdedWeapon {
	constructor(weapon, mods, colorNum) {
		this.weapon = weapon;
		this.weaponMods = cloneDeep(mods);
		
		this.color = hex_color_from_index(colorNum);
	}
	
	get_name() {
		return this.weapon.name;
	}
	
	get_description(globalWeaponMods) {
		let description = this.get_name();
		
		if(this.weaponMods.magRarity != globalWeaponMods.magRarity) {
			description += ' (' + get_rarity_name(this.weaponMods.magRarity) + ' Mag)';
		}
		
		return description;
	}
	
	calc_dpm(damageMods) {
		return this.weapon.calc_dpm(damageMods, this.weaponMods, true);
	}
	
	calc_dot(seconds, damageMods) {
		return this.weapon.calc_dot(seconds, damageMods, this.weaponMods);
	}
	
	calc_ttk(damageMods) {
		return this.weapon.calc_ttk(damageMods, this.weaponMods);
	}
	
	calc_dps(damageMods) {
		return this.weapon.calc_dps(damageMods, this.weaponMods);
	}
}

const weapons_S24 = [
	// Havoc
	new Weapon('Flatline', 19.0, 1.3, 0.75, 10.0, 19, 23, 27, 29, 3.1, 2.4),
	new Burst('Hemlok', 20.0, 1.3, 0.75, 15.5, 18, 21, 24, 30, 2.85, 2.4, 3, 0.3), 
	new Weapon('R-301', 14.0, 1.3, 0.75, 13.5, 21, 23, 28, 31, 3.2, 2.4),
	// Nemesis
	new Weapon('Alternator', 18.0, 1.2, 0.8, 10.0, 19, 23, 26, 28, 2.23, 1.9),
	new Burst('Prowler', 16.0, 1.2, 0.8, 21.0, 20, 25, 30, 35, 2.6, 2.0, 5, 0.28),
	new Weapon('R-99', 13.0, 1.2, 0.8, 18.0, 17, 20, 23, 26, 2.45, 1.8),
	new Weapon('Volt', 16.0, 1.25, 0.8, 12.0, 19, 21, 23, 26, 2.03, 1.44),
	new Weapon('C.A.R.', 14.0, 1.25, 0.8, 15.4, 19, 22, 24, 27, 2.13, 1.7),
	// Devotion
	// L-STAR
	new Weapon('Spitfire', 21.0, 1.25, 0.85, 9.0, 35, 40, 45, 50, 4.2, 3.4),
	// Rampage
	new Weapon('Scout', 35.0, 1.6, 0.75, 3.9, 10, 15, 18, 20, 3.0, 2.4),
	new Scatter('Triple_Take', 22.0, 1.6, 0.9, 1.45, 6, 7, 8, 10, 3.4, 2.6, 3),
	// 30-30
	// Bocek
	// Charge_Rifle
	new Weapon('Longbow', 60.0, 2.25, 0.9, 1.3, 6, 8, 10, 12, 3.66, 2.66),
	//new Burst('Kraber')
	// Sentinel
	new Shotgun('EVA-8', 7.0, 1.25, 1.0, 2.6, 8, 3.0, 2.75, 8),
	// Mastiff
	new Shotgun('Mozambique', 15.0, 1.25, 1.0, 2.66, 5, 2.6, 2.1, 3),
	// Peacekeeper
	new Weapon('RE-45', 14.0, 1.5, 0.9, 13.0, 18, 20, 23, 26, 1.95, 1.5),
	new Weapon('P2020', 24.0, 1.25, 0.9, 7.0, 10, 11, 12, 14, 1.25, 1.25),
	new Weapon('Wingman', 48.0, 1.5, 0.9, 2.6, 5, 6, 7, 8, 2.1, 2.1)
];

