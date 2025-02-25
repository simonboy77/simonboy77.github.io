class Weapon {
	constructor(name, bd, hm, lm, rps, mNone, mCommon, mRare, mEpic, rf, rt, ps, cpbA, cpbH,
	            bb, rb) {
		this.name = name;
		this.bodyDamage = bd; this.headshotMultiplier = hm; this.legshotMultiplier = lm;
		
		this.baseRoundsPerSecond = rps;
		this.baseRoundsPerMinute = this.baseRoundsPerSecond * 60.0;
		this.baseSecondsPerRound = 1.0 / this.baseRoundsPerSecond;
		
		this.magSizeNone = mNone; this.magSizeCommon = mCommon;
		this.magSizeRare = mRare; this.magSizeEpic = mEpic;
		
		this.reloadTimeFull = rf; this.reloadTimeTac = rt;
		this.magBonusBL = bb; this.reloadTimeBoosted = rb;
		
		// meters per second (ps is in hammer units, 1hu = 0.025375m)
		this.projectileMPS = ps * 0.025375;
		this.projectileSPM = 1.0 / this.projectileMPS;
		
		this.compatibleAttachments = cpbA;
		this.compatibleHopUps = cpbH;
	}
	
	get_rounds_per_second(weaponMods) {
		return this.baseRoundsPerSecond;
	}
	
	get_seconds_per_round(weaponMods) {
		return (1.0 / this.get_rounds_per_second(weaponMods));
	}
	
	get_bullet_count_from_mag_rarity(weaponMods) {
		let magSize = this.magSizeNone;
		
		switch(weaponMods.magRarity) {
			case Rarity.COMMON: { magSize = this.magSizeCommon; } break;
			case Rarity.RARE:   { magSize = this.magSizeRare; } break;
			case Rarity.EPIC:
			case Rarity.LEGENDARY:
			case Rarity.MYTHIC: { magSize = this.magSizeEpic; } break;
		}
		
		return magSize;
	}
	
	get_mag_size(weaponMods, onlyBase = false) {
		return calc_mag_size_auto(this, weaponMods, onlyBase);
	}

	get_reload_time(weaponMods) {
		let reloadTime = this.reloadTimeFull;
		if(weaponMods.tacReload) {
			if(weaponMods.hopUp & HopUp.BOOSTED_LOADER) { reloadTime = this.reloadTimeBoosted; }
			else { reloadTime = this.reloadTimeTac; }
		}
		
		switch(weaponMods.stockRarity) {
			case Rarity.COMMON:  { reloadTime *= 0.967; } break; // -3.3%
			case Rarity.RARE:    { reloadTime *= 0.933; } break; // -6.7%
			case Rarity.EPIC:
			case Rarity.LEGENDARY: { reloadTime *= 0.9; } break; // -10%
			
			default: break;
		}
		
		if(weaponMods.ampReload) { reloadTime *= 0.6; } // -40%
		if(weaponMods.hopUp & HopUp.SPLATTER) { reloadTime *= 0.75; } // -25%
		
		return reloadTime;
	}
	
	get_fire_delay(weaponMods) { // How much time before the gun gets started
		return 0;
	}
	
	get_first_hit_delay(damageMods, weaponMods) {
		let distanceDelay = (this.projectileSPM * damageMods.distance);
		let fireDelay = this.get_fire_delay(weaponMods);
		
		return distanceDelay + fireDelay;
	}
	
	get_body_damage(damageMods, weaponMods) {
		return this.bodyDamage;
	}
	
	get_modded_body_damage(damageMods, weaponMods, doRounding = true) {
		let damage = this.get_body_damage(damageMods, weaponMods);
		
		if(damageMods.amped) { damage *= 1.2; }
		if(damageMods.marked) { damage *= 1.15; }
		if(damageMods.fortified) { damage *= 0.85; }
		
		if(doRounding) { damage = Math.round(damage); }
		return damage;
	}
	
	get_headshot_damage(damageMods, weaponMods, doRounding = true) {
		let damage = this.get_modded_body_damage(damageMods, weaponMods, false);
		damage *= this.headshotMultiplier;
		
		if(doRounding) { damage = Math.round(damage); }
		return damage;
	}
	
	get_legshot_damage(damageMods, weaponMods, doRounding = true) {
		let damage = this.get_modded_body_damage(damageMods, weaponMods, false);
		damage *= this.legshotMultiplier;
		
		if(doRounding) { damage = Math.round(damage); }
		return damage;
	}
	
	get_average_damage(damageMods, weaponMods, doRounding = true) {
		let averageDamage = 0.0;
		let bodyshotRate = 1.0;
		
		if(damageMods.headshotRate > 0.0) {
			let headshotDamage = this.get_headshot_damage(damageMods, weaponMods);
			averageDamage += headshotDamage * damageMods.headshotRate;
			bodyshotRate -= damageMods.headshotRate;
		}
		
		if(damageMods.legshotRate > 0.0) {
			let legshotDamage = this.get_legshot_damage(damageMods, weaponMods);
			averageDamage += legshotDamage * damageMods.legshotRate;
			bodyshotRate -= damageMods.legshotRate;
		}
		
		averageDamage += this.get_modded_body_damage(damageMods, weaponMods) * bodyshotRate;
		averageDamage *= damageMods.hitRate;
		if(doRounding) { averageDamage = Math.round(averageDamage); }
		
		return averageDamage;
	}
	
	get_average_damage_per_shot(damageMods, weaponMods) {
		return this.get_average_damage(damageMods, weaponMods);
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
	
	calc_fire_time_per_mag(weaponMods) {
		return calc_fire_time_per_mag_auto(this, weaponMods);
	}
	
	calc_dpm(damageMods, weaponMods, onlyBase = false) {
		return calc_dpm_general(this, damageMods, weaponMods, onlyBase);
	}
	
	calc_dot(seconds, damageMods, weaponMods) {
		return calc_dot_auto(this, seconds, damageMods, weaponMods);
	}
	
	calc_ttk(damageMods, weaponMods) {
		return calc_ttk_auto(this, damageMods, weaponMods);
	}
	
	calc_dps(damageMods, weaponMods) {
		return calc_dps_auto(this, damageMods, weaponMods);
	}
}

class Burst extends Weapon {
	constructor(name, bd, hm, lm, rps, mNone, mCommon, mRare, mEpic, rf, rt, ps,
	            brs, brd, cpbA, cpbH, bb, rb) {
		super(name, bd, hm, lm, rps, mNone, mCommon, mRare, mEpic, rf, rt, ps, cpbA, cpbH, bb, rb);
		
		this.burstSize = brs;
		this.burstDelay = brd;
	}
	
	get_mag_size(weaponMods, onlyBase = false) {
		return calc_mag_size_burst(this, weaponMods, onlyBase);
	}
	
	get_average_damage_per_burst(damageMods, weaponMods) {
		return (this.get_average_damage_per_shot(damageMods, weaponMods) * this.burstSize);
	}
	
	get_seconds_per_burst(weaponMods) {
		// -1 because only time between bullets has a delay
		return this.get_seconds_per_round(weaponMods) * (this.burstSize - 1);
	}
	
	calc_fire_time_per_mag(weaponMods) {
		return calc_fire_time_per_mag_burst(this, weaponMods);
	}
	
	calc_dot(seconds, damageMods, weaponMods) {
		return calc_dot_burst(this, seconds, damageMods, weaponMods);
	}
	
	calc_ttk(damageMods, weaponMods) {
		return calc_ttk_burst(this, damageMods, weaponMods);
	}
	
	calc_dps(damageMods, weaponMods) {
		return calc_dps_burst(this, damageMods, weaponMods);
	}
}

class Prowler extends Burst {
	constructor(name, bd, hm, lm, rpsB, rpsA, mNone, mCommon, mRare, mEpic, rf, rt, ps,
	            brs, brd, cpbA, cpbH, bb, rb) {
		super(name, bd, hm, lm, rpsB, mNone, mCommon, mRare, mEpic, rf, rt, ps, brs, brd,
		      cpbA, cpbH, bb, rb);
		
		this.baseRoundsPerSecondAuto = rpsA;
		this.baseRoundsPerMinuteAuto = this.baseRoundsPerSecondAuto * 60.0;
		this.baseSecondsPerRoundAuto = 1.0 / this.baseRoundsPerSecondAuto;
	}
	
	get_rounds_per_second(weaponMods) {
		if(weaponMods.hopUp & HopUp.SELECTFIRE) {
			return this.baseRoundsPerSecondAuto;
		} else {
			return this.baseRoundsPerSecond;
		}
	}
	
	get_mag_size(weaponMods, onlyBase = false) {
		if(weaponMods.hopUp & HopUp.SELECTFIRE) {
			return calc_mag_size_auto(this, weaponMods, onlyBase);
		} else {
			return calc_mag_size_burst(this, weaponMods, onlyBase);
		}
	}
	
	calc_fire_time_per_mag(weaponMods) {
		if(weaponMods.hopUp & HopUp.SELECTFIRE) {
			return calc_fire_time_per_mag_auto(this, weaponMods);
		} else {
			return calc_fire_time_per_mag_burst(this, weaponMods);
		}
	}
	
	calc_dot(seconds, damageMods, weaponMods) {
		if(weaponMods.hopUp & HopUp.SELECTFIRE) {
			return calc_dot_auto(this, seconds, damageMods, weaponMods);
		} else {
			return calc_dot_burst(this, seconds, damageMods, weaponMods);
		}
	}
	
	calc_ttk(damageMods, weaponMods) {
		if(weaponMods.hopUp & HopUp.SELECTFIRE) {
			return calc_ttk_auto(this, damageMods, weaponMods);
		} else {
			return calc_ttk_burst(this, damageMods, weaponMods);
		}
	}
	
	calc_dps(damageMods, weaponMods) {
		if(weaponMods.hopUp & HopUp.SELECTFIRE) {
			return calc_dps_auto(this, damageMods, weaponMods);
		} else {
			return calc_dps_burst(this, damageMods, weaponMods);
		}
	}
}

class Scatter extends Weapon {
	constructor(name, bd, hm, lm, rps, mNone, mCommon, mRare, mEpic, rf, rt, ps, pc,
	            cpbA, cpbH, bb, rb) {
		super(name, bd, hm, lm, rps, mNone, mCommon, mRare, mEpic, rf, rt, ps, cpbA, cpbH, bb, rb);
		this.projectileCount = pc;
	}
	
	get_average_damage_per_shot(damageMods, weaponMods) {
		let averageDamage = this.get_average_damage(damageMods, weaponMods);
		return (averageDamage * this.projectileCount);
	}
}

class Shotgun extends Scatter {
	constructor(name, bd, hm, lm, rps, mNone, rf, rt, ps, pc, cpbA, cpbH, bb, rb) {
		super(name, bd, hm, lm, rps, mNone, mNone, mNone, mNone, rf, rt, ps, pc,
		      cpbA, cpbH, bb, rb);
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

class ChargeRifle extends Weapon {
	constructor(name, bdMin, bdMax, dsMin, dsMax, hm, lm, rps, rpsA, chg, chgA, mNone, mCommon,
	            mRare, mEpic, rf, rt, ps, cpbA, cpbH, bb, rb) {
		super(name, bdMin, hm, lm, rps, mNone, mCommon, mRare, mEpic, rf, rt, ps,
		      cpbA, cpbH, bb, rb);

		this.minDamage = bdMin;	this.maxDamage = bdMax;
		this.minDistance = dsMin; this.maxDistance = dsMax;
		
		this.damageRange = bdMax - bdMin; this.distanceRange = dsMax - dsMin;
		this.damageDistanceRatio = this.damageRange / this.distanceRange;

		this.baseRoundsPerSecondAuto = rpsA;
		this.baseRoundsPerMinuteAuto = this.baseRoundsPerSecondAuto * 60.0;
		this.baseSecondsPerRoundAuto = 1.0 / this.baseRoundsPerSecondAuto;
		
		this.chargeDelay = chg;	this.chargeDelayAuto = chgA;
	}
	
	get_rounds_per_second(weaponMods) {
		if(weaponMods.hopUp & HopUp.SELECTFIRE) {
			return this.baseRoundsPerSecondAuto;
		} else {
			return this.baseRoundsPerSecond;
		}
	}
	
	get_fire_delay(weaponMods) {
		if(weaponMods.hopUp & HopUp.SELECTFIRE) {
			return this.chargeDelayAuto;
		} else {
			return this.chargeDelay;
		}
	}
	
	get_body_damage(damageMods, weaponMods) {
		let damage = 0;
		if(damageMods.distance <= this.minDistance) {
			damage = this.minDamage;
		} else if(damageMods.distance >= this.maxDistance) {
			damage = this.maxDamage;
		} else {
			let distanceFromMin = damageMods.distance - this.minDistance;
			damage = this.minDamage + (this.damageDistanceRatio * distanceFromMin);
		}
		
		if(weaponMods.hopUp & HopUp.SELECTFIRE) { damage *= 0.75; } // -25%
		return Math.floor(damage);
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
	new Weapon('Flatline', 19.0, 1.3, 0.75, 10.0, 19, 23, 27, 29, 3.1, 2.4, 24000,
				Attachment.MAG | Attachment.STOCK, HopUp.SPLATTER, 0, 2.4),
	new Burst('Hemlok', 20.0, 1.3, 0.75, 15.5, 18, 21, 24, 30, 2.85, 2.4, 27500, 3, 0.3,
				Attachment.MAG | Attachment.STOCK, HopUp.SPLATTER, 0, 2.4), 
	new Weapon('R-301', 14.0, 1.3, 0.75, 13.5, 21, 23, 28, 31, 3.2, 2.4, 29000,
				Attachment.MAG | Attachment.STOCK, HopUp.SPLATTER, 0, 2.4),
	// Nemesis
	new Weapon('Alternator', 18.0, 1.2, 0.8, 10.0, 19, 23, 26, 28, 2.23, 1.9, 19000,
				Attachment.MAG | Attachment.STOCK, 0, 0, 1.9),
	new Prowler('Prowler', 16.0, 1.2, 0.8, 21.0, 13.25, 20, 25, 30, 35, 2.6, 2.0, 18000, 5, 0.28,
				Attachment.MAG | Attachment.STOCK, HopUp.SELECTFIRE | HopUp.SPLATTER, 0, 2.0),
	new Weapon('R-99', 13.0, 1.2, 0.8, 18.0, 17, 20, 23, 26, 2.45, 1.8, 19000,
				Attachment.MAG | Attachment.STOCK, HopUp.SPLATTER, 0, 1.8),
	new Weapon('Volt', 16.0, 1.25, 0.8, 12.0, 19, 21, 23, 26, 2.03, 1.44, 20000,
				Attachment.MAG | Attachment.STOCK, 0, 0, 1.44),
	new Weapon('C.A.R.', 14.0, 1.25, 0.8, 15.4, 19, 22, 24, 27, 2.13, 1.7, 18000,
				Attachment.MAG | Attachment.STOCK, 0, 0, 1.7),
	// Devotion
	// L-STAR
	new Weapon('Spitfire', 21.0, 1.25, 0.85, 9.0, 35, 40, 45, 50, 4.2, 3.4, 27500,
				Attachment.MAG | Attachment.STOCK, HopUp.SPLATTER, 0, 3.4),
	// Rampage
	new Weapon('Scout', 35.0, 1.6, 0.75, 3.9, 10, 15, 18, 20, 3.0, 2.4, 30000,
				Attachment.MAG | Attachment.STOCK, 0, 0, 2.4),
	new Scatter('Triple_Take', 22.0, 1.6, 0.9, 1.45, 6, 7, 8, 10, 3.4, 2.6, 32000, 3,
				Attachment.MAG | Attachment.STOCK, HopUp.BOOSTED_LOADER, 2, 1.4),
	// 30-30
	// Bocek
	new ChargeRifle('Charge_Rifle', 75.0, 110.0, 50.0, 200.0, 2.0, 0.9, 0.616, 1.394, 0.868,
	                  0.317, 6, 7, 8, 9, 4.6, 3.5, 33999,
	                  Attachment.MAG | Attachment.STOCK, HopUp.SELECTFIRE, 0, 3.5),
	new Weapon('Longbow', 60.0, 2.25, 0.9, 1.3, 6, 8, 10, 12, 3.66, 2.66, 30500,
				Attachment.MAG | Attachment.STOCK, HopUp.SPLATTER, 0, 2.66),
	//new Burst('Kraber')
	// Sentinel
	new Shotgun('EVA-8', 7.0, 1.25, 1.0, 2.6, 8, 3.0, 2.75, 16000, 8,
				Attachment.STOCK | Attachment.BOLT, HopUp.BOOSTED_LOADER | HopUp.SPLATTER, 2, 1.4),
	// Mastiff
	new Shotgun('Mozambique', 15.0, 1.25, 1.0, 2.66, 5, 2.6, 2.1, 10000, 3,
				Attachment.BOLT, HopUp.SPLATTER, 0, 2.1),
	// Peacekeeper
	new Weapon('RE-45', 14.0, 1.5, 0.9, 13.0, 18, 20, 23, 26, 1.95, 1.5, 19500,
				Attachment.MAG, HopUp.SPLATTER, 0, 1.5),
	new Weapon('P2020', 24.0, 1.25, 0.9, 7.0, 10, 11, 12, 14, 1.25, 1.25, 18500,
				Attachment.MAG, HopUp.SPLATTER, 0, 1.25),
	new Weapon('Wingman', 48.0, 1.5, 0.9, 2.6, 5, 6, 7, 8, 2.1, 2.1, 18000,
				Attachment.MAG, HopUp.BOOSTED_LOADER | HopUp.SPLATTER, 2, 1.4)
];

