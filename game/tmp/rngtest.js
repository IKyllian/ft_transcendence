

let i = 0;
let un = 0;
let deux= 0;
let trois= 0;
let quatre= 0;
let cinq= 0;
let six= 0;
let sept= 0;
let huit= 0;
let autre = 0;

while (i < 100000)
{
  
  let rd = Math.floor(Math.random() * (8 - 1 + 1)) + 1;
  
  switch(rd)
		{
			case 1:
        un++;			
				break;
			case 2:
				deux++;
				break;
			case 3:
				trois++;
				break;
			case 4:
				quatre++;
				break;
			case 5:
				cinq++;
				break;
			case 6:
				six++;
				break;
			case 7:
				sept++;
				break;
			case 8:
				huit++;
				break;
			default:
				autre++;
				break;
		}
	i++;
}


  console.log("1: ", un);
  console.log("2: ", deux);
  console.log("3: ", trois);
  console.log("4: ", quatre);
  console.log("5: ", cinq);
  console.log("6: ", six);
  console.log("7: ", sept);
  console.log("8: ", huit);
  console.log("autre: ", autre);