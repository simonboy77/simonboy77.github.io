// TODO:
// - after the last bullet of a burst, is there only the burstDelay or also the bulletDelay?
// - same for full auto, does the last bullet have the delay? does the reload start instantly?

function calc_dpm_general(weapon, damageMods, weaponMods, onlyBase = false) {
	let totalMagSize = weapon.get_mag_size(weaponMods, onlyBase);		
	let averageDamage = weapon.get_average_damage_per_shot(damageMods, weaponMods);
	
	return totalMagSize * averageDamage;
}

// Auto
function calc_mag_size_auto(weapon, weaponMods, onlyBase = false) {
	let magSize = weapon.get_bullet_count_from_mag_rarity(weaponMods);
	
	if(!onlyBase) {
		if(weaponMods.tacReload) { magSize -= 1; }
	}
	
	return magSize;
}

function calc_fire_time_per_mag_auto(weapon, weaponMods) {
	let totalMagSize = weapon.get_mag_size(weaponMods);
	let secondsPerRound = weapon.get_seconds_per_round(weaponMods);

	// -1 because last bullet has no delay
	return secondsPerRound * (totalMagSize - 1);
}

function calc_dot_auto(weapon, seconds, damageMods, weaponMods) {
	const data = [];
	data.push({x:0,y:0});
	
	if (!weapon.validate_weapon(weaponMods)) { return data; }
	if (seconds <= 0.0) {
		console.warn('invalid seconds :', seconds);
		return data;
	}
	
	let totalMagSize = weapon.get_mag_size(weaponMods);		
	let averageDamage = weapon.get_average_damage_per_shot(damageMods, weaponMods);
	let secondsPerRound = weapon.get_seconds_per_round(weaponMods);
	let reloadTime = weapon.get_reload_time(weaponMods);
	let fireDelay = weapon.get_fire_delay(weaponMods);
	
	let totalDamage = 0.0; let curMag = totalMagSize;
	let secondsPassed = weapon.get_first_hit_delay(damageMods, weaponMods);
	data.push({x:secondsPassed,y:totalDamage});
	
	while(secondsPassed < seconds) {
		--curMag;
		
		totalDamage += averageDamage;
		data.push({x:secondsPassed,y:totalDamage});
		
		if(curMag > 0) {
			secondsPassed += secondsPerRound;
		} else {
			secondsPassed += (reloadTime + fireDelay);
			
			curMag = totalMagSize;
			if((weaponMods.hopUp & HopUp.BOOSTED_LOADER) && weaponMods.tacReload) {
				curMag += weapon.magBonusBL;
			}
		}
		
		// show how long the gun went without dealing damage
		data.push({x:secondsPassed,y:totalDamage});
	}
	
	return data;
}

function calc_ttk_auto(weapon, damageMods, weaponMods) {
	if (!weapon.validate_weapon(weaponMods)) { return 0.0; }
	
	let targetHP = damageMods.shield + damageMods.health;
	let secondsPassed = weapon.get_first_hit_delay(damageMods, weaponMods);
	
	if(targetHP > 0.0) { // Apply full mags
		let averageDamagePerMag = weapon.calc_dpm(damageMods, weaponMods);
		let magsNeeded = targetHP / averageDamagePerMag;
		
		if(magsNeeded) {
			let magTime = weapon.calc_fire_time_per_mag(weaponMods);
			let magDelay = weapon.get_reload_time(weaponMods) + weapon.get_fire_delay(weaponMods);
			let magsNeededFloored = Math.floor(magsNeeded);
			
			targetHP -= magsNeededFloored * averageDamagePerMag;
			secondsPassed += magsNeededFloored * (magTime + magDelay);
			
			// Remove last delay if it was a clean kill
			if(magsNeeded == magsNeededFloored) { secondsPassed -= magDelay; }
		}
	}
	
	if(targetHP > 0.0) { // Apply final rounds
		let averageDamage = weapon.get_average_damage_per_shot(damageMods, weaponMods);
		let roundsNeeded = Math.ceil(targetHP / averageDamage);
		
		// -1 because only the time in between bullets is delayed
		secondsPassed += weapon.get_seconds_per_round(weaponMods) * (roundsNeeded - 1);
	}
	
	return secondsPassed;
}

function calc_dps_auto(weapon, damageMods, weaponMods) {
	if (!weapon.validate_weapon(weaponMods)) { return 0.0; }
	
	let damage = weapon.get_average_damage_per_shot(damageMods, weaponMods);
	let dps = damage * weapon.get_rounds_per_second(weaponMods);
	
	return dps;
}

// Burst
function calc_mag_size_burst(weapon, weaponMods, onlyBase = false) {
	let magSize = weapon.get_bullet_count_from_mag_rarity(weaponMods);
		
	if(!onlyBase) {
		if(weaponMods.tacReload) { magSize -= weapon.burstSize; }
	}
	
	return magSize;
}

function calc_fire_time_per_mag_burst(weapon, weaponMods) {
	let totalMagSize = weapon.get_mag_size(weaponMods);
	let burstCount = Math.floor(totalMagSize / weapon.burstSize);
	let secondsPerBurst = weapon.get_seconds_per_burst(weaponMods);
	
	// -1 because the burst delay only occurs between bursts
	let fireTime = (secondsPerBurst * burstCount) + (weapon.burstDelay * (burstCount - 1));
	
	let totalRounds = burstCount * weapon.burstSize;
	if(totalRounds < totalMagSize) { // Uneven burst somehow
		let remainingBullets = totalMagSize - totalRounds;
		fireTime += weapon.get_seconds_per_round(weaponMods) * (remainingBullets - 1);
		fireTime += weapon.burstDelay;
	}
	
	return fireTime;
}

function calc_dot_burst(weapon, seconds, damageMods, weaponMods) {
	const data = [];
	data.push({x:0,y:0});
	
	if (!weapon.validate_weapon(weaponMods)) { return data; }
	if (seconds <= 0.0) {
		console.warn('invalid seconds :', seconds);
		return data;
	}
	
	let totalMagSize = weapon.get_mag_size(weaponMods);
	let averageDamage = weapon.get_average_damage_per_shot(damageMods, weaponMods);
	let secondsPerRound = weapon.get_seconds_per_round(weaponMods);
	let reloadTime = weapon.get_reload_time(weaponMods);
	let fireDelay = weapon.get_fire_delay(weaponMods);
	
	let totalDamage = 0.0; let curMag = totalMagSize; let curBurst = weapon.burstSize;
	let secondsPassed = weapon.get_first_hit_delay(damageMods, weaponMods);
	data.push({x:secondsPassed,y:totalDamage});
	
	while (secondsPassed < seconds) {
		--curMag;
		--curBurst;
		
		totalDamage += averageDamage;
		data.push({x:secondsPassed,y:totalDamage});
		
		if(curMag > 0) {
			if(curBurst > 0) {
				secondsPassed += secondsPerRound;
			} else {
				secondsPassed += weapon.burstDelay;
				curBurst = weapon.burstSize;
			}
		} else {
			secondsPassed += (reloadTime + fireDelay);
			
			curMag = totalMagSize; curBurst = weapon.burstSize;
			if((weaponMods.hopUp & HopUp.BOOSTED_LOADER) && weaponMods.tacReload) {
				curMag += weapon.magBonusBL;
			}
		}
		
		// show how long the gun went without dealing damage
		data.push({x:secondsPassed,y:totalDamage});
	}
	
	return data;
}

function calc_ttk_burst(weapon, damageMods, weaponMods) {
	if (!weapon.validate_weapon(weaponMods)) { return 0.0; }
	
	let targetHP = damageMods.shield + damageMods.health;
	let secondsPassed = weapon.get_first_hit_delay(damageMods, weaponMods);
	
	if(targetHP > 0.0) { // Apply full mags
		let averageDamagePerMag = weapon.calc_dpm(damageMods, weaponMods);
		let magsNeeded = targetHP / averageDamagePerMag;
		
		if(magsNeeded) {
			let magTime = weapon.calc_fire_time_per_mag(weaponMods);
			let magDelay = weapon.get_reload_time(weaponMods) + weapon.get_fire_delay(weaponMods);
			let magsNeededFloored = Math.floor(magsNeeded);
			
			targetHP -= magsNeededFloored * averageDamagePerMag;
			secondsPassed += magsNeededFloored * (magTime + magDelay);
			
			// Remove last delay if it was a clean kill
			if(magsNeeded == magsNeededFloored) { secondsPassed -= magDelay; }
		}
	}
	
	if(targetHP > 0.0) { // Apply full bursts
		let averageDamagePerBurst = weapon.get_average_damage_per_burst(damageMods, weaponMods);
		let burstsNeeded = targetHP / averageDamagePerBurst;
		
		if(burstsNeeded) {
			let burstTime = weapon.get_seconds_per_burst(weaponMods);
			let burstsNeededFloored = Math.floor(burstsNeeded);
			
			targetHP -= burstsNeededFloored * averageDamagePerBurst;
			secondsPassed += burstsNeededFloored * (burstTime + weapon.burstDelay);
			
			// Remove last delay if it was a clean kill
			if(burstsNeeded == burstsNeededFloored) { secondsPassed -= weapon.burstDelay; }
		}
	}
	
	if(targetHP > 0.0) { // Apply final rounds
		let averageDamage = weapon.get_average_damage_per_shot(damageMods, weaponMods);
		let roundsNeeded = Math.ceil(targetHP / averageDamage);
		
		// -1 because only the time in between bullets is delayed
		secondsPassed += weapon.get_seconds_per_round(weaponMods) * (roundsNeeded - 1);
	}
	
	return secondsPassed;
}

function calc_dps_burst(weapon, damageMods, weaponMods) {
	if (!weapon.validate_weapon(weaponMods)) { return 0.0; }
	
	let dpBurst = weapon.get_average_damage_per_burst(damageMods, weaponMods);
	let spBurst = weapon.get_seconds_per_burst(weaponMods);
	let dps = dpBurst / (spBurst + weapon.burstDelay);
	
	return dps;
}
