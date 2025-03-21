/*

fire mode takes care of:
- auto prowler
- auto charge rifle
- akimbo
- sentinel charge up
- rampage rev up
- bow spread/single
- havoc beam

*/

class FireMode {
	constructor(name, bodyDamage, headshotMultiplier, legshotMultiplier, roundsPerSecond, magNone,
		        magCommon, magRare, magEpic, reloadFull, reloadTac, projectileSpeed, misc) {
		this.name = name;
		this.bodyDamage = bodyDamage;
		this.headshotMultiplier = headshotMultiplier; this.legshotMultiplier = legshotMultiplier;

		this.baseRoundsPerSecond = roundsPerSecond;

		this.magSizeNone = magNone; this.magSizeCommon = magCommon;
		this.magSizeRare = magRare; this.magSizeEpic = magEpic;

		this.reloadFull = reloadFull; this.reloadTac = reloadTac;

		// meters per second (ps is in hammer units, 1hu = 0.025375m)
		this.projectileMPS = projectileSpeed * 0.025375;
		this.projectileSPM = (this.projectileMPS > 0.0) ? (1.0 / this.projectileMPS) : 0.0;

		// Optionals
		this.projectileCount = (misc.projectileCount) ? misc.projectileCount : 1;
		this.burstSize = misc.burstSize; // if undefined use auto calculations
		this.burstDelay = misc.burstDelay;

		this.rechamberTime = (misc.rechamberTime) ? misc.rechamberTime : 0.0;
		this.fireDelay = (misc.fireDelay) ? misc.fireDelay : 0.0;
		this.ammoPerShot = (misc.ammoPerShot) ? misc.ammoPerShot : 1;

		this.needsSelectfire = (misc.needsSelectfire) ? misc.needsSelectfire : false;

		// For charge rifle
		this.minBodyDamage = bodyDamage;
		this.maxBodyDamage = (misc.maxBodyDamage) ? misc.maxBodyDamage : bodyDamage;
		this.bodyDamageRange = this.maxBodyDamage - this.minBodyDamage;

		// For nemesis
		this.unchargedBurstDelay = this.burstDelay;
		this.chargedBurstDelay = (misc.chargedBurstDelay) ? misc.chargedBurstDelay : 0.0;
		this.burstDelayRange = this.chargedBurstDelay - this.unchargedBurstDelay;
		this.chargePerBurst = (misc.chargePerBurst) ? misc.chargePerBurst : 0.0;
	}
}

class Weapon {
	constructor(name, fireModes, cpbAttachments, cpbHopUps, cpbTraits, misc) {
		this.name = name;
		this.fireModes = fireModes;	this.fireModeIndex = 0;

		this.compatibleAttachments = cpbAttachments;
		this.compatibleHopUps = cpbHopUps;
		this.compatibleTraits = cpbTraits;

		// Misc
		this.reloadBoosted = misc.reloadBoosted;
		this.magBonusBoosted = misc.magBonusBoosted;

		this.maxRoundsPerSecond = misc.maxRoundsPerSecond;
		this.maxRoundsPerSecondStep = misc.maxRoundsPerSecondStep;
		this.maxRoundsPerSecondShots = misc.maxRoundsPerSecondShots;
		this.maxRoundsPerSecondCooldown = misc.maxRoundsPerSecondCooldown;

		this.minDistance = misc.minDistance;
		this.maxDistance = misc.maxDistance;
		this.distanceRange = this.maxDistance - this.minDistance;
	}

	get_fire_mode() { return this.fireModes[this.fireModeIndex]; }
	get_fire_mode_count() {	return this.fireModes.length }
	get_fire_mode_name(index) { return this.fireModes[index].name; }
	get_fire_mode_index() { return this.fireModeIndex; }
	set_fire_mode_index(index) { this.fireModeIndex = index; }

	get_fire_delay() { return this.get_fire_mode().fireDelay; }
	get_ammo_per_shot() { return this.get_fire_mode().ammoPerShot; }
	get_burst_size() { return this.get_fire_mode().burstSize; }
	get_burst_delay() { return this.get_fire_mode().burstDelay; }

	is_burst_weapon() {
		let fireMode = this.get_fire_mode();
		return (fireMode.burstSize && (fireMode.burstDelay > 0.0));
	}

	is_nemesis() {
		let fireMode = this.get_fire_mode();
		let isNemesis = ((fireMode.chargedBurstDelay > 0.0) && (fireMode.chargePerBurst > 0.0));
		return (this.is_burst_weapon() && isNemesis);
	}

	get_rounds_per_second(weaponMods) {
		let rps = this.get_fire_mode().baseRoundsPerSecond;

		if(this.compatibleAttachments & Attachment.BOLT) {
			switch(weaponMods.boltRarity) {
				case Rarity.COMMON:    { rps *= 1.08; } break; // +15%
				case Rarity.RARE:      { rps *= 1.15; } break; // +25%
				case Rarity.EPIC:
				case Rarity.LEGENDARY:
				case Rarity.MYTHIC:    { rps *= 1.24; } break; // +35%

				default: break;
			}
		}

		return rps;
	}

	get_delay_per_round(weaponMods) {
		let spr = 1.0 / this.get_rounds_per_second(weaponMods);
		return (spr + this.get_fire_mode().rechamberTime);
	}

	get_seconds_per_burst(weaponMods) {
		return (this.get_delay_per_round(weaponMods) * this.get_burst_size());
	}

	get_bullet_count_from_mag_rarity(weaponMods) {
		let fireMode = this.get_fire_mode();
		let magSize = fireMode.magSizeNone;

		switch(weaponMods.magRarity) {
			case Rarity.COMMON: { magSize = fireMode.magSizeCommon; } break;
			case Rarity.RARE:   { magSize = fireMode.magSizeRare; } break;
			case Rarity.EPIC:
			case Rarity.LEGENDARY:
			case Rarity.MYTHIC: { magSize = fireMode.magSizeEpic; } break;
		}

		return magSize;
	}

	get_mag_size(weaponMods, onlyBase = false) {
		let magSize = this.get_bullet_count_from_mag_rarity(weaponMods);

		if(!onlyBase) {
			let ammoPerShot = this.get_ammo_per_shot();
			if(weaponMods.tacReload && (magSize > ammoPerShot)) { // Reduce mag by one shot/burst
				let burstSize = this.get_burst_size();
				if(burstSize) {
					let ammoPerBurst = burstSize * ammoPerShot;
					magSize = ammoPerBurst * (Math.ceil(magSize / ammoPerBurst) - 1);
				} else {
					magSize = ammoPerShot * (Math.ceil(magSize / ammoPerShot) - 1);
				}
			}
		}

		if(weaponMods.traits & Trait.MODDED_LOADER) { magSize = Math.floor(magSize * 1.15) } // +15%
		return magSize;
	}

	get_shot_count(weaponMods) {
		let magSize = this.get_mag_size(weaponMods);
		let ammoPerShot = this.get_ammo_per_shot();

		return (magSize / ammoPerShot);
	}

	get_reload_time(weaponMods) {
		let fireMode = this.get_fire_mode();
		let reloadTime = fireMode.reloadFull;

		if(weaponMods.tacReload) {
			if(weaponMods.hopUp & HopUp.BOOSTED_LOADER) { reloadTime = this.reloadBoosted; }
			else { reloadTime = fireMode.reloadTac; }
		}

		if(this.compatibleAttachments & Attachment.STOCK) {
			switch(weaponMods.stockRarity) {
				case Rarity.COMMON:    { reloadTime *= 0.967; } break; // -3.3%
				case Rarity.RARE:      { reloadTime *= 0.933; } break; // -6.7%
				case Rarity.EPIC:
				case Rarity.LEGENDARY:
				case Rarity.MYTHIC:    { reloadTime *= 0.9; } break; // -10%

				default: break;
			}
		}

		if(weaponMods.ampReload) { reloadTime *= 0.6; } // -40%
		if(weaponMods.hopUp & HopUp.SPLATTER) { reloadTime *= 0.75; } // -25%
		if(weaponMods.traits & Trait.MODDED_LOADER) { reloadTime *= 0.75 } // -25%

		return reloadTime;
	}

	get_first_hit_delay(damageMods, weaponMods) {
		let fireMode = this.get_fire_mode();
		let distanceDelay = (fireMode.projectileSPM * damageMods.distance);
		let fireDelay = fireMode.fireDelay;

		return (distanceDelay + fireDelay);
	}

	get_body_damage(damageMods, weaponMods, doRounding = true) {
		let fireMode = this.get_fire_mode();
		let damage = fireMode.bodyDamage;

		if(this.minDistance && this.maxDistance) {
			if(damageMods.distance <= this.minDistance) {
				damage = fireMode.minBodyDamage;
			} else if(damageMods.distance >= this.maxDistance) {
				damage = fireMode.maxBodyDamage;
			} else {
				let distanceFromMin = damageMods.distance - this.minDistance;
				let damageDistanceRatio = fireMode.bodyDamageRange / this.distanceRange;
				damage = fireMode.minBodyDamage + (damageDistanceRatio * distanceFromMin);
				damage = Math.floor(damage);
			}
		}

		if(damageMods.amped) { damage *= 1.2; }
		if(damageMods.marked) { damage *= 1.15; }
		if(damageMods.fortified) { damage *= 0.85; }

		if(doRounding) { damage = Math.round(damage); }
		return damage;
	}

	get_headshot_damage(damageMods, weaponMods, doRounding = true) {
		let damage = this.get_body_damage(damageMods, weaponMods, false);
		damage *= this.get_fire_mode().headshotMultiplier;

		if(doRounding) { damage = Math.round(damage); }
		return damage;
	}

	get_legshot_damage(damageMods, weaponMods, doRounding = true) {
		let damage = this.get_body_damage(damageMods, weaponMods, false);
		damage *= this.get_fire_mode().legshotMultiplier;

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

		averageDamage += this.get_body_damage(damageMods, weaponMods) * bodyshotRate;
		averageDamage *= damageMods.hitRate;
		if(doRounding) { averageDamage = Math.round(averageDamage); }

		return averageDamage;
	}

	get_average_damage_per_shot(damageMods, weaponMods) {
		let averageDamage = this.get_average_damage(damageMods, weaponMods);
		averageDamage *= this.fireModes[this.fireModeIndex].projectileCount;

		return averageDamage;
	}

	get_average_damage_per_burst(damageMods, weaponMods) {
		let burstSize = this.get_burst_size();
		return (this.get_average_damage_per_shot(damageMods, weaponMods) * burstSize);
	}

	validate(damageMods, weaponMods) {
		if(this.get_average_damage_per_shot(damageMods, weaponMods) <= 0.0) {
			console.warn('invalid bodyDamage: ', this.get_average_damage_per_shot(damageMods, weaponMods));
			return false;
		}
		else if(this.get_mag_size(weaponMods) <= 0) {
			console.warn('invalid magSize: ', this.get_mag_size(weaponMods));
			return false;
		}

		return true;
	}

	calc_fire_time_per_mag(weaponMods) {
		if(this.is_burst_weapon()) {
			if(this.is_nemesis()) {
				return calc_fire_time_per_mag_nemesis(this, weaponMods);
			} else {
				return calc_fire_time_per_mag_burst(this, weaponMods);
			}
		} else {
			return calc_fire_time_per_mag_auto(this, weaponMods);
		}
	}

	calc_dpm(damageMods, weaponMods, onlyBase = false) {
		return calc_dpm_general(this, damageMods, weaponMods, onlyBase);
	}

	calc_ttk(damageMods, weaponMods) {
		if(this.is_burst_weapon()) {
			if(this.is_nemesis()) {
				return calc_ttk_nemesis(this, damageMods, weaponMods);
			} else {
				return calc_ttk_burst(this, damageMods, weaponMods);
			}
		} else {
			return calc_ttk_auto(this, damageMods, weaponMods);
		}
	}

	calc_dot(seconds, damageMods, weaponMods) {
		if(this.is_burst_weapon()) {
			if(this.is_nemesis()) {
				return calc_dot_nemesis(this, seconds, damageMods, weaponMods);
			} else {
				return calc_dot_burst(this, seconds, damageMods, weaponMods);
			}
		} else {
			return calc_dot_auto(this, seconds, damageMods, weaponMods);
		}
	}

	calc_dps_infinite_mag(damageMods, weaponMods) {
		if (!this.validate(damageMods, weaponMods)) { return 0.0; }
		let dps = 0.0;

		let fireMode = this.get_fire_mode();
		if(this.is_burst_weapon()) {
			let dpBurst = this.get_average_damage_per_burst(damageMods, weaponMods);
			let spBurst = this.get_seconds_per_burst(weaponMods);

			if(this.is_nemesis()) { // NOTE: calc nemesis as full speed
				dps = dpBurst / (spBurst + this.get_fire_mode().chargedBurstDelay);
			} else {
				dps = dpBurst / (spBurst + this.get_burst_delay());
			}
		} else if(this.get_shot_count(weaponMods) == 1) { // Only Bocek for now
			let dpShot = this.get_average_damage_per_shot(damageMods, weaponMods);
			let delay = this.get_reload_time(weaponMods) + this.get_fire_delay();
			let trueRPS = 1.0 / (this.get_delay_per_round(weaponMods) + delay);
			dps = dpShot * trueRPS;
		} else {
			let dpShot = this.get_average_damage_per_shot(damageMods, weaponMods);
			dps = dpShot * this.get_rounds_per_second(weaponMods);
		}

		return dps;
	}

	calc_dps_practical(damageMods, weaponMods) {
		if (!this.validate(damageMods, weaponMods)) { return 0.0; }

		let damagePerMag = this.calc_dpm(damageMods, weaponMods);
		let fireTimePerMag = this.calc_fire_time_per_mag(weaponMods);
		let magDelay = this.get_fire_delay() + this.get_reload_time(weaponMods);

		let dps = damagePerMag / (fireTimePerMag + magDelay);
		return dps;
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

	get_fire_mode_name(index) { return this.weapon.get_fire_mode_name(index); }
	get_fire_mode_count() { return this.weapon.get_fire_mode_count(); }
	get_fire_mode_index() { return this.weapon.get_fire_mode_index(); }
	set_fire_mode_index(index) { return this.weapon.set_fire_mode_index(index); }

	calc_dpm(damageMods) {
		return this.weapon.calc_dpm(damageMods, this.weaponMods, true);
	}

	calc_ttk(damageMods) {
		return this.weapon.calc_ttk(damageMods, this.weaponMods);
	}

	calc_dot(seconds, damageMods) {
		return this.weapon.calc_dot(seconds, damageMods, this.weaponMods);
	}

	calc_dps_infinite_mag(damageMods) {
		return this.weapon.calc_dps_infinite_mag(damageMods, this.weaponMods);
	}

	calc_dps_practical(damageMods) {
		return this.weapon.calc_dps_practical(damageMods, this.weaponMods);
	}
}
