function calc_dpm_general(weapon, damageMods, weaponMods, onlyBase = false) {
	let totalMagSize = weapon.get_mag_size(weaponMods, onlyBase);		
	let averageDamage = weapon.get_average_damage_per_shot(damageMods, weaponMods);
	
	return totalMagSize * averageDamage;
}

// Auto
function calc_fire_time_per_mag_auto(weapon, weaponMods) {
	let totalMagSize = weapon.get_mag_size(weaponMods);
	let roundDelay = weapon.get_delay_per_round(weaponMods);

	// NOTE: last round still gets the delay
	return totalMagSize * roundDelay;
}

function calc_ttk_auto(weapon, damageMods, weaponMods) {
	if (!weapon.validate(damageMods, weaponMods)) { return 0.0; }
	
	let targetHP = damageMods.shield + damageMods.health;
	let secondsPassed = weapon.get_first_hit_delay(damageMods, weaponMods);
	
	if(targetHP > 0.0) { // Apply full mags
		let averageDamagePerMag = weapon.calc_dpm(damageMods, weaponMods);
		if(targetHP >= averageDamagePerMag) {
			let magTime = weapon.calc_fire_time_per_mag(weaponMods);
			let magDelay = weapon.get_reload_time(weaponMods) + weapon.get_fire_delay(weaponMods);
			let magsNeeded = Math.floor(targetHP / averageDamagePerMag);
			
			targetHP -= magsNeeded * averageDamagePerMag;
			secondsPassed += magsNeeded * (magTime + magDelay);
			
			// Remove last delay if it was a clean kill
			if(targetHP <= 0.0) { secondsPassed -= magDelay; }
		}
	}
	
	if(targetHP > 0.0) { // Apply final rounds
		let averageDamage = weapon.get_average_damage_per_shot(damageMods, weaponMods);
		let roundsNeeded = Math.ceil(targetHP / averageDamage);
		
		// -1 because the last bullet kills
		secondsPassed += weapon.get_delay_per_round(weaponMods) * (roundsNeeded - 1);
	}
	
	return secondsPassed;
}

function calc_dot_auto(weapon, seconds, damageMods, weaponMods) {
	const data = [];
	data.push({x:0,y:0});
	
	if (!weapon.validate(damageMods, weaponMods)) { return data; }
	if (seconds <= 0.0) { console.warn('invalid seconds :', seconds); return data; }
	
	let totalMagSize = weapon.get_mag_size(weaponMods);		
	let averageDamage = weapon.get_average_damage_per_shot(damageMods, weaponMods);
	
	let roundDelay = weapon.get_delay_per_round(weaponMods);
	let ammoPerShot = weapon.get_ammo_per_shot();
	
	let reloadTime = weapon.get_reload_time(weaponMods);
	let fireDelay = weapon.get_fire_delay(weaponMods);
	
	let totalDamage = 0.0; let curMag = totalMagSize;
	let secondsPassed = weapon.get_first_hit_delay(damageMods, weaponMods);
	data.push({x:secondsPassed,y:totalDamage});
	
	while(secondsPassed < seconds) {
		curMag -= ammoPerShot;
		
		totalDamage += averageDamage;
		data.push({x:secondsPassed,y:totalDamage});
		
		if(curMag > 0) {
			secondsPassed += roundDelay;
		} else {
			secondsPassed += (reloadTime + fireDelay + roundDelay);
			
			curMag = totalMagSize;
			if((weaponMods.hopUp & HopUp.BOOSTED_LOADER) && weaponMods.tacReload) {
				curMag += weapon.magBonusBoosted;
			}
		}
		
		// show how long the gun went without dealing damage
		data.push({x:secondsPassed,y:totalDamage});
	}
	
	return data;
}

function calc_dps_auto(weapon, damageMods, weaponMods) {
	if (!weapon.validate(damageMods, weaponMods)) { return 0.0; }
	
	let damage = weapon.get_average_damage_per_shot(damageMods, weaponMods);
	let dps = damage * weapon.get_rounds_per_second(weaponMods);
	
	return dps;
}

// Burst
function calc_fire_time_per_mag_burst(weapon, weaponMods) {
	let totalMagSize = weapon.get_mag_size(weaponMods);
	let burstSize = weapon.get_burst_size();
	let burstDelay = weapon.get_burst_delay();
	
	let burstCount = Math.floor(totalMagSize / burstSize);
	let secondsPerBurst = weapon.get_seconds_per_burst(weaponMods);
	
	// TEST: does the last burst also get the burstDelay?
	let fireTime = (secondsPerBurst * burstCount) + (burstDelay * burstCount);

	let totalRounds = burstCount * burstSize;
	if(totalRounds < totalMagSize) { // Uneven burst somehow
		let remainingBullets = totalMagSize - totalRounds;
		fireTime += weapon.get_delay_per_round(weaponMods) * remainingBullets;
	}
	
	return fireTime;
}

function calc_ttk_burst(weapon, damageMods, weaponMods) {
	if (!weapon.validate(damageMods, weaponMods)) { return 0.0; }
	
	let targetHP = damageMods.shield + damageMods.health;
	let secondsPassed = weapon.get_first_hit_delay(damageMods, weaponMods);
	
	if(targetHP > 0.0) { // Apply full mags
		let averageDamagePerMag = weapon.calc_dpm(damageMods, weaponMods);
		if(targetHP >= averageDamagePerMag) {
			let magTime = weapon.calc_fire_time_per_mag(weaponMods);
			let magDelay = weapon.get_reload_time(weaponMods) + weapon.get_fire_delay(weaponMods);
			let magsNeeded = Math.floor(targetHP / averageDamagePerMag);
			
			targetHP -= magsNeeded * averageDamagePerMag;
			secondsPassed += magsNeeded * (magTime + magDelay);
			
			// Remove last delay if it was a clean kill
			if(targetHP <= 0.0) { secondsPassed -= magDelay; }
		}
	}
	
	if(targetHP > 0.0) { // Apply full bursts
		let averageDamagePerBurst = weapon.get_average_damage_per_burst(damageMods, weaponMods);
		if(targetHP >= averageDamagePerBurst) {
			let burstTime = weapon.get_seconds_per_burst(weaponMods);
			let burstsNeeded = Math.floor(targetHP / averageDamagePerBurst);
			
			targetHP -= burstsNeeded * averageDamagePerBurst;
			secondsPassed += burstsNeeded * (burstTime + weapon.get_burst_delay());
			
			// Remove last delay if it was a clean kill
			if(targetHP <= 0.0) { secondsPassed -= weapon.get_burst_delay(); }
		}
	}
	
	if(targetHP > 0.0) { // Apply final rounds
		let averageDamage = weapon.get_average_damage_per_shot(damageMods, weaponMods);
		let roundsNeeded = Math.ceil(targetHP / averageDamage);
		
		// -1 because the last bullet kills
		secondsPassed += weapon.get_delay_per_round(weaponMods) * (roundsNeeded - 1);
	}
	
	return secondsPassed;
}

function calc_dot_burst(weapon, seconds, damageMods, weaponMods) {
	const data = [];
	data.push({x:0,y:0});
	
	if (!weapon.validate(damageMods, weaponMods)) { return data; }
	if (seconds <= 0.0) { console.warn('invalid seconds :', seconds); return data; }
	
	let totalMagSize = weapon.get_mag_size(weaponMods);
	let averageDamage = weapon.get_average_damage_per_shot(damageMods, weaponMods);
	
	let roundDelay = weapon.get_delay_per_round(weaponMods);
	let ammoPerShot = weapon.get_ammo_per_shot();
	
	let reloadTime = weapon.get_reload_time(weaponMods);
	let fireDelay = weapon.get_fire_delay(weaponMods);
	
	let burstSize = weapon.get_burst_size();
	let burstDelay = weapon.get_burst_delay();
	
	let totalDamage = 0.0; let curMag = totalMagSize; let curBurst = burstSize;
	let secondsPassed = weapon.get_first_hit_delay(damageMods, weaponMods);
	data.push({x:secondsPassed,y:totalDamage});
	
	while (secondsPassed < seconds) {
		curMag -= ammoPerShot; curBurst -= ammoPerShot;
		
		totalDamage += averageDamage;
		data.push({x:secondsPassed,y:totalDamage});
		
		if(curMag > 0) {
			if(curBurst > 0) {
				secondsPassed += roundDelay;
			} else {
				secondsPassed += burstDelay;
				curBurst = burstSize;
			}
		} else {
			secondsPassed += (reloadTime + fireDelay + roundDelay);
			
			curMag = totalMagSize; curBurst = burstSize;
			if((weaponMods.hopUp & HopUp.BOOSTED_LOADER) && weaponMods.tacReload) {
				curMag += weapon.magBonusBoosted;
			}
		}
		
		// show how long the gun went without dealing damage
		data.push({x:secondsPassed,y:totalDamage});
	}
	
	return data;
}

function calc_dps_burst(weapon, damageMods, weaponMods) {
	if (!weapon.validate(damageMods, weaponMods)) { return 0.0; }
	
	let dpBurst = weapon.get_average_damage_per_burst(damageMods, weaponMods);
	let spBurst = weapon.get_seconds_per_burst(weaponMods);
	let dps = dpBurst / (spBurst + weapon.get_burst_delay());
	
	return dps;
}

// Nemesis
function calc_fire_time_per_mag_nemesis(weapon, weaponMods) {
	// NOTE: I've decided that a reasonable number here is the average fire time over 2 mags
	// (without reload times)
	
	let totalMagSize = weapon.get_mag_size(weaponMods);
	let totalShots = totalMagSize * 2;
	
	let burstSize = weapon.get_burst_size();
	let burstDelay = weapon.get_burst_delay();
	let burstDelayRange = weapon.get_fire_mode().burstDelayRange;
	
	let charge = 0.0;
	let chargePerBurst = weapon.get_fire_mode().chargePerBurst;
	
	let burstCount = Math.floor(totalShots / burstSize);
	let secondsPerBurst = weapon.get_seconds_per_burst(weaponMods);
	
	let fireTime = 0.0;
	for(burstIndex = 0; burstIndex < burstCount; ++burstIndex) {
		fireTime += (secondsPerBurst + burstDelay);
		
		charge = Math.min(charge + chargePerBurst, 1.0);
		burstDelay = weapon.get_burst_delay() + (charge * burstDelayRange);
	}
	
	return fireTime / 2.0;
}

function calc_ttk_nemesis(weapon, damageMods, weaponMods) {
	if (!weapon.validate(damageMods, weaponMods)) { return 0.0; }
	
	let targetHP = damageMods.shield + damageMods.health;
	let secondsPassed = weapon.get_first_hit_delay(damageMods, weaponMods);
	
	if(targetHP > 0.0) { // Apply full bursts
		let averageDamagePerBurst = weapon.get_average_damage_per_burst(damageMods, weaponMods);
		if(targetHP >= averageDamagePerBurst) {
			let burstsNeeded = Math.floor(targetHP / averageDamagePerBurst);
			let secondsPerBurst = weapon.get_seconds_per_burst(weaponMods);
			let burstDelay = weapon.get_burst_delay();
			let burstDelayRange = weapon.get_fire_mode().burstDelayRange;
			
			let charge = 0.0;
			let chargePerBurst = weapon.get_fire_mode().chargePerBurst;
			
			for(let burstIndex = 0; burstIndex < burstsNeeded; ++burstIndex) {
				targetHP -= averageDamagePerBurst;
				
				if(targetHP > 0.0) {
					secondsPassed += (secondsPerBurst + burstDelay);
					charge = Math.min(charge + chargePerBurst, 1.0);
					burstDelay = weapon.get_burst_delay() + (charge * burstDelayRange);
				}
			}
		}
	}
	
	if(targetHP > 0.0) { // Apply final rounds
		let averageDamage = weapon.get_average_damage_per_shot(damageMods, weaponMods);
		let roundsNeeded = Math.ceil(targetHP / averageDamage);
		
		// -1 because the last bullet kills
		secondsPassed += weapon.get_delay_per_round(weaponMods) * (roundsNeeded - 1);
	}
	
	return secondsPassed;
}

function calc_dot_nemesis(weapon, seconds, damageMods, weaponMods) {
	const data = [];
	data.push({x:0,y:0});
	
	if (!weapon.validate(damageMods, weaponMods)) { return data; }
	if (seconds <= 0.0) { console.warn('invalid seconds :', seconds); return data; }
	
	let totalMagSize = weapon.get_mag_size(weaponMods);
	let averageDamage = weapon.get_average_damage_per_shot(damageMods, weaponMods);
	
	let roundDelay = weapon.get_delay_per_round(weaponMods);
	let ammoPerShot = weapon.get_ammo_per_shot();
	
	let reloadTime = weapon.get_reload_time(weaponMods);
	let fireDelay = weapon.get_fire_delay(weaponMods);
	
	let burstSize = weapon.get_burst_size();
	let burstDelay = weapon.get_burst_delay();
	let burstDelayRange = weapon.get_fire_mode().burstDelayRange;
	
	let charge = 0.0;
	let chargePerBurst = weapon.get_fire_mode().chargePerBurst;
	
	let totalDamage = 0.0; let curMag = totalMagSize; let curBurst = burstSize;
	let secondsPassed = weapon.get_first_hit_delay(damageMods, weaponMods);
	data.push({x:secondsPassed,y:totalDamage});
	
	while (secondsPassed < seconds) {
		curMag -= ammoPerShot; curBurst -= ammoPerShot;
		
		totalDamage += averageDamage;
		data.push({x:secondsPassed,y:totalDamage});
		
		if(curMag > 0) {
			if(curBurst > 0) {
				secondsPassed += roundDelay;
			} else {
				secondsPassed += burstDelay;
				curBurst = burstSize;
				
				charge = Math.min(charge + chargePerBurst, 1.0);
				burstDelay = weapon.get_burst_delay() + (charge * burstDelayRange);
			}
		} else {
			secondsPassed += (reloadTime + fireDelay + roundDelay);
			
			curMag = totalMagSize; curBurst = burstSize;
			if((weaponMods.hopUp & HopUp.BOOSTED_LOADER) && weaponMods.tacReload) {
				curMag += weapon.magBonusBoosted;
			}
		}
		
		// show how long the gun went without dealing damage
		data.push({x:secondsPassed,y:totalDamage});
	}
	
	return data;
}

