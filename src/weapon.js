class Weapon {
	constructor(bd, hm, lm, rps, mNone, mCommon, mRare, mEpic, rf, rt) {
		this.bodyDamage = bd; // float
		this.headshotMultiplier = hm; // float
		this.legshotMultiplier = lm; // float
		
		this.roundsPerSecond = rps; // float
		this.roundsPerMinute = this.roundsPerSecond * 60.0;
		this.secondsPerRound = 1.0 / this.roundsPerSecond;
		
		this.magSizeNone   = mNone;
		this.magSizeCommon = mCommon;
		this.magSizeRare   = mRare;
		this.magSizeEpic   = mEpic;
		
		this.reloadTimeFull = rf;
		this.reloadTimeTac   = rt;
	}
	
	get_mag_size(magRarity) {
		let magSize = this.magSizeNone;
		
		switch(magRarity) {
			case Rarity.COMMON: { magSize = this.magSizeCommon; } break;
			case Rarity.RARE:   { magSize = this.magSizeRare; } break;
			case Rarity.EPIC:
			case Rarity.LEGENDARY:
			case Rarity.MYTHIC: { magSize = this.magSizeEpic; } break;
		}
		
		return magSize;
	}
	
	get_headshot_damage() {
		return (this.bodyDamage * this.headshotMultiplier);
	}
	
	get_legshot_damage(shotCount) {
		return (this.bodyDamage * this.legshotMultiplier) * shotCount;
	}
	
	fire_for_time(seconds, magRarity) {
		const data = [];
		
		let totalMagSize = this.get_mag_size(magRarity);
		if(totalMagSize <= 0 || seconds <= 0.0) {
			return data;
		}
		
		let totalDamage = 0.0;
		let secondsPassed = 0.0;
		let curMag = totalMagSize;
		
		while (secondsPassed < seconds) {
			curMag -= 1;
			totalDamage += this.bodyDamage;
			data.push({x:secondsPassed,y:totalDamage});
			
			if(curMag > 0) {
				secondsPassed += this.secondsPerRound;
			}
			else {
				curMag = totalMagSize;
				secondsPassed += this.reloadTimeFull;
				data.push({x:secondsPassed,y:totalDamage}); // necessary?
			}
		}
		
		return data;
	}
}

class Shotgun extends Weapon {
	constructor(pc, bd, hm, lm) {
		super(bd, hm, lm);
		
		this.pelletCount = pc;
	}
}

const flatline = new Weapon(19.0, 1.3, 0.75, 10.0, 19, 23, 27, 29, 3.1, 2.4);
const eva = new Shotgun(8, 7.0, 1.25, 1.0);

console.log('flatline damage: ', flatline.bodyDamage);
console.log('eva damage: ', eva.bodyDamage);

console.log('test ');

/*
// Using a constructor
function person(first_name, last_name) {
    this.first_name = first_name;
    this.last_name = last_name;
}
// Creating new instances of person object
let person1 = new person('Mukul', 'Latiyan');
let person2 = new person('Rahul', 'Avasthi');

console.log(person1.first_name);
console.log(${person2.first_name} ${person2.last_name});





// Defining object
let person = {
    first_name: 'Mukul',
    last_name: 'Latiyan',
 
    //method
    getFunction: function () {
        return (The name of the person is 
          ${person.first_name} ${person.last_name})
    },
    //object within object
    phone_number: {
        mobile: '12345',
        landline: '6789'
    }
}
*/
