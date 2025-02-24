function calc_dpm_general(weapon, damageMods, weaponMods, onlyBase = false) {
	let totalMagSize = weapon.get_mag_size(weaponMods, onlyBase);		
	let averageDamage = weapon.get_average_damage_per_shot(damageMods);
	
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

	return secondsPerRound * (totalMagSize - 1); // first bullet is instant
}

function calc_dot_auto(weapon, seconds, damageMods, weaponMods) {
	const data = [];
	
	if (!weapon.validate_weapon(weaponMods)) { return data; }
	if (seconds <= 0.0) {
		console.warn('invalid seconds :', seconds);
		return data;
	}
	
	let totalMagSize = weapon.get_mag_size(weaponMods);		
	let averageDamage = weapon.get_average_damage_per_shot(damageMods);
	let secondsPerRound = weapon.get_seconds_per_round(weaponMods);
	let reloadTime = weapon.get_reload_time(weaponMods);
	
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

function calc_ttk_auto(weapon, damageMods, weaponMods) {
	if (!weapon.validate_weapon(weaponMods)) { return 0.0; }
	
	let totalMagSize = weapon.get_mag_size(weaponMods);		
	let averageDamage = weapon.get_average_damage_per_shot(damageMods);
	let averageDamagePerMag = weapon.calc_dpm(damageMods, weaponMods);
	
	let reloadTime = weapon.get_reload_time(weaponMods);
	let fireTime = weapon.calc_fire_time_per_mag(weaponMods);
	
	let targetHP = damageMods.shield + damageMods.health;
	let secondsPassed = 0.0;
	
	while(targetHP >= averageDamagePerMag) {
		targetHP -= averageDamagePerMag;
		secondsPassed += (fireTime + reloadTime);
	}
	
	let finalRounds = Math.ceil(targetHP / averageDamage);
	let secondsPerRound = weapon.get_seconds_per_round(weaponMods);
	
	secondsPassed += secondsPerRound * (finalRounds - 1); // first bullet is instant
	
	return secondsPassed;
}

function calc_dps_auto(weapon, damageMods, weaponMods) {
	if (!weapon.validate_weapon(weaponMods)) { return 0.0; }
	
	let damage = weapon.get_average_damage_per_shot(damageMods);
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
	// TODO: this does not take uneven bursts into account
	let totalMagSize = weapon.get_mag_size(weaponMods);
	let burstCount = Math.floor(totalMagSize / weapon.burstSize);
	let secondsPerBurst = weapon.get_seconds_per_burst(weaponMods);
	let tail = weapon.get_seconds_per_round(weaponMods) + weapon.burstDelay;
	
	return (secondsPerBurst * burstCount) - tail;
}

function calc_dot_burst(weapon, seconds, damageMods, weaponMods) {
	const data = [];
	
	if (!weapon.validate_weapon(weaponMods)) { return data; }
	if (seconds <= 0.0) {
		console.warn('invalid seconds :', seconds);
		return data;
	}
	
	let totalMagSize = weapon.get_mag_size(weaponMods);		
	let averageDamage = weapon.get_average_damage_per_shot(damageMods);
	let secondsPerRound = weapon.get_seconds_per_round(weaponMods);
	let reloadTime = weapon.get_reload_time(weaponMods);
	
	let totalDamage = 0.0;
	let secondsPassed = 0.0;
	let curMag = totalMagSize;
	let curBurst = weapon.burstSize;
	
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
				curBurst = weapon.burstSize;
				secondsPassed += weapon.burstDelay;
				
				if(secondsPassed > seconds) { secondsPassed = seconds; }
				data.push({x:secondsPassed,y:totalDamage});
			}	
		}
		else {
			curMag = totalMagSize;
			curBurst = weapon.burstSize;
			secondsPassed += reloadTime;
			
			if(secondsPassed > seconds) { secondsPassed = seconds; }
			data.push({x:secondsPassed,y:totalDamage});
		}
	}
	
	return data;
}

function calc_ttk_burst(weapon, damageMods, weaponMods) {
	if (!weapon.validate_weapon(weaponMods)) { return 0.0; }
	
	let totalMagSize = weapon.get_mag_size(weaponMods);		
	let averageDamage = weapon.get_average_damage_per_shot(damageMods);
	let averageDamagePerBurst = weapon.get_average_damage_per_burst(damageMods);
	let averageDamagePerMag = weapon.calc_dpm(damageMods, weaponMods);
	
	let reloadTime = weapon.get_reload_time(weaponMods);
	let fireTime = weapon.calc_fire_time_per_mag(weaponMods);
	
	let targetHP = damageMods.shield + damageMods.health;
	let secondsPassed = 0.0;
	
	while(targetHP >= averageDamagePerMag) {
		targetHP -= averageDamagePerMag;
		secondsPassed += (fireTime + reloadTime);
	}
	
	// TODO: if one clean burst kills, than the time between bursts should be ignored!!
	
	// Apply final bursts
	let finalBursts = Math.floor(targetHP / averageDamagePerBurst);
	let spBurst = weapon.get_seconds_per_burst(weaponMods);
	
	secondsPassed += spBurst * finalBursts;
	targetHP -= averageDamagePerBurst * finalBursts;
	
	// Apply final rounds
	let finalRounds = Math.ceil(targetHP / averageDamage);
	let spRound = weapon.get_seconds_per_round(weaponMods);
	
	secondsPassed += spRound * (finalRounds - 1); // first bullet is instant
	
	return secondsPassed;
}

function calc_dps_burst(weapon, damageMods, weaponMods) {
	if (!weapon.validate_weapon(weaponMods)) { return 0.0; }
	
	let dpBurst = weapon.get_average_damage_per_burst(damageMods);
	let spBurst = weapon.get_seconds_per_burst(weaponMods);
	let dps = dpBurst / spBurst;
	
	return dps;
}
