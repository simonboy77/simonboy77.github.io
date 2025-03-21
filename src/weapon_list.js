const weapons_S24 = [
	new Weapon('HAVOC', [
		new FireMode('Normal', 21.0, 1.3, 0.75, 11.2, 36, 36, 36, 36, 3.2, 3.2, 30500, 0),
		new FireMode('Beam', 70.0, 1.5, 1.0, 1.04, 36, 36, 36, 36, 3.2, 3.2, 0,
		             {fireDelay:0.38,ammoPerShot:4})
	], 0, 0, 0, 0),

	new Weapon('Flatline', [
		new FireMode('Normal', 19.0, 1.3, 0.75, 10.0, 19, 23, 27, 29, 3.1, 2.4, 24000, 0)
	], Attachment.MAG | Attachment.STOCK, HopUp.SPLATTER, 0, 0),

	new Weapon('Hemlok', [
		new FireMode('Normal', 20.0, 1.3, 0.75, 15.5, 18, 21, 24, 30, 2.85, 2.4, 27500,
		             {burstSize:3,burstDelay:0.3})
	], Attachment.MAG | Attachment.STOCK, HopUp.SPLATTER, 0, 0),

	new Weapon('R-301', [
		new FireMode('Normal', 14.0, 1.3, 0.75, 13.5, 21, 23, 28, 31, 3.2, 2.4, 29000, 0)
	], Attachment.MAG | Attachment.STOCK, HopUp.SPLATTER, 0, 0),

	new Weapon('Nemesis', [
		new FireMode('Normal', 17.0, 1.3, 0.75, 18.0, 20, 24, 28, 32, 3.0, 2.7, 31000,
		             {burstSize:4,burstDelay:0.21,chargedBurstDelay:0.18,chargePerBurst:0.34}),
		new FireMode('Full Speed', 17.0, 1.3, 0.75, 18.0, 20, 24, 28, 32, 3.0, 2.7, 31000,
		             {burstSize:4,burstDelay:0.18})
	], Attachment.MAG | Attachment.STOCK, 0, 0, 0),

	new Weapon('Alternator', [
		new FireMode('Normal', 18.0, 1.2, 0.8, 10.0, 20, 24, 27, 29, 2.23, 1.9, 19000, 0)
	], Attachment.MAG | Attachment.STOCK, 0, 0, 0),

	new Weapon('Prowler', [
		new FireMode('Normal', 16.0, 1.2, 0.8, 21.0, 20, 25, 30, 35, 2.6, 2.0, 18000,
		             {burstSize:5,burstDelay:0.28}),
		new FireMode('Auto', 16.0, 1.2, 0.8, 13.25, 20, 25, 30, 35, 2.6, 2.0, 18000,
		             {needsSelectfire:true}),
	], Attachment.MAG | Attachment.STOCK, HopUp.SELECTFIRE | HopUp.SPLATTER, 0, 0),

	new Weapon('R-99', [
		new FireMode('Normal', 13.0, 1.2, 0.8, 18.0, 18, 21, 24, 27, 2.2, 1.6, 19000, 0)
	], Attachment.MAG | Attachment.STOCK, HopUp.SPLATTER, 0, 0),

	new Weapon('Volt', [
		new FireMode('Normal', 16.0, 1.2, 0.8, 12.0, 20, 22, 24, 27, 2.0, 1.45, 20000, 0)
	], Attachment.MAG | Attachment.STOCK, 0, 0, 0),

	new Weapon('C.A.R.', [
		new FireMode('Normal', 14.0, 1.2, 0.8, 15.5, 20, 23, 25, 28, 2.13, 1.7, 18000, 0)
	], Attachment.MAG | Attachment.STOCK, 0, 0, 0),

	// Devotion

	new LSTAR('L-STAR', [
		new FireMode('Normal', 19.0, 1.25, 0.85, 10.0, 22, 24, 26, 28, 3.26, 1.19, 24000, 0)
	], Attachment.MAG | Attachment.STOCK, 0, Trait.MODDED_LOADER, {cooldownDelay:0.08}),

	new Weapon('Spitfire', [
		new FireMode('Normal', 21.0, 1.25, 0.85, 9.0, 35, 40, 45, 50, 4.0, 3.1, 27500, 0)
	], Attachment.MAG | Attachment.STOCK, HopUp.SPLATTER, Trait.MODDED_LOADER, 0),

	new Weapon('Rampage', [
		new FireMode('Normal', 29.0, 1.25, 0.85, 5.0, 28, 32, 36, 40, 4.0, 3.1, 26500, 0),
		new FireMode('Revved Up', 29.0, 1.25, 0.85, 6.5, 28, 32, 36, 40, 4.0, 3.1, 26500, 0)
	], Attachment.MAG | Attachment.STOCK, 0, Trait.MODDED_LOADER, 0),

	new Weapon('Scout', [
		new FireMode('Normal', 36.0, 1.6, 0.75, 3.9, 10, 15, 18, 20, 3.0, 2.4, 30000, 0)
	], Attachment.MAG | Attachment.STOCK, 0, 0, 0),

	new Weapon('Triple_Take', [
		new FireMode('Normal', 22.0, 1.6, 0.9, 1.45, 6, 7, 8, 10, 3.4, 2.6, 32000,
		             {projectileCount:3})
	], Attachment.MAG | Attachment.STOCK, HopUp.BOOSTED_LOADER, 0,
	{reloadBoosted:1.4,magBonusBoosted:2}),

	// 30-30

	new Weapon('Bocek', [
		new FireMode('Max Damage', 75.0, 1.6, 0.9, 3.0, 1, 1, 1, 1, 0.0, 0.0, 28000,
		             {fireDelay:0.46}),
		new FireMode('Max Damage (Shatter Caps)', 13.0, 1.6, 0.9, 3.0, 1, 1, 1, 1, 0.0, 0.0,
		              28000, {projectileCount:7,fireDelay:0.46}),
		new FireMode('Max Speed', 30.0, 1.6, 0.9, 3.0, 1, 1, 1, 1, 0.0, 0.0, 10000,
		             {fireDelay:0.08}),
		new FireMode('Max Speed (Shatter Caps)', 7.0, 1.6, 0.9, 3.0, 1, 1, 1, 1, 0.0, 0.0,
		              10000, {projectileCount:7,fireDelay:0.08}),
	], 0, 0, 0, 0),

	new Weapon('Charge_Rifle', [
		new FireMode('Normal', 75.0, 1.8, 0.7, 0.616, 6, 7, 8, 9, 4.6, 3.5, 31000,
		             {fireDelay:0.868,maxBodyDamage:110.0}),
		new FireMode('Auto', 56.0, 2.0, 0.9, 1.394, 6, 7, 8, 9, 4.6, 3.5, 31000,
		             {fireDelay:0.317,needsSelectfire:true,maxBodyDamage:83.0})
	], Attachment.MAG | Attachment.STOCK, HopUp.SELECTFIRE, 0,
	{minDistance:50,maxDistance:200}),

	new Weapon('Longbow', [
		new FireMode('Normal', 60.0, 1.8, 0.7, 1.3, 6, 8, 10, 12, 3.66, 2.66, 31000, 0)
	], Attachment.MAG | Attachment.STOCK, HopUp.SPLATTER, 0, 0),

	new Weapon('Kraber', [
		new FireMode('Normal', 150.0, 1.4, 0.8, 1.2, 4, 4, 4, 4, 4.3, 3.2, 29500,
		             {rechamberTime:1.6})
	], 0, 0, 0, 0),

	new Weapon('Sentinel', [
		new FireMode('Normal', 70.0, 1.8, 0.7, 3.1, 4, 5, 6, 7, 4.0, 3.0, 31000,
		             {rechamberTime:1.6}),
		new FireMode('Energized', 88.0, 1.8, 0.7, 3.1, 4, 5, 6, 7, 4.0, 3.0, 31000,
		             {rechamberTime:1.6})
	], Attachment.MAG | Attachment.STOCK, HopUp.BOOSTED_LOADER, 0,
	{reloadBoosted:1.4,magBonusBoosted:2}),

	new Weapon('EVA-8', [
		new FireMode('Normal', 8.0, 1.0, 1.0, 2.35, 8, 8, 8, 8, 3.0, 2.75, 16000,
		             {projectileCount:8})
	], Attachment.STOCK | Attachment.BOLT, HopUp.SPLATTER, 0, 0),

	// Mastiff

	new Weapon('Mozambique', [
		new FireMode('Normal', 17.0, 1.0, 1.0, 2.66, 5, 5, 5, 5, 2.6, 2.1, 10000,
		             {projectileCount:3}),
		new FireMode('Akimbo', 17.0, 1.25, 1.0, 2.917, 10, 10, 10, 10, 3.0, 2.5, 10000,
		             {projectileCount:3})
	], Attachment.BOLT, HopUp.SPLATTER, 0, 0),

	// Peacekeeper

	new Weapon('P2020', [
		new FireMode('Normal', 25.0, 1.25, 0.9, 7.0, 10, 11, 12, 14, 1.25, 1.25, 18500, 0),
		new FireMode('Akimbo', 25.0, 1.25, 0.9, 8.0, 20, 22, 24, 28, 2.6, 2.1, 18500, 0)
	], Attachment.MAG, 0, 0, 0),

	new Weapon('RE-45', [
		new FireMode('Normal', 14.0, 1.25, 0.9, 13.0, 20, 21, 23, 26, 1.95, 1.5, 19500, 0)
	], Attachment.MAG, HopUp.SPLATTER, 0, 0),

	new Weapon('Wingman', [
		new FireMode('Normal', 48.0, 1.5, 0.9, 2.6, 5, 6, 7, 8, 2.1, 2.1, 18000, 0)
	], Attachment.MAG, 0, 0, 0),
];
